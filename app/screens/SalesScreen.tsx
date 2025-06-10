import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  useColorScheme,
} from 'react-native';
import { useProductContext, Product } from '../context/ProductContext';
import { useThemeContext } from '../theme/ThemeContext';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';
const paymentMethods = ['Cash', 'Mobile Money', 'Card', 'Bank Transfer'];
const saleTypes = ['In-store', 'Delivery'];
type SaleItem = {
  id: string; name: string; price: number; qty: number
};

type RecordSaleProps = {
  items: SaleItem[];
  total: number;
  paymentType: 'cash' | 'credit';
  supplierId?: string; // for deferred credit purchases
};


export async function recordSale({
  items,
  total,
  paymentType,
  supplierId,
}: RecordSaleProps) {
  // ✅ Insert into sales and return the new ID
  const { data: insertedSales, error: saleError } = await supabase
    .from('Sales')
    .insert([
      {
        items, // optional if stored as JSON
        total_amount: total,
        payment_method: paymentType,
      },
    ])
    .select('id') // 🟢 this is key!

  if (saleError || !insertedSales || insertedSales.length === 0) {
    Toast.show({ type: 'error', text1: 'Sale failed', text2: saleError?.message });
    return;
  }

  const saleId = insertedSales[0].id;

  // ✅ 2. Insert sale items
  const itemRows = items.map((item) => ({
    sale_id: saleId, // 🟢 correct sale_id from inserted sale
    product_id: item.id,
    quantity: item.qty,
    unit_price: item.price,
    total: item.qty * item.price,
  }));

  const { error: itemError } = await supabase.from('sale_items').insert(itemRows);

  if (itemError) {
    console.warn('Failed to insert sale_items:', itemError.message);
  }

  // ✅ 3. Update product stock levels
  for (const item of items) {
    const { data: productData, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single();

    if (!productData || fetchError) continue;

    const newStock = Math.max((productData.stock || 0) - item.qty, 0);

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.id);

    if (updateError) {
      console.warn(`Stock update failed for ${item.id}:`, updateError.message);
    }
  }

  // ✅ 4. Update supplier balance if credit
  if (paymentType === 'credit' && supplierId) {
    const { data: supplierData, error: fetchError } = await supabase
      .from('suppliers')
      .select('balance')
      .eq('id', supplierId)
      .single();

    if (supplierData && !fetchError) {
      const newBalance = (supplierData.balance || 0) + total;
      await supabase
        .from('suppliers')
        .update({ balance: newBalance })
        .eq('id', supplierId);
    }
  }

  // ✅ 5. Success Toast
  Toast.show({
    type: 'success',
    text1: 'Sale recorded',
    text2: `Total GHS ${total} processed`,
  });
}


export default function SalesScreen() {
   const theme = useColorScheme();
   const { theme: appTheme } = useThemeContext();
   const isDark = appTheme === 'dark';
  const { products } = useProductContext(); // <-- get products from context

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<
    SaleItem[]
  >([]);
  const [payment, setPayment] = useState<string | null>(null);
  const [saleType, setSaleType] = useState<string>(saleTypes[0]);

  // Filter the products by searchQuery
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateQty = (product: Product, qty: number) => {
    if (qty < 0) return;
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, qty } : c
        )
      );
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.stock!, qty }]);
    }
  };

  const handleIncrement = (p: Product) =>
    updateQty(p, (cart.find((c) => c.id === p.id)?.qty || 0) + 1);

  const handleDecrement = (p: Product) =>
    updateQty(p, Math.max((cart.find((c) => c.id === p.id)?.qty || 0) - 1, 0));

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const confirmSale = async () => {
    if (!payment || cart.every((p) => p.qty === 0)) {
      alert('Select at least one product and a payment method.');
      return;
    }
    recordSale({items:cart,total,paymentType:'cash',supplierId:''})
    alert(`Sale recorded. Total: GHS ${total}`);
    setCart([]);
    setPayment(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <TextInput
        placeholder="Search Product"
        placeholderTextColor={isDark ? '#aaa' : '#333'}
        style={[styles.searchInput, { backgroundColor: isDark ? '#2a2a2a' : '#eee', color: isDark ? '#fff' : '#000' }]}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredProducts.map((p) => {
        const selected = cart.find((c) => c.id === p.id);
        return (
          <View key={p.id} style={[styles.productRow, { backgroundColor: isDark ? '#1f1f1f' : '#f9f9f9' }]}>
            <View style={{ flex: 2 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>{p.name}</Text>
              <Text style={{ color: isDark ? '#ccc' : '#555' }}>GHS {p.stock}</Text>
            </View>

            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => handleDecrement(p)}>
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.qtyInput, { backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000' }]}
                keyboardType="numeric"
                value={(selected?.qty || 0).toString()}
                onChangeText={(text) => updateQty(p, parseInt(text) || 0)}
              />
              <TouchableOpacity onPress={() => handleIncrement(p)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Payment Method</Text>
      <View style={styles.optionsRow}>
        {paymentMethods.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.optionBtn, { backgroundColor: payment === m ? '#24D164' : isDark ? '#2a2a2a' : '#ddd' }]}
            onPress={() => setPayment(m)}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Sale Type</Text>
      <View style={styles.optionsRow}>
        {saleTypes.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.optionBtn, { backgroundColor: saleType === s ? '#24D164' : isDark ? '#2a2a2a' : '#ddd' }]}
            onPress={() => setSaleType(s)}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.totalText, { color: isDark ? '#fff' : '#000' }]}>Total: GHS {total}</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={confirmSale}>
          <Text style={{ color: '#fff' }}>Confirm Sale</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: { padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 14 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 10 },
  qtyControl: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 22, paddingHorizontal: 10, color: '#24D164' },
  qtyInput: { width: 40, textAlign: 'center', marginHorizontal: 4, padding: 6, borderRadius: 6, fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  optionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  footer: { marginTop: 20, alignItems: 'center' },
  totalText:{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  confirmBtn:{ backgroundColor: '#24D164', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 40 }
});
