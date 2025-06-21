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

export default function showListModal({
  visible,
  onClose,
  onAdd,
  salesData,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
  salesData?: {
    id: string;
    product: string;
    quantity: string;
    total:string;

  }[];
}) {
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}>
          <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
            All Sales
          </Text>
            {salesData?.map(sale => (
                     <View key={sale.id} style={styles.saleItem}>
                       <Text style={styles.saleText}>{sale.product}</Text>
                       <Text style={styles.saleText}>Qty: {sale.quantity}</Text>
                       <Text style={styles.saleText}>${sale.total}</Text>
                     </View>
                   ))}
            
      

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: '#333' }}>Close</Text>
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
  saleText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
    },
});
