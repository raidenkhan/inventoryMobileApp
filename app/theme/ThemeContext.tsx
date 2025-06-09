import { createContext, useContext, useState, ReactNode } from 'react'
import { useColorScheme } from 'react-native'

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme()
  const [theme, setTheme] = useState(system || 'light')

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => useContext(ThemeContext)
