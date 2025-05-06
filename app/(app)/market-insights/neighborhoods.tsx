import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import Colors from '@/constants/colors';
import { TrendingUp, Search, MapPin, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react-native';
import Card from '@/components/ui/Card';

export default function NeighborhoodsScreen() {
  const router = useRouter();
  const { trendingNeighborhoods, refreshTrendingNeighborhoods, isLoading } = useAIAnalysisStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('growth'); // 'growth', 'name', 'price'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState(trendingNeighborhoods);
  
  useEffect(() => {
    if (trendingNeighborhoods.length === 0) {
      refreshTrendingNeighborhoods();
    }
  }, []);
  
  useEffect(() => {
    // Filter and sort neighborhoods
    let filtered = [...trendingNeighborhoods];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'growth') {
        return sortOrder === 'desc' ? b.growth - a.growth : a.growth - b.growth;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'desc' 
          ? (b.medianPrice || 0) - (a.medianPrice || 0) 
          : (a.medianPrice || 0) - (b.medianPrice || 0);
      }
      return 0;
    });
    
    setFilteredNeighborhoods(filtered);
  }, [trendingNeighborhoods, searchQuery, sortBy, sortOrder]);
  
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
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };
  
  if (isLoading && trendingNeighborhoods.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading neighborhood data...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Trending Neighborhoods',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search neighborhoods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.muted}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.text.dark} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'growth' && styles.sortOptionActive
            ]}
            onPress={() => handleSortChange('growth')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'growth' && styles.sortOptionTextActive
            ]}>
              Growth {sortBy === 'growth' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'name' && styles.sortOptionActive
            ]}
            onPress={() => handleSortChange('name')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'name' && styles.sortOptionTextActive
            ]}>
              Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sortOption, 
              sortBy === 'price' && styles.sortOptionActive
            ]}
            onPress={() => handleSortChange('price')}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === 'price' && styles.sortOptionTextActive
            ]}>
              Price {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView>
        {filteredNeighborhoods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No neighborhoods found</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredNeighborhoods.map((neighborhood, index) => {
            // Generate mock price history data for the chart
            const priceHistory = Array(6).fill(0).map((_, i) => {
              const baseValue = 100;
              return baseValue * (1 + (neighborhood.growth / 100) * (i / 5));
            });
            
            const chartData = {
              labels: ['6M', '5M', '4M', '3M', '2M', '1M'],
              datasets: [
                {
                  data: priceHistory,
                  color: () => Colors.primary.main,
                  strokeWidth: 2,
                },
              ],
            };
            
            return (
              <Card key={index} variant="elevated" style={styles.neighborhoodCard}>
                <View style={styles.neighborhoodHeader}>
                  <View style={styles.neighborhoodTitleContainer}>
                    <MapPin size={18} color={Colors.primary.main} />
                    <Text style={styles.neighborhoodTitle}>{neighborhood.name}</Text>
                  </View>
                  <View style={styles.growthBadge}>
                    <TrendingUp size={14} color={Colors.common.white} />
                    <Text style={styles.growthText}>+{neighborhood.growth.toFixed(1)}%</Text>
                  </View>
                </View>
                
                <View style={styles.chartContainer}>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 32}
                    height={160}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withDots={false}
                    withInnerLines={false}
                  />
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Median Price</Text>
                    <Text style={styles.statValue}>
                      ${neighborhood.medianPrice?.toLocaleString() || '385,000'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Avg. Days Listed</Text>
                    <Text style={styles.statValue}>
                      {neighborhood.daysOnMarket || '28'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Inventory</Text>
                    <Text style={styles.statValue}>
                      {neighborhood.inventory || 'Low'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.insightsContainer}>
                  <Text style={styles.insightsTitle}>Market Insights:</Text>
                  
                  <View style={styles.insightItem}>
                    {neighborhood.growth > 5 ? (
                      <ArrowUpRight size={16} color={Colors.success.main} />
                    ) : (
                      <ArrowDownRight size={16} color={Colors.warning.main} />
                    )}
                    <Text style={styles.insightText}>
                      {neighborhood.insights?.[0] || 
                        `${neighborhood.name} is ${neighborhood.growth > 5 ? 'outperforming' : 'performing close to'} the market average.`}
                    </Text>
                  </View>
                  
                  <View style={styles.insightItem}>
                    <ArrowUpRight size={16} color={Colors.primary.main} />
                    <Text style={styles.insightText}>
                      {neighborhood.insights?.[1] || 
                        `Buyer demand is ${neighborhood.growth > 4 ? 'strong' : 'moderate'} with ${neighborhood.growth > 5 ? 'limited' : 'adequate'} inventory.`}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.viewPropertiesButton}
                  onPress={() => router.push({
                    pathname: '/marketplace',
                    params: { neighborhood: neighborhood.name }
                  })}
                >
                  <Text style={styles.viewPropertiesButtonText}>
                    View Properties in {neighborhood.name}
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.dark,
  },
  filterButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.text.muted,
    marginRight: 12,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background.main,
  },
  sortOptionActive: {
    backgroundColor: Colors.primary.light,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  sortOptionTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  neighborhoodCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  neighborhoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  neighborhoodTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  neighborhoodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    marginLeft: 8,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success.main,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  growthText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  insightsContainer: {
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.main,
    marginLeft: 8,
    flex: 1,
  },
  viewPropertiesButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewPropertiesButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.muted,
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  resetButtonText: {
    color: Colors.common.white,
    fontWeight: '500',
  },
});