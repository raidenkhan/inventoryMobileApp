import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ThemeProvider } from './app/theme/ThemeContext';
import TabNavigator from './app/navigation/TabNavigator';
import TopBar from './app/components/Topbar';
import Toast from 'react-native-toast-message';
import { ProductProvider } from './app/context/ProductContext';
import InstallPWAButton from './app/components/InstallPWABtn';
import { useEffect } from 'react';

export default function App() {
  // Add this to your App.js or main component
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}, []);
  return (
    <ProductProvider>
      <ThemeProvider>
        <SafeAreaView style={styles.container}>
          <InstallPWAButton />
          <TopBar />
          <View style={styles.content}>
            <TabNavigator />
          </View>
          <Toast position="bottom" />
        </SafeAreaView>
      </ThemeProvider>
    </ProductProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', // Ensures vertical stacking
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, // Ensures TabNavigator expands below the TopBar
  },
});
