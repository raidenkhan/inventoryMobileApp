// app/screens/SuppliersListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountsStackParamList } from '../navigation/AccountsStack';

type NavigationProp = NativeStackNavigationProp<AccountsStackParamList, 'SuppliersList'>;

type Supplier = {
  id: string;
  name: string;
  balance?: number;
};

export default function SuppliersListScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const isDark = useColorScheme() === 'dark';
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) console.error('Error fetching suppliers:', error.message);
      else setSuppliers(data as Supplier[]);
    };
    fetchSuppliers();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Suppliers</Text>
      {suppliers.map((supplier) => (
        <TouchableOpacity
          key={supplier.id}
          style={[styles.card, { backgroundColor: isDark ? '#1f1f1f' : '#f0f0f0' }]}
          onPress={() => navigation.navigate('SupplierProfile', { supplier })}
        >
          <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>{supplier.name}</Text>
          <Text style={{ color: isDark ? '#ccc' : '#333' }}>Balance: GHS {supplier.balance || 0}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '600' },
});
