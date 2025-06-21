import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';

export default function AddProductModal({
  visible,
  onClose,
  onAdd,
  initialData,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
  initialData?: {
    name: string;
    unitPrice: string;
    stock: string;
  };
}) {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setUnitPrice(initialData.unitPrice?.toString() || '');
      setStock(initialData.stock || '');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name || !unitPrice || !stock) return;

    const parsedPrice = parseFloat(unitPrice);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) return;

    const newProduct = {
      name,
      code,
      unitPrice: parsedPrice,
      stock: parsedStock,
    };

    onAdd(newProduct);

    setName('');
    setUnitPrice('');
    setStock('');
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}>
          <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
            Add New Product
          </Text>

          <TextInput
            placeholder="Product Name"
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Unit Price"
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
            keyboardType="decimal-pad"
            value={unitPrice}
            onChangeText={setUnitPrice}
          />

          <TextInput
            placeholder="Stock Quantity"
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
            keyboardType="number-pad"
            value={stock}
            onChangeText={setStock}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  saveBtn: {
    padding: 10,
    backgroundColor: '#24D164',
    borderRadius: 6,
  },
});
