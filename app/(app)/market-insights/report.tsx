import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Share,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import Colors from '@/constants/colors';
import { 
  TrendingUp, 
  Download, 
  Share2, 
  Calendar, 
  DollarSign, 
  Home, 
  Map, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function MarketReportScreen() {
  const { 
    marketPredictions, 
    trendingNeighborhoods, 
    refreshMarketPredictions,
    refreshTrendingNeighborhoods,
    isLoading 
  } = useAIAnalysisStore();
  
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  useEffect(() => {
    if (!marketPredictions || trendingNeighborhoods.length === 0) {
      refreshMarketPredictions();
      refreshTrendingNeighborhoods();
    }
  }, []);
  
  const generateReport = () => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      setReportGenerated(true);
    }, 2000);
  };
  
  const shareReport = async () => {
    try {
      await Share.share({
        message: 'Check out this real estate market report from HomeAI',
        title: 'HomeAI Market Report',
        url: 'https://homeai.app/report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };
  
  const screenWidth = Dimensions.get('window').width - 40;
  
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
  
  // Prepare data for price trend chart
  const priceTrendData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        data: [100, 103, 108, 115, 122, 128],
        color: () => Colors.primary.main,
        strokeWidth: 2,
      },
    ],
    legend: ['Price Index (2019 = 100)'],
  };
  
  // Prepare data for neighborhood comparison chart
  const neighborhoodComparisonData = {
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
  const propertyTypeData = {
    labels: ['House', 'Condo', 'Townhouse', 'Multi-Family', 'Land'],
    data: [5.2, 4.8, 4.5, 3.9, 2.7],
  };
  
  if (isLoading && !marketPredictions) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Market Report',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      {!reportGenerated ? (
        <View style={styles.generateReportContainer}>
          <View style={styles.reportIcon}>
            <TrendingUp size={48} color={Colors.primary.main} />
          </View>
          
          <Typography variant="h3" style={styles.generateTitle}>
            Comprehensive Market Report
          </Typography>
          
          <Typography variant="body1" style={styles.generateDescription}>
            Generate a detailed analysis of the current real estate market, including price trends, neighborhood comparisons, and investment recommendations.
          </Typography>
          
          <View style={styles.reportFeatures}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success.main} />
              <Text style={styles.featureText}>Price trend analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success.main} />
              <Text style={styles.featureText}>Neighborhood comparison</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success.main} />
              <Text style={styles.featureText}>Investment recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success.main} />
              <Text style={styles.featureText}>Market forecast</Text>
            </View>
          </View>
          
          <Button
            title={generatingReport ? "Generating Report..." : "Generate Report"}
            onPress={generateReport}
            style={styles.generateButton}
            disabled={generatingReport}
            loading={generatingReport}
          />
        </View>
      ) : (
        <ScrollView>
          <View style={styles.reportHeader}>
            <Typography variant="h3" style={styles.reportTitle}>
              Market Report
            </Typography>
            <Typography variant="body2" style={styles.reportDate}>
              Generated on {new Date().toLocaleDateString()}
            </Typography>
            
            <View style={styles.reportActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={shareReport}
              >
                <Share2 size={20} color={Colors.primary.main} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  // In a real app, this would download the report as PDF
                  alert('Download functionality would be implemented in a production app');
                }}
              >
                <Download size={20} color={Colors.primary.main} />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Market Overview</Text>
            </View>
            
            <Text style={styles.overviewText}>
              {marketPredictions?.marketSummary || 
                "The real estate market has shown resilience over the past year with a steady increase in property values across most segments. Urban areas continue to see strong demand, while suburban markets are experiencing accelerated growth as remote work trends persist. Overall, the market remains favorable for sellers in most regions, though there are signs of increasing inventory which may moderate price growth in the coming months."}
            </Text>
            
            <View style={styles.keyMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>+4.7%</Text>
                <Text style={styles.metricLabel}>Annual Price Growth</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>32</Text>
                <Text style={styles.metricLabel}>Avg. Days on Market</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>-8.3%</Text>
                <Text style={styles.metricLabel}>Inventory Change</Text>
              </View>
            </View>
          </Card>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Price Trends</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={priceTrendData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
            
            <View style={styles.trendInsights}>
              <View style={styles.insightItem}>
                <Info size={16} color={Colors.primary.main} />
                <Text style={styles.insightText}>
                  Property prices have increased by 28% over the past 5 years
                </Text>
              </View>
              <View style={styles.insightItem}>
                <TrendingUp size={16} color={Colors.success.main} />
                <Text style={styles.insightText}>
                  Annual growth rate has averaged 5.1% since 2019
                </Text>
              </View>
              <View style={styles.insightItem}>
                <AlertTriangle size={16} color={Colors.warning.main} />
                <Text style={styles.insightText}>
                  Growth rate is expected to moderate to 3-4% in the coming year
                </Text>
              </View>
            </View>
          </Card>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Map size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Neighborhood Comparison</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <BarChart
                data={neighborhoodComparisonData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
                showValuesOnTopOfBars
              />
            </View>
            
            <View style={styles.neighborhoodInsights}>
              <Typography variant="body1" style={styles.insightsTitle}>Top Performing Areas:</Typography>
              
              {trendingNeighborhoods.slice(0, 3).map((neighborhood, index) => (
                <View key={index} style={styles.neighborhoodInsightItem}>
                  <View style={styles.neighborhoodRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.neighborhoodInfo}>
                    <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
                    <Text style={styles.neighborhoodGrowth}>
                      +{neighborhood.growth.toFixed(1)}% annual growth
                    </Text>
                    <Text style={styles.neighborhoodReason}>
                      {index === 0 ? "Strong job growth and limited inventory" :
                       index === 1 ? "Improving amenities and school districts" :
                       "Attractive price points for first-time buyers"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Home size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Property Type Analysis</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <BarChart
                data={propertyTypeData}
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
              <View style={styles.propertyTypeItem}>
                <View style={[styles.propertyTypeBadge, { backgroundColor: Colors.success.light }]}>
                  <Text style={styles.propertyTypeBadgeText}>Strong</Text>
                </View>
                <View style={styles.propertyTypeInfo}>
                  <Text style={styles.propertyTypeName}>Single-Family Homes</Text>
                  <Text style={styles.propertyTypeDescription}>
                    Continued strong demand, especially in suburban areas with good schools
                  </Text>
                </View>
              </View>
              
              <View style={styles.propertyTypeItem}>
                <View style={[styles.propertyTypeBadge, { backgroundColor: Colors.success.light }]}>
                  <Text style={styles.propertyTypeBadgeText}>Strong</Text>
                </View>
                <View style={styles.propertyTypeInfo}>
                  <Text style={styles.propertyTypeName}>Condominiums</Text>
                  <Text style={styles.propertyTypeDescription}>
                    Rebounding in urban centers as return-to-office policies increase
                  </Text>
                </View>
              </View>
              
              <View style={styles.propertyTypeItem}>
                <View style={[styles.propertyTypeBadge, { backgroundColor: Colors.warning.light }]}>
                  <Text style={styles.propertyTypeBadgeText}>Moderate</Text>
                </View>
                <View style={styles.propertyTypeInfo}>
                  <Text style={styles.propertyTypeName}>Multi-Family</Text>
                  <Text style={styles.propertyTypeDescription}>
                    Stable returns but facing pressure from rising interest rates
                  </Text>
                </View>
              </View>
            </View>
          </Card>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Investment Outlook</Text>
            </View>
            
            <View style={styles.investmentOutlook}>
              <Text style={styles.outlookTitle}>12-Month Market Outlook</Text>
              
              <View style={styles.outlookItem}>
                <View style={styles.outlookHeader}>
                  <Text style={styles.outlookLabel}>Price Growth:</Text>
                  <Text style={[styles.outlookValue, { color: Colors.success.main }]}>
                    {marketPredictions?.priceGrowthRange || "+4.2% to +5.8%"}
                  </Text>
                </View>
                <Text style={styles.outlookDescription}>
                  Price appreciation is expected to continue but at a more moderate pace than previous years.
                </Text>
              </View>
              
              <View style={styles.outlookItem}>
                <View style={styles.outlookHeader}>
                  <Text style={styles.outlookLabel}>Interest Rates:</Text>
                  <Text style={styles.outlookValue}>
                    {marketPredictions?.interestRateOutlook || "Stable to Slight Increase"}
                  </Text>
                </View>
                <Text style={styles.outlookDescription}>
                  Mortgage rates are projected to remain relatively stable with potential for modest increases.
                </Text>
              </View>
              
              <View style={styles.outlookItem}>
                <View style={styles.outlookHeader}>
                  <Text style={styles.outlookLabel}>Best Investment Areas:</Text>
                </View>
                <View style={styles.investmentAreas}>
                  {trendingNeighborhoods.slice(0, 3).map((n, i) => (
                    <View key={i} style={styles.investmentArea}>
                      <CheckCircle size={16} color={Colors.success.main} />
                      <Text style={styles.investmentAreaText}>{n.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.outlookItem}>
                <View style={styles.outlookHeader}>
                  <Text style={styles.outlookLabel}>Risk Factors:</Text>
                </View>
                <View style={styles.riskFactors}>
                  <View style={styles.riskFactor}>
                    <AlertTriangle size={16} color={Colors.warning.main} />
                    <Text style={styles.riskFactorText}>Potential economic slowdown</Text>
                  </View>
                  <View style={styles.riskFactor}>
                    <AlertTriangle size={16} color={Colors.warning.main} />
                    <Text style={styles.riskFactorText}>Rising construction costs</Text>
                  </View>
                  <View style={styles.riskFactor}>
                    <AlertTriangle size={16} color={Colors.warning.main} />
                    <Text style={styles.riskFactorText}>Regulatory changes affecting lending</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
          
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>
            
            <View style={styles.recommendations}>
              <View style={styles.recommendationItem}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>For Buyers</Text>
                </View>
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Consider emerging neighborhoods with strong growth potential
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Lock in mortgage rates now if planning to buy within 6 months
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Focus on properties with renovation potential for added value
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.recommendationItem}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>For Sellers</Text>
                </View>
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Market conditions remain favorable but consider listing soon
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Focus on curb appeal and minor renovations for maximum return
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Price competitively as buyers become more selective
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.recommendationItem}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>For Investors</Text>
                </View>
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Focus on neighborhoods with strong rental demand
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Consider multi-family properties for diversified income
                    </Text>
                  </View>
                  <View style={styles.recommendationPoint}>
                    <CheckCircle size={16} color={Colors.success.main} />
                    <Text style={styles.recommendationText}>
                      Look for properties near planned infrastructure improvements
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
          
          <View style={styles.disclaimer}>
            <XCircle size={16} color={Colors.text.muted} />
            <Text style={styles.disclaimerText}>
              This report is for informational purposes only and should not be considered financial advice. Market conditions can change rapidly, and individual circumstances vary.
            </Text>
          </View>
        </ScrollView>
      )}
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
  generateReportContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  generateTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  generateDescription: {
    textAlign: 'center',
    color: Colors.text.muted,
    marginBottom: 32,
  },
  reportFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.main,
  },
  generateButton: {
    width: '100%',
  },
  reportHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  reportTitle: {
    marginBottom: 4,
  },
  reportDate: {
    color: Colors.text.muted,
    marginBottom: 16,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary.light,
    marginRight: 12,
  },
  actionButtonText: {
    color: Colors.primary.main,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
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
  overviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.main,
    marginBottom: 16,
  },
  keyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    borderRadius: 8,
  },
  trendInsights: {
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.background.main,
    padding: 12,
    borderRadius: 8,
  },
  insightText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text.main,
    flex: 1,
  },
  neighborhoodInsights: {
    marginTop: 16,
  },
  insightsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  neighborhoodInsightItem: {
    flexDirection: 'row',
    marginBottom: 16,
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
    marginBottom: 4,
  },
  neighborhoodReason: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  propertyTypeInsights: {
    marginTop: 16,
  },
  propertyTypeItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  propertyTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    marginRight: 12,
  },
  propertyTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.common.white,
  },
  propertyTypeInfo: {
    flex: 1,
  },
  propertyTypeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.dark,
    marginBottom: 2,
  },
  propertyTypeDescription: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  investmentOutlook: {
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 16,
  },
  outlookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 16,
  },
  outlookItem: {
    marginBottom: 16,
  },
  outlookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  outlookLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.dark,
  },
  outlookValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  outlookDescription: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  investmentAreas: {
    marginTop: 8,
  },
  investmentArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  investmentAreaText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.main,
  },
  riskFactors: {
    marginTop: 8,
  },
  riskFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskFactorText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.main,
  },
  recommendations: {
    marginTop: 8,
  },
  recommendationItem: {
    marginBottom: 20,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recommendationHeader: {
    backgroundColor: Colors.primary.light,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  recommendationContent: {
    padding: 16,
  },
  recommendationPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text.main,
    flex: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background.main,
    margin: 16,
    borderRadius: 8,
    marginTop: 0,
    marginBottom: 32,
  },
  disclaimerText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.text.muted,
    flex: 1,
  },
});