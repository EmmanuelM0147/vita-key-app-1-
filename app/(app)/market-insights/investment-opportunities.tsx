import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import Colors from '@/constants/colors';
import { Search, Filter, DollarSign } from 'lucide-react-native';
import InvestmentOpportunityCard from '@/components/market-insights/InvestmentOpportunityCard';
import { useRouter } from 'expo-router';
import { Property } from '@/types/property';
import { identifyInvestmentOpportunities } from '@/services/market-analysis';
import { mockProperties } from '@/mocks/properties';

export default function InvestmentOpportunitiesScreen() {
  const router = useRouter();
  const { investmentOpportunities, refreshInvestmentOpportunities, isLoading } = useAIAnalysisStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [sortBy, setSortBy] = useState('roi'); // 'roi', 'price', 'growth'
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  
  // Property types for filtering
  const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land'];
  
  useEffect(() => {
    if (investmentOpportunities.length === 0) {
      refreshInvestmentOpportunities();
    } else {
      setFilteredProperties(investmentOpportunities);
    }
  }, [investmentOpportunities]);
  
  useEffect(() => {
    // Apply filters and search
    let filtered = [...investmentOpportunities];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof property.location === 'object' && 
          property.location.city?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply price filter
    filtered = filtered.filter(property => 
      property.price >= priceRange[0] && property.price <= priceRange[1]
    );
    
    // Apply property type filter
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(property => 
        selectedPropertyTypes.includes(property.type)
      );
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'growth') {
      // Sort by predicted growth rate (mock implementation)
      filtered.sort((a, b) => {
        const aGrowth = a.appreciationRate || 5;
        const bGrowth = b.appreciationRate || 5;
        return bGrowth - aGrowth;
      });
    } else {
      // Sort by ROI (default)
      filtered.sort((a, b) => {
        const aROI = a.investmentScore || 0;
        const bROI = b.investmentScore || 0;
        return bROI - aROI;
      });
    }
    
    setFilteredProperties(filtered);
  }, [investmentOpportunities, searchQuery, sortBy, priceRange, selectedPropertyTypes]);
  
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/marketplace/${propertyId}`);
  };
  
  const togglePropertyType = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
    }
  };
  
  const resetFilters = () => {
    setPriceRange([0, 2000000]);
    setSelectedPropertyTypes([]);
    setSearchQuery('');
  };
  
  // Generate more investment opportunities
  const generateMoreOpportunities = () => {
    // In a real app, this would call an AI service to analyze more properties
    // For now, we'll just use our mock function with more properties
    const moreOpportunities = identifyInvestmentOpportunities(mockProperties, 10);
    setFilteredProperties([...filteredProperties, ...moreOpportunities]);
  };
  
  if (isLoading && investmentOpportunities.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Finding investment opportunities...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'Investment Opportunities',
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
            placeholder="Search by location or title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.muted}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors.text.dark} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <TouchableOpacity 
                style={[
                  styles.priceRangeButton,
                  priceRange[0] === 0 && priceRange[1] === 2000000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setPriceRange([0, 2000000])}
              >
                <Text style={styles.priceRangeButtonText}>Any</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priceRangeButton,
                  priceRange[0] === 0 && priceRange[1] === 500000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setPriceRange([0, 500000])}
              >
                <Text style={styles.priceRangeButtonText}>{"< $500K"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priceRangeButton,
                  priceRange[0] === 500000 && priceRange[1] === 1000000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setPriceRange([500000, 1000000])}
              >
                <Text style={styles.priceRangeButtonText}>$500K-$1M</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priceRangeButton,
                  priceRange[0] === 1000000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setPriceRange([1000000, 2000000])}
              >
                <Text style={styles.priceRangeButtonText}>$1M+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Property Type</Text>
            <View style={styles.propertyTypeContainer}>
              {propertyTypes.map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[
                    styles.propertyTypeButton,
                    selectedPropertyTypes.includes(type) && styles.propertyTypeButtonActive
                  ]}
                  onPress={() => togglePropertyType(type)}
                >
                  <Text 
                    style={[
                      styles.propertyTypeButtonText,
                      selectedPropertyTypes.includes(type) && styles.propertyTypeButtonTextActive
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.sortByContainer}>
              <TouchableOpacity 
                style={[
                  styles.sortByButton,
                  sortBy === 'roi' && styles.sortByButtonActive
                ]}
                onPress={() => setSortBy('roi')}
              >
                <Text 
                  style={[
                    styles.sortByButtonText,
                    sortBy === 'roi' && styles.sortByButtonTextActive
                  ]}
                >
                  ROI
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.sortByButton,
                  sortBy === 'price' && styles.sortByButtonActive
                ]}
                onPress={() => setSortBy('price')}
              >
                <Text 
                  style={[
                    styles.sortByButtonText,
                    sortBy === 'price' && styles.sortByButtonTextActive
                  ]}
                >
                  Price
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.sortByButton,
                  sortBy === 'growth' && styles.sortByButtonActive
                ]}
                onPress={() => setSortBy('growth')}
              >
                <Text 
                  style={[
                    styles.sortByButtonText,
                    sortBy === 'growth' && styles.sortByButtonTextActive
                  ]}
                >
                  Growth Rate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProperties.length} Investment Opportunities
          </Text>
        </View>
        
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InvestmentOpportunityCard
              property={item}
              onPress={() => handlePropertyPress(item.id)}
            />
          )}
          contentContainerStyle={styles.propertiesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <DollarSign size={48} color={Colors.text.muted} />
              <Text style={styles.emptyStateText}>No investment opportunities found</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            filteredProperties.length > 0 ? (
              <TouchableOpacity 
                style={styles.generateMoreButton}
                onPress={generateMoreOpportunities}
              >
                <Text style={styles.generateMoreButtonText}>
                  Generate More Opportunities
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
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
  filtersContainer: {
    padding: 16,
    backgroundColor: Colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  priceRangeButtonActive: {
    backgroundColor: Colors.primary.light,
    borderColor: Colors.primary.main,
  },
  priceRangeButtonText: {
    fontSize: 14,
    color: Colors.text.main,
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  propertyTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  propertyTypeButtonActive: {
    backgroundColor: Colors.primary.light,
    borderColor: Colors.primary.main,
  },
  propertyTypeButtonText: {
    fontSize: 14,
    color: Colors.text.main,
  },
  propertyTypeButtonTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  sortByContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortByButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  sortByButtonActive: {
    backgroundColor: Colors.primary.light,
    borderColor: Colors.primary.main,
  },
  sortByButtonText: {
    fontSize: 14,
    color: Colors.text.main,
  },
  sortByButtonTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  resetButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
  },
  resetButtonText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  propertiesList: {
    padding: 16,
    paddingTop: 0,
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
    marginTop: 16,
    marginBottom: 16,
  },
  generateMoreButton: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateMoreButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 14,
  },
});