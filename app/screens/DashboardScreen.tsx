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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useThemeContext } from '../theme/ThemeContext';


const dummySales = [
  { id: 1, item: 'Football Jersey', quantity: 3, amount: 150 },
  { id: 2, item: 'Soccer Ball', quantity: 2, amount: 80 },
  { id: 3, item: 'Cleats', quantity: 1, amount: 60 },
];

export default function DashboardScreen() {
  const theme = useColorScheme();
  const { theme: appTheme } = useThemeContext();
  const isDark = appTheme === 'dark';
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const fadeAnim = useState(new Animated.Value(0))[0];

  const styles = getStyles(isDark, isTablet);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    
   
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
      

      <View style={styles.cardRow}>
        <MetricCard icon="soccer" label="Items in Stock" value="345" color="green" />
        <MetricCard icon="cash" label="Sales Today" value="$1,230" color="blue" />
        <MetricCard icon="alert-circle" label="Low Stock" value="12" color="red" />
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.sectionTitle}>Monthly Sales Summary</Text>
        <LineChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                data: [500, 1300, 1000, 1600],
              },
            ],
          }}
          width={width - 40}
          height={220}
          yAxisLabel="$"
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
  <Text style={styles.sectionTitle}>Quick Actions</Text>
  <View style={styles.quickActionsContainer}>
    {([
      {
        label: 'Add Product',
        icon: 'plus-circle-outline' as const,
        onPress: () => console.log('Add Product'),
      },
      {
        label: 'Record Sale',
        icon: 'file-document-outline' as const,
        onPress: () => console.log('Record Sale'),
      },
      {
        label: 'Add Supplier',
        icon: 'account-plus-outline' as const,
        onPress: () => console.log('Add Supplier'),
      },
      {
        label: 'Export Data',
        icon: 'upload-outline' as const,
        onPress: () => console.log('Export Data'),
      },
    ]).map((action, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.actionCard,
          { backgroundColor: isDark ? '#1f1f1f' : '#2121' },
        ]}
        onPress={action.onPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={action.icon}
          size={28}
          color={'#24D164'}
        />
        <Text
          style={[
            styles.actionLabel,
            { color: isDark? '#fff' : '#000' },
          ]}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>


      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          <Text style={styles.seeAllText}>See All</Text>
        </View>
        {dummySales.map(sale => (
          <View key={sale.id} style={styles.saleItem}>
            <Text style={styles.saleText}>{sale.item}</Text>
            <Text style={styles.saleText}>Qty: {sale.quantity}</Text>
            <Text style={styles.saleText}>${sale.amount}</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
  <Text style={styles.sectionTitle}>Top Selling Products</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
    {[
      { name: 'Jersey A', qty: 80, revenue: 4000 },
      { name: 'Cleats B', qty: 56, revenue: 2800 },
      { name: 'Soccer Ball', qty: 30, revenue: 1200 },
    ].map((product, idx) => (
      <View key={idx} style={[styles.topProductCard]}>
        <Text style={styles.saleText}>{product.name}</Text>
        <Text style={styles.saleText}>Sold: {product.qty}</Text>
        <Text style={styles.saleText}>Revenue: ${product.revenue}</Text>
      </View>
    ))}
  </ScrollView>
</View>
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Sales Breakdown</Text>
  <PieChart
    data={[
      {
        name: 'Jerseys',
        sales: 4000,
        color: '#00C49F',
        legendFontColor: theme === 'dark' ? '#fff' : '#000',
        legendFontSize: 14,
      },
      {
        name: 'Cleats',
        sales: 2800,
        color: '#FFBB28',
        legendFontColor: theme === 'dark' ? '#fff' : '#000',
        legendFontSize: 14,
      },
      {
        name: 'Balls',
        sales: 1200,
        color: '#FF8042',
        legendFontColor: theme === 'dark' ? '#fff' : '#000',
        legendFontSize: 14,
      },
    ]}
    width={width - 40}
    height={220}
    chartConfig={{
      color: () => (theme === 'dark' ? '#fff' : '#000'),
    }}
    accessor="sales"
    backgroundColor="transparent"
    paddingLeft="15"
    absolute
  />
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
      style={[
        cardStyles.card,
        { backgroundColor: isDark ? '#1f1f1f' : '#fff',
          display:'flex'
         },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text
        style={[
          cardStyles.cardLabel,
          { color: isDark ? '#fff' : '#333' },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          cardStyles.cardValue,
          { color: isDark ? '#fff' : '#000' },
        ]}
      >
        {value}
      </Text>
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
      marginBottom:10
    },
    // topBar: {
    //   flexDirection: 'row',
    //   justifyContent: 'space-between',
    //   alignItems: 'center',
    //   marginBottom: 20,
    //   marginTop: 30,
    // },
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
