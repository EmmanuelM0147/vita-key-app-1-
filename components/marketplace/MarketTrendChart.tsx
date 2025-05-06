import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MarketTrend } from '@/services/ai-prediction';
import Colors from '@/constants/colors';

interface MarketTrendChartProps {
  marketTrend: MarketTrend;
}

const MarketTrendChart: React.FC<MarketTrendChartProps> = ({ marketTrend }) => {
  const screenWidth = Dimensions.get('window').width - 40; // Accounting for padding
  
  // Prepare data for chart
  const chartData = {
    labels: marketTrend.priceHistory.map(item => item.month),
    datasets: [
      {
        data: marketTrend.priceHistory.map(item => item.value),
        color: () => Colors.primary.main,
        strokeWidth: 2,
      },
    ],
    legend: ['Price Index'],
  };
  
  const chartConfig = {
    backgroundGradientFrom: Colors.background.light,
    backgroundGradientTo: Colors.background.light,
    decimalPlaces: 1,
    color: () => Colors.primary.main,
    labelColor: () => Colors.text.muted,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary.light,
    },
  };
  
  // Helper function to get color based on trend
  const getTrendColor = (trend: number) => {
    if (trend > 5) return Colors.success.main;
    if (trend > 3) return Colors.success.light;
    if (trend > 0) return Colors.warning.main;
    return Colors.error.main;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Trend: {marketTrend.neighborhood}</Text>
        <View style={styles.trendContainer}>
          <Text style={styles.trendLabel}>Current Trend:</Text>
          <Text style={[styles.trendValue, { color: getTrendColor(marketTrend.currentTrend) }]}>
            +{marketTrend.currentTrend.toFixed(1)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withDots={true}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Forecast</Text>
          <Text style={[styles.statValue, { color: getTrendColor(marketTrend.forecast) }]}>
            +{marketTrend.forecast.toFixed(1)}%
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Demand</Text>
          <Text style={styles.statValue}>
            {marketTrend.demandLevel}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Supply</Text>
          <Text style={styles.statValue}>
            {marketTrend.supplyLevel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.dark,
  },
});

export default MarketTrendChart;