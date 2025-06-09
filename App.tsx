import { ThemeProvider } from './app/theme/ThemeContext'
import TabNavigator from './app/navigation/TabNavigator'
import TopBar from './app/components/Topbar'


export default function App() {
  return (
    <ThemeProvider>
      <TopBar/>
      <TabNavigator />
    </ThemeProvider>
  )
}
