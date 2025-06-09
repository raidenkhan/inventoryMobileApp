import React from 'react'
import { View, StyleSheet, Text } from 'react-native'

function SettingsScreen() {
  return (
   
        <View style={styles.container}>
            <View style={styles.innerBox}>
            <Text style={styles.title}>
                Settings
            </Text>
            <Text style={styles.subtitle}>
                This is the settings screen.
            </Text>
            </View>
        </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  subtitle: {
    color: '#4a5568',
    marginTop: 8,
  },
})

export default SettingsScreen