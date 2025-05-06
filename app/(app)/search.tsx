import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Typography from '@/components/ui/Typography';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import SearchBar from '@/components/home/SearchBar';
import CategorySelector from '@/components/home/CategorySelector';
import PropertyCard from '@/components/ui/PropertyCard';
import ImageSearchModal from '@/components/search/ImageSearchModal';
import ImageSearchResults from '@/components/search/ImageSearchResults';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import propertyCategories from '@/constants/categories';
import usePropertiesStore from '@/store/properties-store';
import usePersonalizationStore from '@/store/personalization-store';
import imageRecognitionService from '@/services/image-recognition';
import { Property, PropertyFeature } from '@/types/property';

export default function SearchScreen() {
  const { properties, fetchProperties, toggleFavorite, isFavorite } = usePropertiesStore();
  const { trackSearch } = usePersonalizationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  
  // Image search state
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState<Array<Property & { similarityScore: number; matchReasons: string[] }> | null>(null);
  const [searchImageUri, setSearchImageUri] = useState<string | null>(null);

  // Load properties on initial render and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await fetchProperties();
        setIsLoading(false);
      };
      
      loadData();
    }, [])
  );

  // Filter properties based on search query and category
  useEffect(() => {
    if (imageSearchResults) {
      // If we have image search results, don't apply text filters
      return;
    }
    
    // Filter properties based on search query and category
    let filtered = properties;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(query) ||
        (typeof property.location === 'string' 
          ? property.location.toLowerCase().includes(query)
          : (property.location?.city?.toLowerCase().includes(query) ||
             property.location?.state?.toLowerCase().includes(query) ||
             property.location?.address?.toLowerCase().includes(query)))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(property => property.type === selectedCategory);
    }
    
    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedCategory, imageSearchResults]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    trackSearch(query); // Track search for personalization
    
    // Clear image search results when performing text search
    setImageSearchResults(null);
    setSearchImageUri(null);
  };

  const handleImageSearch = async (imageUri: string, detectedFeatures: PropertyFeature[]) => {
    setIsImageSearching(true);
    setSearchImageUri(imageUri);
    
    try {
      // Find similar properties based on the image
      const results = await imageRecognitionService.findSimilarProperties(imageUri, properties);
      setImageSearchResults(results);
      
      // Track this search for personalization
      if (detectedFeatures.length > 0) {
        const searchTerms = detectedFeatures.map(f => f.name).join(', ');
        trackSearch(`Image search: ${searchTerms}`);
      } else {
        trackSearch('Image search');
      }
    } catch (error) {
      console.error('Error performing image search:', error);
      setImageSearchResults([]);
    } finally {
      setIsImageSearching(false);
    }
  };

  const handleClearImageSearch = () => {
    setImageSearchResults(null);
    setSearchImageUri(null);
  };

  const handlePropertyPress = (property: Property) => {
    // Navigate to property details
    console.log('Property pressed:', property.id);
  };

  const handleFavoritePress = (property: Property) => {
    toggleFavorite(property.id);
  };

  const handleFilterPress = () => {
    // Open filter modal
    console.log('Filter pressed');
  };

  const renderItem = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      onFavoritePress={() => handleFavoritePress(item)}
      style={styles.propertyCard}
    />
  );

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h3" style={styles.title}>
            Search Properties
          </Typography>
        </View>
        
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onFilterPress={handleFilterPress}
          onImageSearchPress={() => setShowImageSearchModal(true)}
          placeholder="Search by location, name, etc."
        />
        
        {!imageSearchResults && (
          <CategorySelector
            categories={propertyCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}
        
        {isLoading || isImageSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
          </View>
        ) : imageSearchResults ? (
          // Show image search results
          <ImageSearchResults
            searchImage={searchImageUri!}
            results={imageSearchResults}
            onClearResults={handleClearImageSearch}
          />
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Typography variant="body2" color={Colors.text.muted}>
                {filteredProperties.length} properties found
              </Typography>
            </View>
            
            <FlatList
              data={filteredProperties}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Typography variant="body1" color={Colors.text.muted} align="center">
                    No properties found matching your criteria.
                  </Typography>
                </View>
              }
            />
          </>
        )}
      </View>
      
      <ImageSearchModal
        visible={showImageSearchModal}
        onClose={() => setShowImageSearchModal(false)}
        onSearch={handleImageSearch}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsHeader: {
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  propertyCard: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
});