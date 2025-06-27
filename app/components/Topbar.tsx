import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../theme/ThemeContext'; // adjust path
import InstallPWAButton from './InstallPWABtn';

export default function TopBar() {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.topBar, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
      
      <Text style={[styles.companyName, { color: isDark ? '#fff' : '#000' }]}>InvView</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Ionicons name="person-circle" size={30} color={isDark ? '#fff' : '#000'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
