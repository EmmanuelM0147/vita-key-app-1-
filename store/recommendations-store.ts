import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recommendation, RecommendationSettings, RecommendationExplanation } from '@/types/recommendation';
import { recommendationService } from '@/services/recommendation-service';

interface RecommendationsState {
  // Recommendations data
  personalizedRecommendations: Recommendation[];
  trendingRecommendations: Recommendation[];
  newListingRecommendations: Recommendation[];
  
  // Loading states
  isLoadingPersonalized: boolean;
  isLoadingTrending: boolean;
  isLoadingNewListings: boolean;
  isLoadingExplanation: boolean;
  
  // Settings
  settings: RecommendationSettings;
  
  // Current explanation
  currentExplanation: RecommendationExplanation | null;
  
  // Actions
  fetchPersonalizedRecommendations: (userId: string) => Promise<void>;
  fetchTrendingProperties: () => Promise<void>;
  fetchNewListingRecommendations: (userId: string) => Promise<void>;
  fetchRecommendationExplanation: (userId: string, propertyId: string) => Promise<RecommendationExplanation>;
  markRecommendationAsViewed: (recommendationId: string) => Promise<void>;
  trackRecommendationInteraction: (recommendationId: string, interactionType: 'view' | 'inquiry' | 'favorite') => Promise<void>;
  updateSettings: (newSettings: Partial<RecommendationSettings>) => void;
  clearExplanation: () => void;
}

// Default settings
const defaultSettings: RecommendationSettings = {
  enablePersonalized: true,
  enableSimilarProperties: true,
  enableTrending: true,
  minMatchScore: 0.7,
  notifyOnNewMatches: true,
  maxRecommendationsPerDay: 5
};

const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      // Initial state
      personalizedRecommendations: [],
      trendingRecommendations: [],
      newListingRecommendations: [],
      isLoadingPersonalized: false,
      isLoadingTrending: false,
      isLoadingNewListings: false,
      isLoadingExplanation: false,
      settings: defaultSettings,
      currentExplanation: null,
      
      // Fetch personalized recommendations
      fetchPersonalizedRecommendations: async (userId: string) => {
        set({ isLoadingPersonalized: true });
        
        try {
          const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
          
          // Filter by minimum match score from settings
          const { minMatchScore } = get().settings;
          const filteredRecommendations = recommendations.filter(rec => rec.matchScore >= minMatchScore);
          
          set({
            personalizedRecommendations: filteredRecommendations,
            isLoadingPersonalized: false,
          });
        } catch (error) {
          console.error('Error fetching personalized recommendations:', error);
          set({ isLoadingPersonalized: false });
        }
      },
      
      // Fetch trending properties
      fetchTrendingProperties: async () => {
        set({ isLoadingTrending: true });
        
        try {
          const recommendations = await recommendationService.getTrendingProperties();
          set({
            trendingRecommendations: recommendations,
            isLoadingTrending: false,
          });
        } catch (error) {
          console.error('Error fetching trending properties:', error);
          set({ isLoadingTrending: false });
        }
      },
      
      // Fetch new listing recommendations
      fetchNewListingRecommendations: async (userId: string) => {
        set({ isLoadingNewListings: true });
        
        try {
          const recommendations = await recommendationService.getNewListingRecommendations(userId);
          
          // Filter by minimum match score from settings
          const { minMatchScore } = get().settings;
          const filteredRecommendations = recommendations.filter(rec => rec.matchScore >= minMatchScore);
          
          set({
            newListingRecommendations: filteredRecommendations,
            isLoadingNewListings: false,
          });
        } catch (error) {
          console.error('Error fetching new listing recommendations:', error);
          set({ isLoadingNewListings: false });
        }
      },
      
      // Fetch explanation for a recommendation
      fetchRecommendationExplanation: async (userId: string, propertyId: string) => {
        set({ isLoadingExplanation: true });
        
        try {
          const explanation = await recommendationService.getRecommendationExplanation(userId, propertyId);
          set({
            currentExplanation: explanation,
            isLoadingExplanation: false,
          });
          return explanation;
        } catch (error) {
          console.error('Error fetching recommendation explanation:', error);
          set({ isLoadingExplanation: false });
          throw error;
        }
      },
      
      // Mark a recommendation as viewed
      markRecommendationAsViewed: async (recommendationId: string) => {
        await recommendationService.markRecommendationAsViewed(recommendationId);
        
        // Update local state to mark as viewed
        set(state => ({
          personalizedRecommendations: state.personalizedRecommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, isViewed: true } : rec
          ),
          trendingRecommendations: state.trendingRecommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, isViewed: true } : rec
          ),
          newListingRecommendations: state.newListingRecommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, isViewed: true } : rec
          )
        }));
      },
      
      // Track user interaction with a recommendation
      trackRecommendationInteraction: async (recommendationId: string, interactionType: 'view' | 'inquiry' | 'favorite') => {
        await recommendationService.trackRecommendationInteraction(recommendationId, interactionType);
      },
      
      // Update recommendation settings
      updateSettings: (newSettings: Partial<RecommendationSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        }));
      },
      
      // Clear current explanation
      clearExplanation: () => {
        set({ currentExplanation: null });
      }
    }),
    {
      name: 'recommendations-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist settings, not the recommendations themselves
        settings: state.settings
      }),
    }
  )
);

export default useRecommendationsStore;