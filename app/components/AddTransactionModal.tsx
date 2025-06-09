// app/components/AddTransactionModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';


interface AddTransactionModalProps {
  visible: boolean;
  supplierId: string;
  onClose: () => void;
  onSuccess: (txn: any) => void;
}
export default function AddTransactionModal({ visible, supplierId, onClose, onSuccess }:AddTransactionModalProps ) {
  const [type, setType] = useState<'purchase' | 'payment'>('purchase');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!amount || !description) return;
    const txn = {
      supplier_id: supplierId,
      type,
      amount: parseInt(amount),
      description,
      date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('transactions').insert([txn]).select();
    if (!error) {
      onSuccess(data[0]);
      onClose();
      setAmount('');
      setDescription('');
    } else {
      console.error('Transaction error:', error.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Add {type === 'purchase' ? 'Purchase' : 'Payment'}</Text>

          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setType('purchase')}>
              <Text style={[styles.toggle, type === 'purchase' && styles.activeToggle]}>Purchase</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('payment')}>
              <Text style={[styles.toggle, type === 'payment' && styles.activeToggle]}>Payment</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Amount"
            keyboardType="number-pad"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            placeholder="Description"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  toggle: { padding: 8, borderWidth: 1, borderRadius: 6 },
  activeToggle: { backgroundColor: '#24D164', color: '#fff' },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10, backgroundColor: '#eee', borderRadius: 6 },
  saveBtn: { padding: 10, backgroundColor: '#24D164', borderRadius: 6 },
});
