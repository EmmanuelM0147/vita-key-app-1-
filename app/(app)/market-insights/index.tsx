import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import { usePropertiesStore } from '@/store/properties-store';
import Colors from '@/constants/colors';
import { TrendingUp, ArrowUpRight, DollarSign, Map, Home, BarChart2, Calendar, AlertTriangle } from 'lucide-react-native';
import PropertyGridCard from '@/components/marketplace/PropertyGridCard';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';

export default function MarketInsightsScreen() {
  const router = useRouter();
  const { 
    investmentOpportunities, 
    trendingNeighborhoods, 
    refreshInvestmentOpportunities, 
    refreshTrendingNeighborhoods,
    isLoading,
    marketPredictions,
    refreshMarketPredictions
  } = useAIAnalysisStore();
  
  // Add error handling for usePropertiesStore
  let properties: any[] = [];
  try {
    const store = usePropertiesStore();
    properties = store.properties || [];
  } catch (error) {
    console.error('Error accessing properties store:', error);
  }

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  
  useEffect(() => {
    // Load data if not already loaded
    if (investmentOpportunities.length === 0 || 
        trendingNeighborhoods.length === 0 || 
        !marketPredictions) {
      refreshData();
    }
  }, []);
  
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshInvestmentOpportunities(),
        refreshTrendingNeighborhoods(),
        refreshMarketPredictions()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/marketplace/${propertyId}`);
  };
  
  const screenWidth = Dimensions.get('window').width - 40; // Accounting for padding
  
  // Prepare data for neighborhood chart
  const neighborhoodChartData = {
    labels: trendingNeighborhoods.slice(0, 5).map(n => n.name.substring(0, 6) + '...'),
    datasets: [
      {
        data: trendingNeighborhoods.slice(0, 5).map(n => n.growth),
        color: () => Colors.primary.main,
        strokeWidth: 2,
      },
    ],
    legend: ['Growth %'],
  };
  
  // Prepare data for property type chart
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Villa'];
  const propertyTypeChartData = {
    labels: propertyTypes,
    data: [5.2, 4.8, 4.5, 3.9, 5.5], // Mock data for property type growth
  };
  
  // Prepare data for market forecast chart
  const forecastChartData = marketPredictions ? {
    labels: ['3M', '6M', '1Y', '2Y', '5Y'],
    datasets: [
      {
        data: [
          marketPredictions.forecast3Month,
          marketPredictions.forecast6Month,
          marketPredictions.forecast1Year,
          marketPredictions.forecast2Year,
          marketPredictions.forecast5Year,
        ],
        color: () => Colors.primary.main,
        strokeWidth: 2,
      },
    ],
    legend: ['Price Index'],
  } : {
    labels: ['3M', '6M', '1Y', '2Y', '5Y'],
    datasets: [{ data: [100, 102, 105, 110, 120] }],
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
    barPercentage: 0.7,
  };
  
  // Time frame options for market data
  const timeframeOptions = ['3M', '6M', '1Y', '2Y', '5Y'];
  
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Analyzing market data...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[Colors.primary.main]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Market Insights</Text>
          <Text style={styles.subtitle}>
            AI-powered analysis of real estate market trends
          </Text>
        </View>
        
        {/* Market Overview */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart2 size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Market Overview</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+4.7%</Text>
              <Text style={styles.statLabel}>Avg. Growth</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$425K</Text>
              <Text style={styles.statLabel}>Avg. Price</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>32</Text>
              <Text style={styles.statLabel}>Days on Market</Text>
            </View>
          </View>
          
          <View style={styles.marketSummary}>
            <Text style={styles.marketSummaryTitle}>Market Summary</Text>
            <Text style={styles.marketSummaryText}>
              {marketPredictions?.marketSummary || 
                "The real estate market is showing steady growth with increasing demand in urban areas. Prices are expected to continue rising moderately over the next year."}
            </Text>
          </View>
        </Card>
        
        {/* Market Forecast */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Market Forecast</Text>
          </View>
          
          <View style={styles.timeframeSelector}>
            {timeframeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.timeframeOption,
                  selectedTimeframe === option && styles.timeframeOptionSelected,
                ]}
                onPress={() => setSelectedTimeframe(option)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === option && styles.timeframeTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={forecastChartData}
              width={screenWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: Colors.primary.light,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
          
          <View style={styles.forecastInsights}>
            <View style={styles.forecastInsightItem}>
              <Calendar size={18} color={Colors.primary.main} />
              <Text style={styles.forecastInsightText}>
                {marketPredictions?.timeframeInsight || 
                  "Prices expected to increase by 5-7% over the next year"}
              </Text>
            </View>
            <View style={styles.forecastInsightItem}>
              <AlertTriangle size={18} color={Colors.warning.main} />
              <Text style={styles.forecastInsightText}>
                {marketPredictions?.riskFactors || 
                  "Interest rate changes could impact market stability"}
              </Text>
            </View>
          </View>
        </Card>
        
        {/* Trending Neighborhoods */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Map size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Trending Neighborhoods</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={neighborhoodChartData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
          
          <View style={styles.neighborhoodList}>
            {trendingNeighborhoods.slice(0, 5).map((neighborhood, index) => (
              <View key={index} style={styles.neighborhoodItem}>
                <View style={styles.neighborhoodRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.neighborhoodInfo}>
                  <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
                  <Text style={styles.neighborhoodGrowth}>
                    +{neighborhood.growth.toFixed(1)}% growth
                  </Text>
                </View>
                <ArrowUpRight size={20} color={Colors.success.main} />
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => router.push('/market-insights/neighborhoods')}
          >
            <Text style={styles.viewMoreButtonText}>View All Neighborhoods</Text>
          </TouchableOpacity>
        </Card>
        
        {/* Property Type Trends */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Property Type Trends</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={propertyTypeChartData}
              width={screenWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: () => Colors.secondary.main,
              }}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
          
          <View style={styles.propertyTypeInsights}>
            <Typography variant="body1" style={styles.insightTitle}>Key Insights:</Typography>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Typography variant="body2">
                {marketPredictions?.propertyTypeInsights?.[0] || 
                  "Single-family homes showing strongest appreciation at 5.5%"}
              </Typography>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Typography variant="body2">
                {marketPredictions?.propertyTypeInsights?.[1] || 
                  "Condos gaining popularity in urban centers with 4.5% growth"}
              </Typography>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Typography variant="body2">
                {marketPredictions?.propertyTypeInsights?.[2] || 
                  "Luxury properties experiencing slower growth at 3.9%"}
              </Typography>
            </View>
          </View>
        </Card>
        
        {/* Investment Opportunities */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Top Investment Opportunities</Text>
          </View>
          
          {properties.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Unable to load properties. Please try refreshing the page.
              </Text>
            </View>
          ) : (
            <View style={styles.propertiesGrid}>
              {investmentOpportunities.slice(0, 4).map((property) => (
                <View key={property.id} style={styles.propertyCardContainer}>
                  <PropertyGridCard
                    property={property}
                    onPress={() => handlePropertyPress(property.id)}
                    showInvestmentBadge
                  />
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/marketplace')}
          >
            <Text style={styles.viewAllButtonText}>View All Properties</Text>
          </TouchableOpacity>
        </Card>
        
        {/* Market Forecast */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Market Outlook</Text>
          </View>
          
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>12-Month Market Outlook</Text>
            
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Price Growth:</Text>
              <Text style={[styles.forecastValue, { color: Colors.success.main }]}>
                {marketPredictions?.priceGrowthRange || "+4.2% to +5.8%"}
              </Text>
            </View>
            
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Interest Rates:</Text>
              <Text style={styles.forecastValue}>
                {marketPredictions?.interestRateOutlook || "Expected to remain stable"}
              </Text>
            </View>
            
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Inventory:</Text>
              <Text style={styles.forecastValue}>
                {marketPredictions?.inventoryOutlook || "Slight increase expected"}
              </Text>
            </View>
            
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Buyer Demand:</Text>
              <Text style={[styles.forecastValue, { color: Colors.success.main }]}>
                {marketPredictions?.buyerDemandOutlook || "Strong, especially in urban areas"}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => router.push('/market-insights/report')}
          >
            <Text style={styles.reportButtonText}>Generate Full Market Report</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.muted,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  marketSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  marketSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  marketSummaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.main,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 4,
  },
  timeframeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeframeOptionSelected: {
    backgroundColor: Colors.primary.main,
  },
  timeframeText: {
    fontSize: 14,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: Colors.common.white,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    borderRadius: 8,
  },
  forecastInsights: {
    marginTop: 16,
  },
  forecastInsightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.background.main,
    padding: 12,
    borderRadius: 8,
  },
  forecastInsightText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text.main,
    flex: 1,
  },
  neighborhoodList: {
    marginTop: 16,
  },
  neighborhoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  neighborhoodRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  neighborhoodInfo: {
    flex: 1,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.dark,
    marginBottom: 2,
  },
  neighborhoodGrowth: {
    fontSize: 14,
    color: Colors.success.main,
  },
  viewMoreButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
  },
  viewMoreButtonText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
  },
  propertyTypeInsights: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
  },
  insightTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
    marginRight: 8,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  propertyCardContainer: {
    width: '50%',
    padding: 8,
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: Colors.background.light,
    fontWeight: '600',
    fontSize: 14,
  },
  forecastContainer: {
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  forecastLabel: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.dark,
  },
  reportButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary.main,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});