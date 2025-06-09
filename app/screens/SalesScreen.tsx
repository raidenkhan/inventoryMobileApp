import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useThemeContext } from '../theme/ThemeContext';

const dummyProducts = [
  { id: '1', name: 'Footbal Jersey', price: 100 },
  { id: '2', name: 'Soccer Ball', price: 80 },
  { id: '3', name: 'Cleats', price: 150 },
  { id: '4', name: 'Shin Guards', price: 50 },
  { id: '5', name: 'Gloves', price: 60 },
];

const paymentMethods = ['Cash', 'Mobile Money', 'Card', 'Bank Transfer'];
const saleTypes = ['In-store', 'Delivery'];
type Product = {
  id: string;
  name: string;
  price: number;
};



export default function SalesScreen() {
  const theme = useColorScheme();
  const isDark =useThemeContext().theme;

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [payment, setPayment] = useState<string | null>(null);
  const [saleType, setSaleType] = useState<string>('In-store');

  const filteredProducts = dummyProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateQty = (product:Product, qty:number) => {
    if (qty < 0) return;
    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === product.id ? { ...p, qty } : p
        )
      );
    } else {
      setCart([...cart, { ...product, qty }]);
    }
  };

  const handleIncrement = (product:Product) => {
    const existing = cart.find((p) => p.id === product.id);
    const qty = existing ? existing.qty + 1 : 1;
    updateQty(product, qty);
  };

  const handleDecrement = (product:Product) => {
    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      const qty = Math.max(0, existing.qty - 1);
      updateQty(product, qty);
    }
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const confirmSale = () => {
    if (!payment || cart.every(p => p.qty === 0)) {
      alert('Select at least one product and a payment method.');
      return;
    }
    // TODO: Save sale logic
    alert(`Sale recorded. Total: GHS ${total}`);
    setCart([]);
    setPayment(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#fff', padding: 16 }}>
      <TextInput
        placeholder="Search Product"
        placeholderTextColor={isDark ? '#aaa' : '#333'}
        style={[
          styles.searchInput,
          { backgroundColor: isDark ? '#2a2a2a' : '#eee', color: isDark ? '#fff' : '#000' },
        ]}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredProducts.map((p) => {
        const selected = cart.find((item) => item.id === p.id);
        return (
          <View
            key={p.id}
            style={[
              styles.productRow,
              { backgroundColor: isDark ? '#1f1f1f' : '#f9f9f9' },
            ]}
          >
            <View style={{ flex: 2 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: '600' }}>{p.name}</Text>
              <Text style={{ color: isDark ? '#ccc' : '#555' }}>GHS {p.price}</Text>
            </View>

            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => handleDecrement(p)}>
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.qtyInput,
                  { backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000' },
                ]}
                keyboardType="numeric"
                value={(selected?.qty || 0).toString()}
                onChangeText={(text) => updateQty(p, parseInt(text || '0'))}
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
            style={[
              styles.optionBtn,
              {
                backgroundColor: payment === m ? '#24D164' : isDark ? '#2a2a2a' : '#ddd',
              },
            ]}
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
            style={[
              styles.optionBtn,
              {
                backgroundColor: saleType === s ? '#24D164' : isDark ? '#2a2a2a' : '#ddd',
              },
            ]}
            onPress={() => setSaleType(s)}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.totalText, { color: isDark ? '#fff' : '#000' }]}>
          Total: GHS {total}
        </Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={confirmSale}>
          <Text style={{ color: '#fff' }}>Confirm Sale</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    fontSize: 22,
    paddingHorizontal: 10,
    color: '#24D164',
  },
  qtyInput: {
    width: 40,
    textAlign: 'center',
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 6,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: '#24D164',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom:40
  },
});
