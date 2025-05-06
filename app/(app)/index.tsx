import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import usePropertiesStore from '@/store/properties-store';
import useRecommendationsStore from '@/store/recommendations-store';
import usePersonalizationStore from '@/store/personalization-store';
import useAuthStore from '@/store/auth-store';
import { Property } from '@/types/property';
import { Recommendation } from '@/types/recommendation';
import Colors from '@/constants/colors';
import propertyCategories from '@/constants/categories';
import SearchBar from '@/components/home/SearchBar';
import CategorySelector from '@/components/home/CategorySelector';
import FeaturedSection from '@/components/home/FeaturedSection';
import RecommendationList from '@/components/recommendations/RecommendationList';
import AIExplanationModal from '@/components/recommendations/AIExplanationModal';
import PersonalizedSection from '@/components/personalization/PersonalizedSection';
import SuggestedSearches from '@/components/personalization/SuggestedSearches';

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuthStore();
  
  const {
    featuredProperties,
    recentProperties,
    popularProperties,
    isLoadingFeatured,
    isLoadingRecent,
    isLoadingPopular,
    fetchFeaturedProperties,
    fetchRecentProperties,
    fetchPopularProperties,
  } = usePropertiesStore();
  
  const {
    personalizedRecommendations,
    isLoadingPersonalized,
    fetchPersonalizedRecommendations,
  } = useRecommendationsStore();
  
  const {
    personalizedProperties,
    propertiesOfInterest,
    recentSearches,
    suggestedSearches,
    trendingSearches,
    featuredCategories,
    isLoadingPersonalizedProperties,
    isLoadingPropertiesOfInterest,
    trackSearch,
    trackPropertyView,
    fetchPersonalizedProperties,
    fetchPropertiesOfInterest,
    fetchPersonalizedUIAdaptations,
    fetchSuggestedSearches,
  } = usePersonalizationStore();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    
    // Set initial category based on personalization if available
    if (featuredCategories.length > 0) {
      setSelectedCategory(featuredCategories[0]);
    } else if (propertyCategories.length > 0) {
      setSelectedCategory(propertyCategories[0].id);
    }
  }, []);
  
  useEffect(() => {
    // Update selected category when featured categories change
    if (featuredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(featuredCategories[0]);
    }
  }, [featuredCategories]);

  const loadData = async () => {
    // Load standard data
    fetchFeaturedProperties();
    fetchRecentProperties();
    fetchPopularProperties();
    
    if (user) {
      // Load personalized data
      fetchPersonalizedRecommendations(user.id);
      fetchPersonalizedProperties();
      fetchPropertiesOfInterest();
      fetchPersonalizedUIAdaptations();
      fetchSuggestedSearches();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Scroll to top when category changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSearch = (query: string) => {
    // Track search for personalization
    if (user && query.trim()) {
      trackSearch(query.trim());
    }
    
    router.push({
      pathname: '/search',
      params: { query },
    });
  };

  const handleViewProperty = (property: Property) => {
    // Track property view for personalization
    if (user) {
      trackPropertyView(property.id);
    }
    
    router.push(`/marketplace/${property.id}`);
  };
  
  const handleViewRecommendation = (recommendation: Recommendation) => {
    router.push(`/marketplace/${recommendation.propertyId}`);
  };
  
  const handleExplainRecommendation = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowExplanationModal(true);
  };
  
  const handleChatWithAI = () => {
    router.push('/chat');
  };
  
  const handleSuggestedSearchPress = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // Get categories to display - use personalized if available, otherwise use default
  const displayCategories = featuredCategories.length > 0
    ? featuredCategories.map(category => ({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        icon: 'home'
      }))
    : propertyCategories;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSearch={handleSearch}
            />
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={handleChatWithAI}
            >
              <MessageSquare size={24} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>
          
          {/* Suggested searches based on user behavior */}
          <SuggestedSearches
            recentSearches={recentSearches}
            suggestedSearches={suggestedSearches}
            trendingSearches={trendingSearches}
            onSearchPress={handleSuggestedSearchPress}
          />
          
          <CategorySelector
            categories={displayCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </View>

        {/* AI-powered personalized properties */}
        {user && personalizedProperties.length > 0 && (
          <PersonalizedSection
            title="Tailored for You"
            subtitle="Based on your browsing history and preferences"
            properties={personalizedProperties}
            isLoading={isLoadingPersonalizedProperties}
            onViewProperty={handleViewProperty}
            onSeeAllPress={() => router.push('/recommendations')}
          />
        )}

        {/* Standard recommendations */}
        {user && personalizedRecommendations.length > 0 && (
          <RecommendationList
            title="Recommended for You"
            subtitle="Based on your preferences"
            recommendations={personalizedRecommendations}
            isLoading={isLoadingPersonalized}
            onSeeAllPress={() => router.push('/recommendations')}
            onExplainPress={handleExplainRecommendation}
            horizontal={true}
          />
        )}

        {/* Properties you might be interested in */}
        {user && propertiesOfInterest.length > 0 && (
          <PersonalizedSection
            title="You Might Like These"
            subtitle="Properties similar to ones you've viewed"
            properties={propertiesOfInterest}
            isLoading={isLoadingPropertiesOfInterest}
            onViewProperty={handleViewProperty}
          />
        )}

        <FeaturedSection
          title="Featured Properties"
          properties={featuredProperties}
          isLoading={isLoadingFeatured}
          onViewProperty={handleViewProperty}
        />

        <FeaturedSection
          title="Recent Properties"
          properties={recentProperties}
          isLoading={isLoadingRecent}
          onViewProperty={handleViewProperty}
        />

        <FeaturedSection
          title="Popular Properties"
          properties={popularProperties}
          isLoading={isLoadingPopular}
          onViewProperty={handleViewProperty}
        />
      </ScrollView>
      
      {selectedRecommendation && (
        <AIExplanationModal
          visible={showExplanationModal}
          propertyId={selectedRecommendation.propertyId}
          propertyTitle={selectedRecommendation.propertyTitle || "Property"}
          explanation={selectedRecommendation.explanation || null}
          onClose={() => setShowExplanationModal(false)}
          onViewProperty={() => handleViewRecommendation(selectedRecommendation)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
});