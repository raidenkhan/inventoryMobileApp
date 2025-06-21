// app/screens/FactoryTransactionsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useThemeContext } from '../theme/ThemeContext';
import FactoryTransactionModal from '../components/AddFactoryTransactionModal';
import AddPaymentModal from '../components/AddPaymentsModal';

interface FactoryTransaction {
  id: string;
  supplier_id: string;
  description: string;
  total_amount: number;
  amount_paid: number;
  has_arrived: boolean;
  expected_arrival: string | null;
  actual_arrival: string | null;
  created_at: string;
  supplier_name?: string;
}

export default function FactoryTransactionsScreen() {
  const [transactions, setTransactions] = useState<FactoryTransaction[]>([]);
  const isDark = useThemeContext().theme === 'dark';
  const scheme = useColorScheme();
  const [showModal, setShowModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState<FactoryTransaction | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<FactoryTransaction | null>(null);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
    
      const mapped = data.map((tx: any) => ({
        ...tx,
        supplier_name: tx.suppliers?.name || 'Unknown',
      }));
      setTransactions(mapped);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Factory Transactions</Text>

      {transactions.map((txn) => (
        <View key={txn.id} style={[styles.card, { backgroundColor: isDark ? '#1f1f1f' : '#f0f0f0' }]}>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>Supplier: {txn.supplier_name}</Text>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>Description: {txn.description}</Text>
          <Text style={{ color: isDark ? '#fff' : '#000' }}>
            Paid: GHS {txn.amount_paid} / {txn.total_amount}
          </Text>
          <Text style={{ color: isDark ? '#ccc' : '#555' }}>
            Status: {txn.has_arrived ? 'Arrived ✓' : 'In Transit'}
          </Text>
          {txn.expected_arrival && (
            <Text style={{ color: isDark ? '#aaa' : '#666' }}>
              ETA: {new Date(txn.expected_arrival).toDateString()}
            </Text>
            
          )}
          <Text style={{ color: isDark ? '#aaa' : '#444' }}>
  Payment Status: {txn.amount_paid >= txn.total_amount ? '✅ Completed' : '⏳ Incomplete'}
</Text>


          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: '#555', marginTop: 6 }]}
            onPress={() => {
              setEditingTxn(txn);
              setShowModal(true);
            }}
          >
            <Text style={{ color: '#fff' }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: '#007bff', marginTop: 6 }]}
            onPress={() => {
              setSelectedTxn(txn);
              setShowPaymentModal(true);
            }}
          >
            <Text style={{ color: '#fff' }}>Add Payment</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: '#24D164' }]}
        onPress={() => {
          setEditingTxn(null);
          setShowModal(true);
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Transaction</Text>
      </TouchableOpacity>

      <FactoryTransactionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        existing={editingTxn}
        onSuccess={fetchTransactions}
      />

      <AddPaymentModal
        visible={showPaymentModal}
        transactionId={selectedTxn?.id || ''}
        currentAmountPaid={selectedTxn?.amount_paid || 0}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={fetchTransactions}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  label: { fontWeight: '600', marginBottom: 4 },
  addBtn: {
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  completeBtn: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});
