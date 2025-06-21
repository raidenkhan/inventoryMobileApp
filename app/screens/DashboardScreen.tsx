// app/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type RawSaleItem = {
  id: string;
  quantity: number;
  total: number;
  created_at: string;
  product_id: string;
  products?: { name: string };
};

type Product = {
  id: string;
  name: string;
  stock: number;
};

export default function DashboardScreen() {
  const theme = useColorScheme();
  const { theme: appTheme } = useThemeContext();
  const isDark = appTheme === 'dark';
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const styles = getStyles(isDark, isTablet);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [recentSales, setRecentSales] = useState<{ id: string; product: string; quantity: number; total: number }[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<number[]>([]);
  const [itemsInStock, setItemsInStock] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }).start();
}, []);

useFocusEffect(
  useCallback(() => {
    loadDashboardData();
  }, [])
);

  const loadDashboardData = async () => {
  setLoading(true);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sale_items')
    .select('id, quantity, total, created_at, product_id, products(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error.message);
    setLoading(false);
    return;
  }

  const items = data as unknown as RawSaleItem[];

  const recent = items.slice(0, 3).map(item => ({
    id: item.id,
    product: item.products?.name ?? 'Unknown',
    quantity: item.quantity,
    total: item.total,
  }));

  const salesPerWeek = [0, 0, 0, 0];
  const topMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  let todayTotal = 0;

  items.forEach(item => {
    const date = new Date(item.created_at);
    const week = Math.floor((date.getDate() - 1) / 7);
    salesPerWeek[week] += item.total;

    if (item.products?.name) {
      const name = item.products.name;
      if (!topMap[name]) topMap[name] = { name, qty: 0, revenue: 0 };
      topMap[name].qty += item.quantity;
      topMap[name].revenue += item.total;
    }

    if (item.created_at.startsWith(today)) {
      todayTotal += item.total;
    }
  });

  const topList = Object.values(topMap).sort((a, b) => b.qty - a.qty).slice(0, 3);
   const fetchStock = async () => {
      const { data, error } = await supabase.from('products').select('stock');
      if (!error && data) {
        const stocks = data as Product[];
        const total = stocks.reduce((sum, p) => sum + p.stock, 0);
        const low = stocks.filter(p => p.stock < 5).length;
        setItemsInStock(total);
        setLowStockCount(low);
      }
    };
    fetchStock()
  setRecentSales(recent);
  setTopProducts(topList);
  setSalesData(salesPerWeek);
  setSalesToday(todayTotal);
  setLoading(false);
};


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('sale_items')
        .select('id, quantity, total, created_at, product_id, products(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error.message);
        setLoading(false);
        return;
      }

      const items = data as unknown as RawSaleItem[];

      const recent = items.slice(0, 3).map(item => ({
        id: item.id,
        product: item.products?.name ?? 'Unknown',
        quantity: item.quantity,
        total: item.total,
      }));

      const salesPerWeek = [0, 0, 0, 0];
      const topMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      let todayTotal = 0;

      items.forEach(item => {
        const date = new Date(item.created_at);
        const week = Math.floor((date.getDate() - 1) / 7);
        salesPerWeek[week] += item.total;

        if (item.products?.name) {
          const name = item.products.name;
          if (!topMap[name]) topMap[name] = { name, qty: 0, revenue: 0 };
          topMap[name].qty += item.quantity;
          topMap[name].revenue += item.total;
        }

        if (item.created_at.startsWith(today)) {
          todayTotal += item.total;
        }
      });

      const topList = Object.values(topMap).sort((a, b) => b.qty - a.qty).slice(0, 3);

      setRecentSales(recent);
      setTopProducts(topList);
      setSalesData(salesPerWeek);
      setSalesToday(todayTotal);
      setLoading(false);
    };

    const fetchStock = async () => {
      const { data, error } = await supabase.from('products').select('stock');
      if (!error && data) {
        const stocks = data as Product[];
        const total = stocks.reduce((sum, p) => sum + p.stock, 0);
        const low = stocks.filter(p => p.stock < 5).length;
        setItemsInStock(total);
        setLowStockCount(low);
      }
    };

    fetchData();
    fetchStock();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#24D164" />
        <Text style={{ marginTop: 10, color: isDark ? '#fff' : '#000' }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.cardRow}>
        <MetricCard icon="soccer" label="Items in Stock" value={itemsInStock} color="green" />
        <MetricCard icon="cash" label="Sales Today" value={`GHS ${salesToday}`} color="blue" />
        <MetricCard icon="alert-circle" label="Low Stock" value={lowStockCount} color="red" />
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.sectionTitle}>Monthly Sales Summary</Text>
        <LineChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                data: salesData,
              },
            ],
          }}
          width={width - 40}
          height={220}
          yAxisLabel="GHS "
          chartConfig={{
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
            backgroundGradientFrom: isDark ? '#1e1e1e' : '#fff',
            backgroundGradientTo: isDark ? '#1e1e1e' : '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => (isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`),
            labelColor: () => (isDark ? '#fff' : '#000'),
            propsForDots: {
              r: '4',
              strokeWidth: '1',
              stroke: isDark ? '#fff' : '#000',
            },
          }}
          bezier
          style={{ borderRadius: 10 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {topProducts.length === 0 ? (
            <Text style={{ color: isDark ? '#aaa' : '#555' }}>No top products found.</Text>
          ) : (
            topProducts.map((product, idx) => (
              <View key={idx} style={styles.topProductCard}>
                <Text style={styles.saleText}>{product.name}</Text>
                <Text style={styles.saleText}>Sold: {product.qty}</Text>
                <Text style={styles.saleText}>Revenue: GHS {product.revenue}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Breakdown</Text>
        {topProducts.length === 0 ? (
          <Text style={{ color: isDark ? '#aaa' : '#555' }}>No data for pie chart.</Text>
        ) : (
          <PieChart
            data={topProducts.map((p, i) => ({
              name: p.name,
              sales: p.revenue,
              color: ['#00C49F', '#FFBB28', '#FF8042'][i % 3],
              legendFontColor: isDark ? '#fff' : '#000',
              legendFontSize: 14,
            }))}
            width={width - 40}
            height={220}
            chartConfig={{
              color: () => (isDark ? '#fff' : '#000'),
            }}
            accessor="sales"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
      </View>
    </Animated.ScrollView>
  );
}

function MetricCard({ icon, label, value, color }: any) {
  const systemTheme = useColorScheme();
  const { theme: contextTheme } = useThemeContext();
  const isDark = (contextTheme ?? systemTheme) === 'dark';

  return (
    <View
      style={[cardStyles.card, { backgroundColor: isDark ? '#1f1f1f' : '#fff' }]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[cardStyles.cardLabel, { color: isDark ? '#fff' : '#333' }]}>{label}</Text>
      <Text style={[cardStyles.cardValue, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
    </View>
  );
}


const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    flexGrow: 1,
    flexBasis: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 100,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: '#333',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});

function getStyles(isDark: boolean, isTablet: boolean) {
  return StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      padding: 20,
      marginBottom: 10
    },
    companyName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
    },
    graphContainer: {
      marginTop: 20,
      marginBottom: 10,
    },
    section: {
      marginTop: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    seeAllText: {
      fontSize: 14,
      color: '#4A90E2',
      fontWeight: '600',
    },
    saleItem: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      backgroundColor: isDark ? '#2a2a2a' : '#e9e9e9',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    saleText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
    },
    topProductCard: {
      backgroundColor: isDark ? '#1f1f1f' : '#fff',
      padding: 12,
      borderRadius: 10,
      marginRight: 12,
      width: 140,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    topProductCardText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
      marginBottom: 4,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 10,
    },
    actionCard: {
      width: '47%',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: 8,
    },
  });
}