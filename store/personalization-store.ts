import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '@/types/property';
import { userBehaviorService } from '@/services/user-behavior-service';
import { personalizationService } from '@/services/personalization-service';
import { FilterOptions } from '@/components/marketplace/FilterModal';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';

interface PersonalizationState {
  // Personalized content
  personalizedProperties: Property[];
  propertiesOfInterest: Property[];
  suggestedSearches: string[];
  recentSearches: string[];
  trendingSearches: string[];
  personalizedFilters: Partial<FilterOptions>;
  
  // UI adaptations
  featuredCategories: string[];
  highlightedAmenities: string[];
  preferredPriceRange: [number, number];
  
  // Loading states
  isLoadingPersonalizedProperties: boolean;
  isLoadingPropertiesOfInterest: boolean;
  isLoadingUIAdaptations: boolean;
  
  // User behavior tracking
  trackSearch: (query: string) => Promise<void>;
  trackPropertyView: (propertyId: string, duration?: number) => Promise<void>;
  trackSearchFilters: (filters: FilterOptions) => Promise<void>;
  
  // Data fetching
  fetchPersonalizedProperties: () => Promise<void>;
  fetchPropertiesOfInterest: () => Promise<void>;
  fetchPersonalizedUIAdaptations: () => Promise<void>;
  fetchPersonalizedSearchFilters: () => Promise<void>;
  fetchSuggestedSearches: () => Promise<void>;
  
  // Reset
  clearPersonalizationData: () => Promise<void>;
}

const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      personalizedProperties: [],
      propertiesOfInterest: [],
      suggestedSearches: [],
      recentSearches: [],
      trendingSearches: ['Luxury Apartments', 'Waterfront Homes', 'Investment Properties'],
      personalizedFilters: {},
      featuredCategories: [],
      highlightedAmenities: [],
      preferredPriceRange: [100000, 1000000],
      isLoadingPersonalizedProperties: false,
      isLoadingPropertiesOfInterest: false,
      isLoadingUIAdaptations: false,
      
      // Track user search
      trackSearch: async (query: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        await userBehaviorService.trackSearch(user.id, query);
        
        // Update recent searches in state
        const recentSearches = await userBehaviorService.getSearchHistory(user.id);
        set({
          recentSearches: recentSearches.map(item => item.query)
        });
      },
      
      // Track property view
      trackPropertyView: async (propertyId: string, duration?: number) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        await userBehaviorService.trackPropertyView(user.id, propertyId, duration);
      },
      
      // Track search filters
      trackSearchFilters: async (filters: FilterOptions) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        await userBehaviorService.trackSearchFilters(user.id, filters);
      },
      
      // Fetch personalized properties
      fetchPersonalizedProperties: async () => {
        const { user } = useAuthStore.getState();
        const { properties } = usePropertiesStore.getState();
        
        if (!user) return;
        
        set({ isLoadingPersonalizedProperties: true });
        
        try {
          const personalizedProperties = await personalizationService.getPersonalizedRecommendations(
            user.id,
            user,
            properties,
            10
          );
          
          set({
            personalizedProperties,
            isLoadingPersonalizedProperties: false
          });
        } catch (error) {
          console.error('Error fetching personalized properties:', error);
          set({ isLoadingPersonalizedProperties: false });
        }
      },
      
      // Fetch properties of interest
      fetchPropertiesOfInterest: async () => {
        const { user } = useAuthStore.getState();
        const { properties } = usePropertiesStore.getState();
        
        if (!user) return;
        
        set({ isLoadingPropertiesOfInterest: true });
        
        try {
          const propertiesOfInterest = await personalizationService.getPropertiesOfInterest(
            user.id,
            user,
            properties,
            5
          );
          
          set({
            propertiesOfInterest,
            isLoadingPropertiesOfInterest: false
          });
        } catch (error) {
          console.error('Error fetching properties of interest:', error);
          set({ isLoadingPropertiesOfInterest: false });
        }
      },
      
      // Fetch personalized UI adaptations
      fetchPersonalizedUIAdaptations: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        set({ isLoadingUIAdaptations: true });
        
        try {
          const adaptations = await personalizationService.getPersonalizedUIAdaptations(user.id);
          
          set({
            featuredCategories: adaptations.featuredCategories,
            highlightedAmenities: adaptations.highlightedAmenities,
            suggestedSearches: adaptations.suggestedSearches,
            preferredPriceRange: adaptations.preferredPriceRange,
            isLoadingUIAdaptations: false
          });
        } catch (error) {
          console.error('Error fetching personalized UI adaptations:', error);
          set({ isLoadingUIAdaptations: false });
        }
      },
      
      // Fetch personalized search filters
      fetchPersonalizedSearchFilters: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const personalizedFilters = await personalizationService.getPersonalizedSearchFilters(user.id);
          
          set({ personalizedFilters });
        } catch (error) {
          console.error('Error fetching personalized search filters:', error);
        }
      },
      
      // Fetch suggested searches
      fetchSuggestedSearches: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const searchHistory = await userBehaviorService.getSearchHistory(user.id);
          
          set({
            recentSearches: searchHistory.slice(0, 5).map(item => item.query)
          });
        } catch (error) {
          console.error('Error fetching suggested searches:', error);
        }
      },
      
      // Clear personalization data
      clearPersonalizationData: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          await userBehaviorService.clearAllBehaviorData(user.id);
          
          set({
            personalizedProperties: [],
            propertiesOfInterest: [],
            suggestedSearches: [],
            recentSearches: [],
            personalizedFilters: {},
            featuredCategories: [],
            highlightedAmenities: [],
            preferredPriceRange: [100000, 1000000]
          });
        } catch (error) {
          console.error('Error clearing personalization data:', error);
        }
      }
    }),
    {
      name: 'personalization-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        recentSearches: state.recentSearches,
        trendingSearches: state.trendingSearches,
        preferredPriceRange: state.preferredPriceRange
      }),
    }
  )
);

export default usePersonalizationStore;