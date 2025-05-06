import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, MapPin, Grid, List, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import usePropertiesStore from '@/store/properties-store';
import usePersonalizationStore from '@/store/personalization-store';
import useAuthStore from '@/store/auth-store';
import { Property, PropertyLocation } from '@/types/property';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';
import SearchBar from '@/components/home/SearchBar';
import PropertyGridCard from '@/components/marketplace/PropertyGridCard';
import FilterModal, { FilterOptions } from '@/components/marketplace/FilterModal';
import ActiveFilters from '@/components/marketplace/ActiveFilters';
import SuggestedSearches from '@/components/personalization/SuggestedSearches';
import Typography from '@/components/ui/Typography';
import ImageSearchModal from '@/components/search/ImageSearchModal';
import ImageSearchResults from '@/components/search/ImageSearchResults';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    properties, 
    favorites, 
    isLoading, 
    fetchProperties, 
    toggleFavorite,
    searchPropertiesByImage,
    isImageSearching
  } = usePropertiesStore();
  
  const {
    personalizedFilters,
    recentSearches,
    suggestedSearches,
    trendingSearches,
    trackSearch,
    trackSearchFilters,
    fetchPersonalizedSearchFilters,
  } = usePersonalizationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    propertyType: 'all',
    priceRange: [100000, 2000000],
    location: null,
    bedrooms: 'any',
    bathrooms: 'any',
    amenities: [],
    sortBy: 'newest',
  });
  
  // Image search state
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState<Array<Property & { similarityScore: number; matchReasons: string[] }> | null>(null);
  const [searchImageUri, setSearchImageUri] = useState<string | null>(null);
  
  // Load properties on initial render
  useEffect(() => {
    fetchProperties();
    
    // Load personalized filters if user is logged in
    if (user) {
      fetchPersonalizedSearchFilters();
    }
  }, []);
  
  // Apply personalized filters when they change
  useEffect(() => {
    if (user && Object.keys(personalizedFilters).length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        ...personalizedFilters
      }));
    }
  }, [personalizedFilters, user]);
  
  // Update filtered properties when properties or filters change
  useEffect(() => {
    if (imageSearchResults) {
      // If we have image search results, use those instead of filtering
      setFilteredProperties(imageSearchResults);
      return;
    }
    
    filterProperties();
  }, [properties, activeFilters, searchQuery, imageSearchResults]);
  
  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
      return () => {};
    }, [])
  );
  
  // Helper function to check if location is a string or object
  const isLocationString = (location: string | PropertyLocation): location is string => {
    return typeof location === 'string';
  };
  
  // Filter properties based on search query and active filters
  const filterProperties = () => {
    let result = [...properties];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query) ||
        (property.location && !isLocationString(property.location) && property.location.city?.toLowerCase().includes(query)) ||
        (property.location && !isLocationString(property.location) && property.location.state?.toLowerCase().includes(query)) ||
        (property.location && !isLocationString(property.location) && property.location.address?.toLowerCase().includes(query)) ||
        (property.location && isLocationString(property.location) && property.location.toLowerCase().includes(query))
      );
    }
    
    // Filter by property type
    if (activeFilters.propertyType !== 'all') {
      result = result.filter(property => 
        property.type.toLowerCase() === activeFilters.propertyType.toLowerCase()
      );
    }
    
    // Filter by price range
    result = result.filter(property => 
      property.price >= activeFilters.priceRange[0] &&
      property.price <= activeFilters.priceRange[1]
    );
    
    // Filter by location
    if (activeFilters.location) {
      const locationQuery = activeFilters.location.toLowerCase();
      result = result.filter(property => {
        if (!property.location) return false;
        
        if (isLocationString(property.location)) {
          return property.location.toLowerCase().includes(locationQuery);
        } else {
          return (
            (property.location.city && property.location.city.toLowerCase().includes(locationQuery)) ||
            (property.location.state && property.location.state.toLowerCase().includes(locationQuery)) ||
            (property.location.address && property.location.address.toLowerCase().includes(locationQuery))
          );
        }
      });
    }
    
    // Filter by bedrooms
    if (activeFilters.bedrooms !== 'any') {
      if (activeFilters.bedrooms === '5+') {
        result = result.filter(property => property.bedrooms >= 5);
      } else {
        const bedroomCount = parseInt(activeFilters.bedrooms as string);
        result = result.filter(property => property.bedrooms === bedroomCount);
      }
    }
    
    // Filter by bathrooms
    if (activeFilters.bathrooms !== 'any') {
      if (activeFilters.bathrooms === '4+') {
        result = result.filter(property => property.bathrooms >= 4);
      } else {
        const bathroomCount = parseInt(activeFilters.bathrooms as string);
        result = result.filter(property => property.bathrooms === bathroomCount);
      }
    }
    
    // Filter by amenities
    if (activeFilters.amenities.length > 0) {
      result = result.filter(property => 
        activeFilters.amenities.every(amenity => 
          property.amenities?.includes(amenity)
        )
      );
    }
    
    // Sort properties
    switch (activeFilters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
    }
    
    setFilteredProperties(result);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear image search results when performing text search
    setImageSearchResults(null);
    setSearchImageUri(null);
    
    // Track search for personalization
    if (user && query.trim()) {
      trackSearch(query.trim());
    }
  };
  
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // Track filter usage for personalization
    if (user) {
      trackSearchFilters(filters);
    }
  };
  
  const handleClearFilter = (filterKey: keyof FilterOptions) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      
      // Reset the specific filter
      switch (filterKey) {
        case 'propertyType':
          updated.propertyType = 'all';
          break;
        case 'priceRange':
          updated.priceRange = [100000, 2000000];
          break;
        case 'location':
          updated.location = null;
          break;
        case 'bedrooms':
          updated.bedrooms = 'any';
          break;
        case 'bathrooms':
          updated.bathrooms = 'any';
          break;
        case 'amenities':
          updated.amenities = [];
          break;
        case 'sortBy':
          updated.sortBy = 'newest';
          break;
      }
      
      return updated;
    });
  };
  
  const handleClearAllFilters = () => {
    setActiveFilters({
      propertyType: 'all',
      priceRange: [100000, 2000000],
      location: null,
      bedrooms: 'any',
      bathrooms: 'any',
      amenities: [],
      sortBy: 'newest',
    });
    
    // Also clear image search results
    setImageSearchResults(null);
    setSearchImageUri(null);
  };
  
  const handleViewProperty = (property: Property) => {
    router.push(`/marketplace/${property.id}`);
  };
  
  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  const handleMapView = () => {
    router.push('/marketplace/map');
  };
  
  const handleSuggestedSearchPress = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };
  
  const handleImageSearch = async (imageUri: string) => {
    setSearchImageUri(imageUri);
    
    try {
      const results = await searchPropertiesByImage(imageUri);
      setImageSearchResults(results);
      
      // Track this search for personalization
      trackSearch('Image search');
    } catch (error) {
      console.error('Error performing image search:', error);
    }
  };
  
  const handleClearImageSearch = () => {
    setImageSearchResults(null);
    setSearchImageUri(null);
  };
  
  const renderItem = ({ item }: { item: Property & { similarityScore?: number; matchReasons?: string[] } }) => (
    <PropertyGridCard
      property={item}
      onPress={() => handleViewProperty(item)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      isFavorite={favorites.includes(item.id)}
      style={{ flex: 1, margin: Spacing.sm }}
      similarityScore={item.similarityScore}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search properties..."
            containerStyle={{ flex: 1, marginRight: 8 }}
            onSearch={handleSearch}
            onFilterPress={() => setShowFilterModal(true)}
            onImageSearchPress={() => setShowImageSearchModal(true)}
          />
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleViewMode}
          >
            {viewMode === 'grid' ? (
              <List size={20} color={Colors.text.dark} />
            ) : (
              <Grid size={20} color={Colors.text.dark} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleMapView}
          >
            <MapPin size={20} color={Colors.text.dark} />
          </TouchableOpacity>
        </View>
        
        {/* Show image search indicator if we have image search results */}
        {imageSearchResults && searchImageUri ? (
          <View style={styles.imageSearchIndicator}>
            <Typography variant="body2" color={Colors.text.muted}>
              Showing visual search results
            </Typography>
            <TouchableOpacity onPress={handleClearImageSearch}>
              <Typography variant="body2" color={Colors.primary.main}>
                Clear
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          /* Suggested searches based on user behavior */
          <SuggestedSearches
            recentSearches={recentSearches}
            suggestedSearches={suggestedSearches}
            trendingSearches={trendingSearches}
            onSearchPress={handleSuggestedSearchPress}
          />
        )}
        
        {/* Active filters - don't show during image search */}
        {!imageSearchResults && (
          <ActiveFilters
            filters={activeFilters}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
          />
        )}
      </View>
      
      {isLoading || isImageSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Filter size={48} color={Colors.text.muted} />
          <View style={styles.emptyTextContainer}>
            <Typography variant="h5" align="center">
              No properties found
            </Typography>
            <Typography variant="body2" color={Colors.text.muted} align="center">
              Try adjusting your filters or search query
            </Typography>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleClearAllFilters}
          >
            <Typography variant="body1" color={Colors.common.white}>
              Reset Filters
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
      
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={activeFilters}
        onApply={handleApplyFilters}
      />
      
      <ImageSearchModal
        visible={showImageSearchModal}
        onClose={() => setShowImageSearchModal(false)}
        onSearch={handleImageSearch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  listContent: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTextContainer: {
    marginVertical: Spacing.lg,
  },
  resetButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  imageSearchIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
});