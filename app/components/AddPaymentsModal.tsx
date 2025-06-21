// app/components/AddPaymentModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function AddPaymentModal({
  visible,
  transactionId,
  currentAmountPaid,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  transactionId: string;
  currentAmountPaid: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    const add = parseFloat(amount);
    if (!add || add <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid amount' });
      return;
    }

    const newTotal = currentAmountPaid + add;
    const { error } = await supabase
      .from('transactions')
      .update({ amount_paid: newTotal })
      .eq('id', transactionId);

    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to update', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Payment Added' });
      onSuccess();
      onClose();
      setAmount('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Add Payment</Text>
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
          <TouchableOpacity style={styles.btn} onPress={handlePayment}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ marginTop: 10, color: '#555', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066' },
  box: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  btn: { backgroundColor: '#24D164', padding: 12, borderRadius: 8, alignItems: 'center' },
});
