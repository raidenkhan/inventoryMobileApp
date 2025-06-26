// app/screens/DashboardScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../../lib/supabase';

// Types
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

type ProcessedData = {
  recentSales: { id: string; product: string; quantity: number; total: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  salesData: number[];
  salesToday: number;
};

// Memoized MetricCard component
interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const MetricCard = React.memo(({ icon, label, value, color }: MetricCardProps) => {
  const systemTheme = useColorScheme();
  const { theme: contextTheme } = useThemeContext();
  const isDark = (contextTheme ?? systemTheme) === 'dark';

  const cardStyle = useMemo(() => [
    cardStyles.card,
    { backgroundColor: isDark ? '#1f1f1f' : '#fff' }
  ], [isDark]);

  return (
    <View style={cardStyle}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      <Text style={[cardStyles.cardLabel, { color: isDark ? '#fff' : '#333' }]}>{label}</Text>
      <Text style={[cardStyles.cardValue, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
    </View>
  );
});

export default function DashboardScreen() {
  const theme = useColorScheme();
  const { theme: appTheme } = useThemeContext();
  const isDark = appTheme === 'dark';
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State
  const [recentSales, setRecentSales] = useState<{ id: string; product: string; quantity: number; total: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [salesData, setSalesData] = useState<number[]>([0, 0, 0, 0]);
  const [itemsInStock, setItemsInStock] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [salesToday, setSalesToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized styles
  const styles = useMemo(() => getStyles(isDark, isTablet), [isDark, isTablet]);

  // Optimized data processing function
  const processData = useCallback((items: RawSaleItem[]): ProcessedData => {
    const today = new Date().toISOString().split('T')[0];
    const salesPerWeek = [0, 0, 0, 0];
    const topMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    let todayTotal = 0;

    // Single loop to process all data
    for (const item of items) {
      // Process weekly sales
      const date = new Date(item.created_at);
      const week = Math.min(3, Math.floor((date.getDate() - 1) / 7));
      salesPerWeek[week] += item.total;

      // Process top products
      if (item.products?.name) {
        const name = item.products.name;
        if (!topMap[name]) {
          topMap[name] = { name, qty: 0, revenue: 0 };
        }
        topMap[name].qty += item.quantity;
        topMap[name].revenue += item.total;
      }

      // Process today's sales
      if (item.created_at.startsWith(today)) {
        todayTotal += item.total;
      }
    }

    const recentSales = items.slice(0, 3).map(item => ({
      id: item.id,
      product: item.products?.name ?? 'Unknown',
      quantity: item.quantity,
      total: item.total,
    }));

    const topProducts = Object.values(topMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);

    return {
      recentSales,
      topProducts,
      salesData: salesPerWeek,
      salesToday: todayTotal,
    };
  }, []);

  // Optimized fetch functions with parallel execution
  const fetchAllData = useCallback(async () => {
    try {
      // Execute both queries in parallel
      const [salesResult, stockResult] = await Promise.all([
        supabase
          .from('sale_items')
          .select('id, quantity, total, created_at, product_id, products(name)')
          .order('created_at', { ascending: false })
          .limit(100), // Limit to reduce data transfer
        supabase
          .from('products')
          .select('stock')
      ]);

      // Process sales data
      if (salesResult.error) {
        console.error('Sales fetch error:', salesResult.error.message);
        return;
      }

      const items = salesResult.data as unknown as RawSaleItem[];
      const processedData = processData(items);

      // Update sales state
      setRecentSales(processedData.recentSales);
      setTopProducts(processedData.topProducts);
      setSalesData(processedData.salesData);
      setSalesToday(processedData.salesToday);

      // Process stock data
      if (!stockResult.error && stockResult.data) {
        const stocks = stockResult.data as Product[];
        const totalStock = stocks.reduce((sum, p) => sum + p.stock, 0);
        const lowStock = stocks.filter(p => p.stock < 5).length;
        setItemsInStock(totalStock);
        setLowStockCount(lowStock);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
    }
  }, [processData]);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  // Initial load with optimized animation
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Start animation and data fetch in parallel
      const animationPromise = new Promise<void>((resolve) => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600, // Reduced from 800ms
          useNativeDriver: true,
        }).start(() => resolve());
      });

      const dataPromise = fetchAllData();

      // Wait for both to complete
      await Promise.all([animationPromise, dataPromise]);
      setLoading(false);
    };

    loadData().catch(console.error);
  }, [fetchAllData, fadeAnim]);

  // Memoized chart config
  const chartConfig = useMemo(() => ({
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
  }), [isDark]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#24D164" />
        <Text style={{ marginTop: 10, color: isDark ? '#fff' : '#000' }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={refreshDashboard} 
          tintColor={isDark ? '#fff' : '#000'} 
        />
      }
      removeClippedSubviews={true} // Performance optimization
     
    >
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
            datasets: [{ data: salesData }],
          }}
          width={width - 40}
          height={220}
          yAxisLabel="GHS "
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 10 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginTop: 10 }}
          removeClippedSubviews={true}
        >
          {topProducts.length === 0 ? (
            <Text style={{ color: isDark ? '#aaa' : '#555' }}>No top products found.</Text>
          ) : (
            topProducts.map((product, idx) => (
              <View key={`${product.name}-${idx}`} style={styles.topProductCard}>
                <Text style={styles.saleText}>{product.name}</Text>
                <Text style={styles.saleText}>Sold: {product.qty}</Text>
                <Text style={styles.saleText}>Revenue: GHS {product.revenue}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Animated.ScrollView>
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