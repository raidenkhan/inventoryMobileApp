// app/screens/SupplierProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { supabase } from '../../lib/supabase';
import AddTransactionModal from '../components/AddTransactionModal';
import { RouteProp, useRoute } from '@react-navigation/native';

  interface Supplier {
  id: string;
  name: string;
  balance?: number;
}

interface Transaction {
  id: string;
  supplier_id: string;
  type: 'purchase' | 'payment';
  description: string;
  amount: number;
  date: string;
}
export default function SupplierProfileScreen() {
const route = useRoute<RouteProp<{ params: { supplier: Supplier } }, 'params'>>();
  const { supplier } = route.params;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    const fetchTxns = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('supplier', supplier.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error.message);
      else setTransactions(data);
    };

    fetchTxns();
  }, []);


  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{supplier.name}</Text>
      <Text style={{ color: isDark ? '#aaa' : '#333' }}>Balance: GHS {supplier.balance || 0}</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Transaction</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Transaction History</Text>
      {transactions.map((txn) => (
        <View key={txn.id} style={[styles.txnRow, { backgroundColor: isDark ? '#1f1f1f' : '#eee' }]}>
          <Text style={{ color: isDark ? '#fff' : '#000' }}>{txn.type.toUpperCase()}: {txn.description}</Text>
          <Text style={{ color: txn.type === 'payment' ? 'green' : 'red' }}>GHS {txn.amount}</Text>
        </View>
      ))}

      <AddTransactionModal
        visible={modalVisible}
        supplierId={supplier.id}
        onClose={() => setModalVisible(false)}
        onSuccess={(txn) => setTransactions((prev) => [txn, ...prev])}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  addBtn: {
    backgroundColor: '#24D164',
    padding: 10,
    borderRadius: 6,
    marginVertical: 12,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  txnRow: { padding: 12, borderRadius: 8, marginBottom: 8 },
});
