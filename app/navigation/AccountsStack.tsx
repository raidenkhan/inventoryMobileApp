import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountsScreen from '../screens/AccountsScreen';
import SuppliersListScreen from '../screens/SuppliersListScreen';
import SupplierProfileScreen from '../screens/SupplierProfileScreen';
import FactoryTransactionsScreen from '../screens/FactoryTransactionsScreen';

//const Stack = createNativeStackNavigator();
export type AccountsStackParamList = {
  AccountsHome: undefined;
  SuppliersList: undefined;
  SupplierProfile: { supplier: { id: string; name: string; balance?: number } };
  FactoryTransactions: undefined;
};


const Stack = createNativeStackNavigator<AccountsStackParamList>();
export default function AccountsStack() {
  return (
    <Stack.Navigator initialRouteName='AccountsHome'>
      <Stack.Screen name="AccountsHome" component={AccountsScreen} options={{ title: 'Accounts' }} />
      <Stack.Screen name="SuppliersList" component={SuppliersListScreen} options={{ title: 'Suppliers' }} />
      <Stack.Screen name="SupplierProfile" component={SupplierProfileScreen} options={{ title: 'Supplier Details' }} />
      <Stack.Screen
  name="FactoryTransactions"
  component={FactoryTransactionsScreen}
  options={{ title: 'Factory Transactions' }}
/>

    </Stack.Navigator>
  );
}
