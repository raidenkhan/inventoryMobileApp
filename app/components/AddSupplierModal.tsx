// app/components/AddSupplierModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

export default function AddSupplierModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd?: (supplier: any) => void;
}) {
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState('');
  const [contact_info, setContact] = useState('');
  const [balance, setBalance] = useState('');

  const handleSubmit = async () => {
    if (!name) return;

    const newSupplier = {
      name,
      contact_info,
      balance: parseFloat(balance) || 0,
    };
    console.log(newSupplier)
    const { data, error } = await supabase.from('suppliers').insert([newSupplier]);

   if (error) {
  console.error('Failed to add supplier:', error.message);
  Toast.show({
    type: 'error',
    text1: 'Failed to add supplier',
    text2: error.message,
  });
} else {
  onClose(); // 👈 close immediately
  Toast.show({
    type: 'success',
    text1: 'Supplier Added',
    text2: `${name} has been saved successfully`,
  });

  onAdd?.(data?.[0]);
  setName('');
  setContact('');
  setBalance('');
}
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Add Supplier</Text>

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
          />

          <TextInput
            placeholder="Contact Info"
            value={contact_info}
            onChangeText={setContact}
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
          />

          <TextInput
            placeholder="Opening Balance (GHS)"
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
            placeholderTextColor={isDark ? '#aaa' : '#555'}
            style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#fff' : '#000' }]}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={{ color: '#fff' }}>Add</Text>
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
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    padding: 20,
  },
  title: {
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
  row: {
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
