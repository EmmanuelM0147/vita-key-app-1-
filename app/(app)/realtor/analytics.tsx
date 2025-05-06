import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, TrendingUp, Eye, DollarSign, Clock } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';

const screenWidth = Dimensions.get('window').width - 40;

const timeRanges = ['7D', '1M', '3M', '6M', '1Y', 'All'];

// Define types for the MockChart component
interface MockChartProps {
  type: string;
  height: number;
  data: {
    labels?: string[];
    datasets?: Array<{
      data: number[];
      color?: () => string;
      strokeWidth?: number;
    }>;
    name?: string;
    population?: number;
    color?: string;
    legendFontColor?: string;
    legendFontSize?: number;
  };
}

// Mock chart component since react-native-chart-kit is not installed
const MockChart: React.FC<MockChartProps> = ({ type, height, data }) => {
  return (
    <View 
      style={{
        height: height,
        width: '100%',
        backgroundColor: Colors.background.light,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Spacing.md,
      }}
    >
      <Typography variant="body1" color={Colors.text.muted}>
        {type} Chart ({data?.labels?.join(', ') || 'No data'})
      </Typography>
    </View>
  );
};

export default function RealtorAnalytics() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { properties } = usePropertiesStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');

  // Filter properties by agent ID
  const agentProperties = properties.filter(property => property.agentId === user?.id);
  
  // Calculate statistics
  const totalListings = agentProperties.length;
  const activeListings = agentProperties.filter(p => p.status === 'active').length;
  const pendingListings = agentProperties.filter(p => p.status === 'pending').length;
  const soldListings = agentProperties.filter(p => p.status === 'sold').length;
  
  // Calculate total value of properties
  const totalPropertyValue = agentProperties.reduce((sum, property) => sum + property.price, 0);
  
  // Calculate average days on market (mock data)
  const averageDaysOnMarket = 32;
  
  // Calculate total views (mock data)
  const totalViews = 1245;

  // Mock data for charts
  const viewsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: () => Colors.primary.main,
        strokeWidth: 2
      }
    ],
  };

  const listingStatusData = {
    labels: ['Active', 'Pending', 'Sold', 'Inactive'],
    datasets: [
      {
        data: [activeListings, pendingListings, soldListings, totalListings - activeListings - pendingListings - soldListings]
      }
    ]
  };

  const propertyTypeData = {
    labels: ['House', 'Apartment', 'Condo', 'Land', 'Other'],
    datasets: [
      {
        data: [
          agentProperties.filter(p => p.type === 'house').length,
          agentProperties.filter(p => p.type === 'apartment').length,
          agentProperties.filter(p => p.type === 'condo').length,
          agentProperties.filter(p => p.type === 'land').length,
          agentProperties.filter(p => !['house', 'apartment', 'condo', 'land'].includes(p.type)).length
        ]
      }
    ]
  };

  // Check if user is a realtor
  if (user?.role !== 'realtor') {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Realtor Access Required
          </Typography>
          <Typography variant="body1" color={Colors.text.muted} style={styles.subtitle}>
            You need a realtor account to access this feature.
          </Typography>
          <Button
            title="Go Back"
            onPress={() => router.push('/')}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  // Check if user has an active subscription
  const hasActiveSubscription = user?.subscription?.status === 'active';
  const isPremiumPlan = user?.subscription?.plan === 'premium';
  
  if (!hasActiveSubscription) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Subscription Required
          </Typography>
          <Typography variant="body1" style={styles.subtitle}>
            You need an active subscription to access analytics.
          </Typography>
          <Button 
            title="View Subscription Plans" 
            onPress={() => router.push('/realtor/subscription')}
            style={styles.subscriptionButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!isPremiumPlan) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Premium Feature
          </Typography>
          <Typography variant="body1" style={styles.subtitle}>
            Advanced analytics are only available with the Premium plan.
          </Typography>
          <Button 
            title="Upgrade to Premium" 
            onPress={() => router.push('/realtor/subscription')}
            style={styles.subscriptionButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Analytics Dashboard
          </Typography>

          <View style={styles.timeRangeContainer}>
            <Typography variant="body2" color={Colors.text.muted} style={styles.timeRangeLabel}>
              <Calendar size={16} color={Colors.text.muted} /> Time Range:
            </Typography>
            <View style={styles.timeRangeOptions}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeOption,
                    selectedTimeRange === range && styles.timeRangeOptionActive,
                  ]}
                  onPress={() => setSelectedTimeRange(range)}
                >
                  <Typography
                    variant="body2"
                    color={selectedTimeRange === range ? Colors.common.white : Colors.text.dark}
                  >
                    {range}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.primary.main} />
              </View>
              <Typography variant="h4" style={styles.statValue}>
                {totalListings}
              </Typography>
              <Typography variant="body2" color={Colors.text.muted}>
                Total Listings
              </Typography>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <DollarSign size={24} color={Colors.success.main} />
              </View>
              <Typography variant="h4" style={styles.statValue}>
                ${(totalPropertyValue / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color={Colors.text.muted}>
                Property Value
              </Typography>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Eye size={24} color={Colors.primary.gold} />
              </View>
              <Typography variant="h4" style={styles.statValue}>
                {totalViews}
              </Typography>
              <Typography variant="body2" color={Colors.text.muted}>
                Total Views
              </Typography>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={24} color={Colors.warning.main} />
              </View>
              <Typography variant="h4" style={styles.statValue}>
                {averageDaysOnMarket}
              </Typography>
              <Typography variant="body2" color={Colors.text.muted}>
                Avg. Days Listed
              </Typography>
            </Card>
          </View>

          <Card variant="elevated" style={styles.chartCard}>
            <Typography variant="h4" style={styles.chartTitle}>
              Property Views
            </Typography>
            <Typography variant="body2" color={Colors.text.muted} style={styles.chartSubtitle}>
              Daily views across all your listings
            </Typography>
            <MockChart 
              type="Line" 
              height={220} 
              data={viewsData} 
            />
          </Card>

          <Card variant="elevated" style={styles.chartCard}>
            <Typography variant="h4" style={styles.chartTitle}>
              Listing Status
            </Typography>
            <Typography variant="body2" color={Colors.text.muted} style={styles.chartSubtitle}>
              Distribution of your property listings by status
            </Typography>
            <MockChart 
              type="Pie" 
              height={220} 
              data={listingStatusData} 
            />
          </Card>

          <Card variant="elevated" style={styles.chartCard}>
            <Typography variant="h4" style={styles.chartTitle}>
              Property Types
            </Typography>
            <Typography variant="body2" color={Colors.text.muted} style={styles.chartSubtitle}>
              Distribution of your listings by property type
            </Typography>
            <MockChart 
              type="Bar" 
              height={220} 
              data={propertyTypeData} 
            />
          </Card>

          <Button
            title="Download Full Report"
            onPress={() => {
              // In a real app, this would generate and download a PDF report
              alert('Report download feature will be available soon!');
            }}
            style={styles.downloadButton}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    color: Colors.text.muted,
  },
  goBackButton: {
    marginTop: Spacing.lg,
  },
  subscriptionButton: {
    marginTop: Spacing.lg,
  },
  timeRangeContainer: {
    marginBottom: Spacing.lg,
  },
  timeRangeLabel: {
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRangeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  timeRangeOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondary.sage,
  },
  timeRangeOptionActive: {
    backgroundColor: Colors.primary.navy,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  chartCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  chartTitle: {
    marginBottom: Spacing.xs,
  },
  chartSubtitle: {
    marginBottom: Spacing.md,
  },
  chart: {
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  downloadButton: {
    marginBottom: Spacing.xl,
  },
});