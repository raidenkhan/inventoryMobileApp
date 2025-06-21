// app/screens/AccountsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { AccountsStackParamList } from '../navigation/AccountsStack';
import { useThemeContext } from '../theme/ThemeContext';

type NavigationProp = NativeStackNavigationProp<AccountsStackParamList, 'AccountsHome'>;

type Transaction = {
  id: string;
  type: 'purchase' | 'payment';
  description: string;
  amount: number;
};

type Supplier = {
  id: string;
  name: string;
  balance?: number;
};

export default function AccountsScreen() {
  const isDark = useThemeContext().theme;
  const navigation = useNavigation<NavigationProp>();

  const [supplierCount, setSupplierCount] = useState<number>(0);
  const [totalOwed, setTotalOwed] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchSummary();
    fetchRecentTransactions();
  }, []);

  const fetchSummary = async () => {
    const { data: suppliers, error } = await supabase.from('suppliers').select('*');

    if (error || !suppliers) {
      console.error('Supplier fetch error:', error?.message);
      return;
    }

    setSupplierCount(suppliers.length);
    const total = suppliers.reduce((sum, s: Supplier) => sum + (s.balance || 0), 0);
    setTotalOwed(total);
  };

  const fetchRecentTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !data) {
      console.error('Transactions fetch error:', error?.message);
    } else {
      setRecentTransactions(data as Transaction[]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Accounts Overview</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.card, { backgroundColor: '#FFDD57' }]}>
          <Text style={styles.cardTitle}>Suppliers</Text>
          <Text style={styles.cardValue}>{supplierCount}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FF6B6B' }]}>
          <Text style={styles.cardTitle}>Total Owed (GHS)</Text>
          <Text style={styles.cardValue}>{totalOwed}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#24D164' }]}
        onPress={() => navigation.navigate('SuppliersList')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>View All Suppliers</Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.button, { backgroundColor: '#007AFF' }]}
  onPress={() => navigation.navigate('FactoryTransactions')}
>
  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Factory Transactions</Text>
</TouchableOpacity>


      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Recent Transactions</Text>

      {recentTransactions.length === 0 ? (
        <Text style={{ color: isDark ? '#aaa' : '#555' }}>No recent transactions found.</Text>
      ) : (
        recentTransactions.map((txn) => (
          <View key={txn.id} style={[styles.txnItem, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}>
            <Text style={[styles.txnText, { color: isDark ? '#fff' : '#000' }]}>
              {txn.type.toUpperCase()} - {txn.description}
            </Text>
            <Text
              style={[
                styles.txnAmount,
                { color: txn.type === 'payment' ? 'green' : 'red' },
              ]}
            >
              {txn.type === 'payment' ? '+' : '-'} GHS {txn.amount}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  txnItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  txnText: { fontSize: 14 },
  txnAmount: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
});
