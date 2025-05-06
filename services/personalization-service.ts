import { Property } from '@/types/property';
import { User } from '@/types/user';
import { userBehaviorService } from './user-behavior-service';
import { aiService } from './ai-service';
import { FilterOptions } from '@/components/marketplace/FilterModal';

/**
 * Service for personalizing the user experience based on behavior
 */
export const personalizationService = {
  /**
   * Get personalized property recommendations based on user behavior
   */
  getPersonalizedRecommendations: async (
    userId: string,
    user: User,
    availableProperties: Property[],
    limit: number = 10
  ): Promise<Property[]> => {
    try {
      // Get user behavior data
      const viewedProperties = await userBehaviorService.getViewedProperties(userId);
      const viewedIds = viewedProperties.map(p => p.propertyId);
      
      // Get inferred preferences from behavior
      const inferredPreferences = await userBehaviorService.getInferredPreferences(userId);
      
      // Combine explicit preferences (from user profile) with inferred preferences
      const combinedPreferences = {
        locations: [
          ...(user.preferences?.locations || []),
          ...inferredPreferences.locations
        ],
        propertyTypes: [
          ...(user.preferences?.propertyTypes || []),
          ...inferredPreferences.propertyTypes
        ],
        priceRange: {
          min: user.preferences?.priceRange?.min || inferredPreferences.priceRange[0],
          max: user.preferences?.priceRange?.max || inferredPreferences.priceRange[1]
        },
        amenities: [
          ...(user.preferences?.amenities || []),
          ...inferredPreferences.amenities
        ],
        bedrooms: user.preferences?.bedrooms || 0,
        bathrooms: user.preferences?.bathrooms || 0
      };
      
      // Use AI service to get recommendations
      const recommendations = await aiService.generateRecommendations(
        userId,
        combinedPreferences,
        viewedIds,
        user.favorites || [],
        availableProperties
      );
      
      // Map recommendations to properties
      const recommendedProperties = recommendations
        .map((rec: any) => {
          const property = availableProperties.find(p => p.id === rec.propertyId);
          return property ? {
            ...property,
            matchScore: rec.matchScore,
            matchReasons: rec.reasons
          } : null;
        })
        .filter((p: any) => p !== null) as Property[];
      
      return recommendedProperties.slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  },
  
  /**
   * Get personalized search filters based on user behavior
   */
  getPersonalizedSearchFilters: async (userId: string): Promise<Partial<FilterOptions>> => {
    try {
      // Get inferred preferences from behavior
      const inferredPreferences = await userBehaviorService.getInferredPreferences(userId);
      
      // Get recent search filters
      const recentFilters = await userBehaviorService.getSearchFilters(userId);
      
      // Create personalized filters
      const personalizedFilters: Partial<FilterOptions> = {};
      
      // Use most frequent property type if available
      if (inferredPreferences.propertyTypes.length > 0) {
        personalizedFilters.propertyType = inferredPreferences.propertyTypes[0];
      }
      
      // Use inferred price range
      personalizedFilters.priceRange = inferredPreferences.priceRange;
      
      // Use most frequent location if available
      if (inferredPreferences.locations.length > 0) {
        personalizedFilters.location = inferredPreferences.locations[0];
      }
      
      // Use top amenities
      if (inferredPreferences.amenities.length > 0) {
        personalizedFilters.amenities = inferredPreferences.amenities;
      }
      
      return personalizedFilters;
    } catch (error) {
      console.error('Error getting personalized search filters:', error);
      return {};
    }
  },
  
  /**
   * Get personalized UI adaptations based on user behavior
   */
  getPersonalizedUIAdaptations: async (userId: string): Promise<{
    featuredCategories: string[];
    highlightedAmenities: string[];
    suggestedSearches: string[];
    preferredPriceRange: [number, number];
  }> => {
    try {
      // Get user behavior data
      const searchHistory = await userBehaviorService.getSearchHistory(userId);
      const amenityPreferences = await userBehaviorService.getAmenityPreferences(userId);
      const propertyTypePreferences = await userBehaviorService.getPropertyTypePreferences(userId);
      const priceRangePreferences = await userBehaviorService.getPriceRangePreferences(userId);
      
      // Extract featured categories (property types)
      const featuredCategories = propertyTypePreferences
        .slice(0, 3)
        .map(p => p.type);
      
      // Extract highlighted amenities
      const highlightedAmenities = amenityPreferences
        .slice(0, 5)
        .map(p => p.amenity);
      
      // Extract suggested searches
      const suggestedSearches = searchHistory
        .slice(0, 5)
        .map(s => s.query);
      
      // Extract preferred price range
      const preferredPriceRange: [number, number] = priceRangePreferences.length > 0
        ? [priceRangePreferences[0].min, priceRangePreferences[0].max]
        : [100000, 1000000];
      
      return {
        featuredCategories,
        highlightedAmenities,
        suggestedSearches,
        preferredPriceRange
      };
    } catch (error) {
      console.error('Error getting personalized UI adaptations:', error);
      return {
        featuredCategories: [],
        highlightedAmenities: [],
        suggestedSearches: [],
        preferredPriceRange: [100000, 1000000]
      };
    }
  },
  
  /**
   * Get properties that might interest the user based on behavior
   */
  getPropertiesOfInterest: async (
    userId: string,
    user: User,
    availableProperties: Property[],
    limit: number = 5
  ): Promise<Property[]> => {
    try {
      // Get viewed properties
      const viewedProperties = await userBehaviorService.getViewedProperties(userId);
      const viewedIds = viewedProperties.map(p => p.propertyId);
      
      // Get inferred preferences
      const inferredPreferences = await userBehaviorService.getInferredPreferences(userId);
      
      // Filter properties that match preferences but haven't been viewed
      const propertiesOfInterest = availableProperties.filter(property => {
        // Skip if already viewed
        if (viewedIds.includes(property.id)) {
          return false;
        }
        
        // Skip if already in favorites
        if (user.favorites?.includes(property.id)) {
          return false;
        }
        
        let score = 0;
        
        // Check location match
        if (inferredPreferences.locations.some(loc => {
          if (typeof property.location === 'string') {
            return property.location.toLowerCase().includes(loc.toLowerCase());
          } else if (property.location) {
            return (
              property.location.city?.toLowerCase().includes(loc.toLowerCase()) ||
              property.location.state?.toLowerCase().includes(loc.toLowerCase()) ||
              property.location.address?.toLowerCase().includes(loc.toLowerCase())
            );
          }
          return false;
        })) {
          score += 0.4;
        }
        
        // Check property type match
        if (inferredPreferences.propertyTypes.includes(property.type)) {
          score += 0.3;
        }
        
        // Check price range match
        if (
          property.price >= inferredPreferences.priceRange[0] &&
          property.price <= inferredPreferences.priceRange[1]
        ) {
          score += 0.2;
        }
        
        // Check amenities match
        if (property.amenities) {
          const matchingAmenities = property.amenities.filter(a => 
            inferredPreferences.amenities.includes(a)
          );
          
          if (matchingAmenities.length > 0) {
            score += 0.1 * Math.min(matchingAmenities.length / inferredPreferences.amenities.length, 1);
          }
        }
        
        // Consider it a match if score is high enough
        return score >= 0.5;
      });
      
      // Sort by relevance (could be enhanced with AI ranking)
      return propertiesOfInterest.slice(0, limit);
    } catch (error) {
      console.error('Error getting properties of interest:', error);
      return [];
    }
  }
};

export default personalizationService;