import { ThemeProvider } from './app/theme/ThemeContext'
import TabNavigator from './app/navigation/TabNavigator'
import TopBar from './app/components/Topbar'
import Toast from 'react-native-toast-message'
import { ProductProvider } from './app/context/ProductContext'


export default function App() {
  return (
    <ProductProvider>
    <ThemeProvider>
      <TopBar/>
      <TabNavigator />
      <Toast position='bottom'/>
    </ThemeProvider>
    </ProductProvider>

  )
}
