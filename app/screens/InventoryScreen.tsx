import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useProductContext, Product } from '../context/ProductContext';
import AddProductModal from '../components/AddProductsModal';
import EditProductModal from '../components/EditProductModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../theme/ThemeContext';

export default function InventoryScreen() {
    const theme = useColorScheme();
    const { theme: appTheme } = useThemeContext();
    const isDark = appTheme === 'dark';
  const { products, addProduct, deleteProduct, fetchProducts } = useProductContext();

  const [adding, setAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const stockLevel = (stock: number) => {
    if (stock < 5) return { label: 'Low', color: '#e53935', fraction: stock / 5 };
    if (stock < 20) return { label: 'Okay', color: '#fbc02d', fraction: (stock - 5) / 15 };
    return { label: 'High', color: '#24D164', fraction: 1 };
  };

  const renderStockBar = (stock: number) => {
    const { label, color, fraction } = stockLevel(stock);
    return (
      <View style={styles.stockContainer}>
        <View style={[styles.stockBarBg, { backgroundColor: isDark ? '#333' : '#ddd' }]}>
          <View style={[styles.stockBarFill, { backgroundColor: color, flex: fraction }]} />
        </View>
        <Text style={[styles.stockLabel, { color: isDark ? '#fff' : '#000' }]}>{label}</Text>
      </View>
    );
  };

  const confirmDelete = (prod: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${prod.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(prod.id),
        },
      ]
    );
  };

  const handleAdd = async (prodData: any) => {
    await addProduct(prodData);
    setAdding(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Inventory</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? '#1f1f1f' : '#f9f9f9' }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
                {item.name}
              </Text>
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => setEditingProduct(item)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="pencil-outline" size={20} color={isDark ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#e53935" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.cardText, { color: isDark ? '#ccc' : '#333' }]}>
              Code: {item.code}
            </Text>
            <Text style={[styles.cardText, { color: isDark ? '#ccc' : '#333' }]}>
              Type: {item.type}
            </Text>
            <View style={styles.stockRow}>
              {renderStockBar(item.stock ?? 0)}
              <Text style={[styles.stockNumber, { color: isDark ? '#fff' : '#000' }]}>
                {item.stock ?? 0}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <AddProductModal
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={handleAdd}
      />

      {editingProduct && (
        <EditProductModal
          visible={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={async () => {
            await fetchProducts();
            setEditingProduct(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  list: { paddingBottom: 100 },
  card: { borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row' },
  iconBtn: { paddingHorizontal: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardText: { fontSize: 14, marginTop: 4 },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  stockContainer: { flex: 1 },
  stockBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  stockBarFill: { height: 8 },
  stockLabel: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  stockNumber: { width: 36, textAlign: 'center', marginLeft: 8 },
  addBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#24D164',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
