import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

type Props = {
  visible: boolean;
  onClose: () => void;
  existing?: any; // existing transaction for edit
  onSuccess: () => void;
};

export default function FactoryTransactionModal({ visible, onClose, existing, onSuccess }: Props) {
  const [supplier, setSupplier] = useState('');
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (existing) {
      setSupplier(existing.supplier_name || '');
      setTotal(existing.total_amount?.toString() || '');
      setPaid(existing.amount_paid?.toString() || '');
      setArrived(existing.goods_arrived || false);
    } else {
      setSupplier('');
      setTotal('');
      setPaid('');
      setArrived(false);
    }
  }, [visible, existing]);

  const handleSave = async () => {
    if (!supplier || !total || !paid) {
      Toast.show({ type: 'error', text1: 'Fill all required fields' });
      return;
    }

    const payload = {
      supplier_name: supplier,
      total_amount: parseFloat(total),
      amount_paid: parseFloat(paid),
      goods_arrived: arrived,
    };

    let result;
    if (existing?.id) {
      result = await supabase
        .from('factory_transactions')
        .update(payload)
        .eq('id', existing.id);
    } else {
      result = await supabase.from('factory_transactions').insert([payload]);
    }

    if (result.error) {
      Toast.show({ type: 'error', text1: 'Error', text2: result.error.message });
    } else {
      Toast.show({ type: 'success', text1: existing ? 'Transaction updated' : 'Transaction added' });
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{existing ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <TextInput
            placeholder="Supplier Name"
            value={supplier}
            onChangeText={setSupplier}
            style={styles.input}
          />
          <TextInput
            placeholder="Total Amount"
            value={total}
            onChangeText={setTotal}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Amount Paid"
            value={paid}
            onChangeText={setPaid}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={styles.switchRow}>
            <Text>Goods Arrived?</Text>
            <Switch value={arrived} onValueChange={setArrived} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#999' }]}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: '#24D164' }]}>
              <Text style={styles.btnText}>{existing ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 10, marginBottom: 10,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { padding: 12, borderRadius: 6, width: '48%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
