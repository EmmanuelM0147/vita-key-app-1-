import { Property } from '@/types/property';
import { User } from '@/types/user';
import { Recommendation, RecommendationSource, PropertyMatch, PropertyPreference, RecommendationExplanation } from '@/types/recommendation';
import { mockProperties } from '@/mocks/properties';
import { mockApi } from './api';
import { aiService } from './ai-service';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AI recommendation service
export const recommendationService = {
  // Get personalized recommendations based on user preferences
  getPersonalizedRecommendations: async (userId: string, limit = 5): Promise<Recommendation[]> => {
    await delay(1200); // Simulate AI processing time
    
    try {
      // Get user data
      const userData = await mockApi.auth.getUser(userId);
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Get user preferences
      const preferences = extractUserPreferences(userData);
      
      // Get user's view history and favorites
      const viewHistory = await mockApi.analytics.getUserViewHistory(userId) || [];
      const favoriteIds = userData.favorites || [];
      
      // Use AI service to get recommendations
      const aiRecommendations = await aiService.generateRecommendations(
        userId,
        preferences,
        viewHistory,
        favoriteIds,
        mockProperties
      );
      
      // Map AI recommendations to our Recommendation type
      return aiRecommendations.map(rec => {
        const property = mockProperties.find(p => p.id === rec.propertyId);
        if (!property) return null;
        
        return {
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId,
          property,
          matchScore: rec.matchScore,
          reasons: rec.reasons,
          source: RecommendationSource.AI_PERSONALIZED,
          isViewed: false,
          createdAt: new Date().toISOString(),
        };
      }).filter(Boolean) as Recommendation[];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      
      // Fallback to algorithmic recommendations if AI fails
      const userData = await mockApi.auth.getUser(userId);
      const matchedProperties = await findMatchingProperties(userData, limit);
      
      return matchedProperties.map(match => ({
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        property: match.property,
        matchScore: match.score,
        reasons: match.reasons,
        source: RecommendationSource.AI_PERSONALIZED,
        isViewed: false,
        createdAt: new Date().toISOString(),
      }));
    }
  },
  
  // Get recommendations based on a specific property (similar properties)
  getSimilarProperties: async (propertyId: string, limit = 3): Promise<Recommendation[]> => {
    await delay(800);
    
    try {
      // Get the reference property
      const property = await mockApi.properties.getById(propertyId);
      
      // Find similar properties based on location, price, and features
      const similarProperties = mockProperties
        .filter(p => p.id !== propertyId) // Exclude the reference property
        .map(p => {
          // Calculate similarity score (simplified version)
          const locationScore = p.location?.city === property.location?.city ? 0.4 : 0;
          const priceScore = 0.3 * (1 - Math.min(Math.abs(p.price - property.price) / property.price, 1));
          const typeScore = p.type === property.type ? 0.2 : 0;
          
          // Calculate amenities overlap
          const amenitiesScore = property.amenities && p.amenities 
            ? 0.1 * (p.amenities.filter(a => property.amenities?.includes(a)).length / Math.max(property.amenities.length, 1))
            : 0;
          
          const totalScore = locationScore + priceScore + typeScore + amenitiesScore;
          
          // Generate reasons for recommendation
          const reasons = [];
          if (locationScore > 0) reasons.push('Similar location');
          if (priceScore > 0.15) reasons.push('Similar price range');
          if (typeScore > 0) reasons.push('Same property type');
          if (amenitiesScore > 0.05) reasons.push('Similar amenities');
          
          return {
            property: p,
            score: totalScore,
            reasons
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      return similarProperties.map(match => ({
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: 'system', // System-generated recommendation
        property: match.property,
        matchScore: match.score,
        reasons: match.reasons,
        source: RecommendationSource.SIMILAR_PROPERTY,
        referencePropertyId: propertyId,
        isViewed: false,
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting similar properties:', error);
      return [];
    }
  },
  
  // Get trending properties based on overall popularity and recent activity
  getTrendingProperties: async (limit = 5): Promise<Recommendation[]> => {
    await delay(600);
    
    try {
      // In a real app, this would analyze recent views, inquiries, and favorites
      // For now, we'll simulate trending properties with random selection and scores
      
      const trendingProperties = [...mockProperties]
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, limit)
        .map(property => {
          const trendScore = 0.7 + Math.random() * 0.3; // Random score between 0.7 and 1.0
          const reasons = [
            'Popular in your area',
            'Recently viewed by many users',
            'High inquiry rate'
          ].sort(() => 0.5 - Math.random()).slice(0, 2); // Random 2 reasons
          
          return {
            property,
            score: trendScore,
            reasons
          };
        });
      
      return trendingProperties.map(match => ({
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: 'system', // System-generated recommendation
        property: match.property,
        matchScore: match.score,
        reasons: match.reasons,
        source: RecommendationSource.TRENDING,
        isViewed: false,
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting trending properties:', error);
      return [];
    }
  },
  
  // Get new listings that match user preferences
  getNewListingRecommendations: async (userId: string, limit = 3): Promise<Recommendation[]> => {
    await delay(700);
    
    try {
      // Get user data
      const userData = await mockApi.auth.getUser(userId);
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Get user preferences
      const preferences = extractUserPreferences(userData);
      
      // Get new listings (in a real app, this would filter by date)
      // For demo, we'll just use a random selection of properties
      const newListings = [...mockProperties]
        .sort(() => 0.5 - Math.random())
        .slice(0, limit * 2);
      
      // Filter new listings by user preferences
      const matchingNewListings = await Promise.all(
        newListings.map(async property => {
          // Use AI to predict user interest
          const prediction = await aiService.predictUserInterest(
            userId,
            preferences,
            [], // No view history for this calculation
            userData.favorites || [],
            property
          );
          
          return {
            property,
            score: prediction.interestScore,
            reasons: prediction.reasons
          };
        })
      );
      
      // Sort by match score and take top matches
      return matchingNewListings
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(match => ({
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId,
          property: match.property,
          matchScore: match.score,
          reasons: match.reasons,
          source: RecommendationSource.NEW_LISTING,
          isViewed: false,
          createdAt: new Date().toISOString(),
        }));
    } catch (error) {
      console.error('Error getting new listing recommendations:', error);
      return [];
    }
  },
  
  // Mark a recommendation as viewed
  markRecommendationAsViewed: async (recommendationId: string): Promise<void> => {
    await delay(300);
    // In a real app, this would update the recommendation status in the database
    console.log(`Recommendation ${recommendationId} marked as viewed`);
  },
  
  // Track user interaction with a recommendation (click, inquiry, favorite)
  trackRecommendationInteraction: async (
    recommendationId: string, 
    interactionType: 'view' | 'inquiry' | 'favorite'
  ): Promise<void> => {
    await delay(300);
    // In a real app, this would log the interaction for AI model improvement
    console.log(`Interaction tracked: ${interactionType} for recommendation ${recommendationId}`);
  },
  
  // Get explanation for why a property was recommended
  getRecommendationExplanation: async (
    userId: string,
    propertyId: string
  ): Promise<RecommendationExplanation> => {
    await delay(800);
    
    try {
      // Get user data
      const userData = await mockApi.auth.getUser(userId);
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Get property data
      const property = await mockApi.properties.getById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Get user preferences
      const preferences = extractUserPreferences(userData);
      
      // Use AI to generate explanation
      return await aiService.explainRecommendation(
        propertyId,
        preferences,
        property
      );
    } catch (error) {
      console.error('Error getting recommendation explanation:', error);
      
      // Return a fallback explanation
      return {
        summary: "This property appears to match several of your preferences.",
        factors: [
          {
            title: "Location Match",
            description: "The property is in an area you've shown interest in.",
            score: 4
          },
          {
            title: "Price Range",
            description: "The price falls within your budget constraints.",
            score: 3.5
          },
          {
            title: "Property Features",
            description: "This property has features similar to ones you've viewed before.",
            score: 4
          }
        ],
        conclusion: "Based on your preferences and past behavior, our AI system identified this property as a potential match for you."
      };
    }
  },
  
  // Check if a new property would interest a user
  checkPropertyInterest: async (userId: string, propertyId: string): Promise<{
    isInterested: boolean;
    score: number;
    reasons: string[];
  }> => {
    await delay(500);
    
    try {
      // Get user data
      const userData = await mockApi.auth.getUser(userId);
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Get property data
      const property = await mockApi.properties.getById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Get user preferences
      const preferences = extractUserPreferences(userData);
      
      // Get user's view history and favorites
      const viewHistory = await mockApi.analytics.getUserViewHistory(userId) || [];
      const favoriteIds = userData.favorites || [];
      
      // Use AI to predict user interest
      const prediction = await aiService.predictUserInterest(
        userId,
        preferences,
        viewHistory,
        favoriteIds,
        property
      );
      
      return {
        isInterested: prediction.interestScore >= 0.7,
        score: prediction.interestScore,
        reasons: prediction.reasons
      };
    } catch (error) {
      console.error('Error checking property interest:', error);
      return {
        isInterested: false,
        score: 0,
        reasons: []
      };
    }
  }
};

// Helper function to find properties that match user preferences
async function findMatchingProperties(user: User, limit: number): Promise<PropertyMatch[]> {
  // Get user preferences
  const preferences = user.preferences || {
    location: '',
    priceRange: { min: 0, max: 1000000 },
    propertyTypes: [],
    bedrooms: 0,
    bathrooms: 0
  };
  
  // Get user's past interactions (in a real app, this would come from analytics)
  const viewedProperties = mockProperties.slice(0, 3); // Simulate recently viewed
  const favoritePropertyIds = user.favorites || [];
  
  // Calculate match scores for all properties
  const matchedProperties = mockProperties.map(property => {
    let score = 0;
    const reasons: string[] = [];
    
    // Location match (30% weight)
    if (preferences.location && property.location?.city?.toLowerCase().includes(preferences.location.toLowerCase())) {
      score += 0.3;
      reasons.push('Matches your preferred location');
    }
    
    // Price range match (25% weight)
    if (property.price >= preferences.priceRange.min && property.price <= preferences.priceRange.max) {
      score += 0.25;
      reasons.push('Within your budget range');
    }
    
    // Property type match (15% weight)
    if (preferences.propertyTypes.length === 0 || preferences.propertyTypes.includes(property.type)) {
      score += 0.15;
      reasons.push('Matches your preferred property type');
    }
    
    // Bedrooms match (10% weight)
    if (property.bedrooms >= preferences.bedrooms) {
      score += 0.1;
      reasons.push(`Has ${property.bedrooms} bedrooms`);
    }
    
    // Bathrooms match (10% weight)
    if (property.bathrooms >= preferences.bathrooms) {
      score += 0.1;
      reasons.push(`Has ${property.bathrooms} bathrooms`);
    }
    
    // Similar to favorites (bonus 10% weight)
    if (favoritePropertyIds.includes(property.id)) {
      score += 0.1;
      reasons.push("Similar to properties you've favorited");
    }
    
    return {
      property,
      score,
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    };
  });
  
  // Sort by match score and return top matches
  return matchedProperties
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Helper function to extract user preferences in the format needed for AI
function extractUserPreferences(user: User): PropertyPreference {
  const preferences = user.preferences || {
    location: '',
    priceRange: { min: 0, max: 1000000 },
    propertyTypes: [],
    bedrooms: 0,
    bathrooms: 0
  };
  
  return {
    locations: preferences.location ? [preferences.location] : [],
    priceRange: preferences.priceRange,
    propertyTypes: preferences.propertyTypes || [],
    bedrooms: preferences.bedrooms || 0,
    bathrooms: preferences.bathrooms || 0,
    amenities: user.preferredAmenities || []
  };
}