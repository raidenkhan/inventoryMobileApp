import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../screens/DashboardScreen';
import Inventory from '../screens/InventoryScreen';
import Settings from '../screens/SettingsScreen';
import SalesScreen from '../screens/SalesScreen';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import AccountsStack from './AccountsStack';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: 'white' },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Inventory') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }else if(route.name==='Sales'){
              iconName=focused ? 'cash' : 'cash-outline'
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#24D164',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Inventory" component={Inventory} />
        <Tab.Screen name="Sales" component={SalesScreen}/>
        {/* <Tab.Screen name="Settings" component={Settings} /> */}
        <Tab.Screen
  name="Accounts"
  component={AccountsStack}
  options={{
    tabBarLabel: 'Accounts',
    tabBarIcon: ({ color }) => (
      <Ionicons name="document-text-outline" size={20} color={color} />
    ),
  }}
/>
      </Tab.Navigator>
      
    </NavigationContainer>
  );
}
