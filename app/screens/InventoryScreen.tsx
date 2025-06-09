import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddProductModal from '../components/AddProductsModal';
import EditProductModal from '../components/EditProductModal';
import { useThemeContext } from '../theme/ThemeContext';
import { supabase } from '../../lib/supabase';

type Product = {
  id: string;
  name: string;
  type: string;
  stock?: number;
};

const initialProducts: Product[] = [
  { id: '0001', name: 'MacBook Pro', type: 'Laptop', stock: 8 },
  { id: '0002', name: 'iPhone 14 Pro', type: 'Phone', stock: 2 }, // 🔴 low
  { id: '0003', name: 'Zoom75', type: 'Keyboard', stock: 10 },
  { id: '0004', name: 'Airpods Pro', type: 'Earphones' },
  { id: '0005', name: 'Galaxy Fold', type: 'Phone' },
  { id: '0006', name: 'Logitech Superlight', type: 'Mouse' },
];

export default function InventoryScreen() {
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const theme = useColorScheme();
  const isDark = useThemeContext().theme;

  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        console.error('Failed to fetch products:', error.message);
      } else if (data) {
        setProductList(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Reset to page 1 if productList changes (e.g. new product added)
  useEffect(() => {
    setCurrentPage(1);
  }, [productList]);

  // Pagination logic
  const totalPages = Math.ceil(productList.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productList.slice(indexOfFirstProduct, indexOfLastProduct);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? '#121212' : '#f9f9f9', justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={isDark ? '#24D164' : '#24D164'} />
        <Text style={{ marginTop: 10, color: isDark ? '#fff' : '#000' }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={[styles.activityCard, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}>
        <Text style={[styles.activityTitle, { color: isDark ? '#fff' : '#000' }]}>Recent Activity</Text>
        <View style={styles.activityRow}>
          <Text style={{ color: 'green' }}>Restocked: 6 Products</Text>
          <Text style={{ color: 'red' }}>Sold: 2 Products</Text>
        </View>
      </View>

      {/* Product List Header */}
      <View style={[styles.tableHeader, { backgroundColor: isDark ? '#1a1a1a' : '#efefef' }]}>
        <Text style={[styles.headerCell, { color: isDark ? '#ccc' : '#333' }]}>Name</Text>
        <Text style={[styles.headerCell, { color: isDark ? '#ccc' : '#333' }]}>Code</Text>
        <Text style={[styles.headerCell, { color: isDark ? '#ccc' : '#333' }]}>Stock</Text>
      </View>

      {/* Product List */}
      <ScrollView style={{ marginBottom: 20 }}>
        {currentProducts.map((p, idx) => (
          <View
            key={p.id}
            style={[
              styles.productRow,
              {
                backgroundColor:
                  idx % 2 === 0 ? (isDark ? '#2a2a2a' : '#fff') : (isDark ? '#202020' : '#f7f7f7'),
              },
            ]}
          >
            <Text style={[styles.cellText, { color: isDark ? '#fff' : '#000' }]}>{p.name}</Text>
            <Text style={[styles.cellText, { color: isDark ? '#fff' : '#000' }]}>#{p.id.substring(0, 5)}</Text>
            <Text style={[styles.cellText, { color: isDark ? '#fff' : '#000' }]}>{p.stock ?? 0}</Text>

            {/* Low Stock Badge */}
            {typeof p.stock === 'number' && p.stock < 5 && (
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockText}>Low</Text>
              </View>
            )}

            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => {
                setSelectedProduct(p);
                setEditModalVisible(true);
              }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={isDark ? '#ccc' : '#333'} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ marginHorizontal: 6, opacity: currentPage === 1 ? 0.3 : 1 }}
        >
          <Text style={{ color: isDark ? '#ccc' : '#666', fontSize: 18 }}>◄</Text>
        </TouchableOpacity>

        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = pageNum === currentPage;
          return (
            <TouchableOpacity
              key={pageNum}
              onPress={() => goToPage(pageNum)}
              style={{
                marginHorizontal: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: isActive ? '#24D164' : 'transparent',
              }}
            >
              <Text style={{ color: isActive ? '#fff' : isDark ? '#ccc' : '#666', fontWeight: isActive ? 'bold' : 'normal' }}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ marginHorizontal: 6, opacity: currentPage === totalPages ? 0.3 : 1 }}
        >
          <Text style={{ color: isDark ? '#ccc' : '#666', fontSize: 18 }}>►</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddProductModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={(product) => {
          console.log('New Product Added:', product);
          setProductList([...productList, product]);
        }}
      />
      {selectedProduct && (
        <EditProductModal
          visible={editModalVisible}
          product={selectedProduct}
          onClose={() => setEditModalVisible(false)}
          onSave={(updated) => {
            const updatedList = productList.map((p) => (p.id === updated.id ? updated : p));
            setProductList(updatedList);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '600' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#24D164',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    paddingLeft: 10,
  },
  productRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 6,
  },
  cellText: {
    flex: 1,
    fontSize: 14,
  },
  lowStockBadge: {
    backgroundColor: '#e02424',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  lowStockText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
