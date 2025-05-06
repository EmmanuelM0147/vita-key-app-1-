import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property, PropertyFormData, PropertyStatus, PropertyLocation, PropertyFeature } from '@/types/property';
import { FilterOptions } from '@/components/marketplace/FilterModal';
import { 
  sendNewListingNotification, 
  sendPriceChangeNotification,
  propertyMatchesPreferences
} from '@/services/notification';
import useAuthStore from '@/store/auth-store';
import { User } from '@/types/user';
import { mockApi } from '@/services/api';
import imageRecognitionService from '@/services/image-recognition';

// Mock properties data
import { mockProperties } from '@/mocks/properties';

// Default filter values
const defaultFilters: FilterOptions = {
  propertyType: 'all',
  priceRange: [100000, 2000000],
  location: null,
  bedrooms: 'any',
  bathrooms: 'any',
  amenities: [],
  sortBy: 'newest'
};

interface PropertiesState {
  properties: Property[];
  favorites: string[];
  recentSearches: string[];
  savedSearches: FilterOptions[];
  filterOptions: FilterOptions;
  filteredProperties: Property[];
  isLoading: boolean;
  
  // Featured, Recent, and Popular properties
  featuredProperties: Property[];
  recentProperties: Property[];
  popularProperties: Property[];
  isLoadingFeatured: boolean;
  isLoadingRecent: boolean;
  isLoadingPopular: boolean;
  
  // Image search results
  imageSearchResults: Array<Property & { similarityScore: number; matchReasons: string[] }> | null;
  isImageSearching: boolean;
  
  // Actions
  fetchProperties: () => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  fetchRecentProperties: () => Promise<void>;
  fetchPopularProperties: () => Promise<void>;
  addProperty: (property: Partial<Property>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  saveSearch: (filter: FilterOptions) => void;
  removeSavedSearch: (index: number) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  applyFilters: (options?: Partial<FilterOptions>) => Property[];
  clearFilter: (filterType: keyof FilterOptions) => void;
  getPropertyById: (id: string) => Property | undefined;
  changePropertyStatus: (id: string, status: PropertyStatus) => Promise<void>;
  searchPropertiesByImage: (imageUri: string) => Promise<Array<Property & { similarityScore: number; matchReasons: string[] }>>;
  clearImageSearchResults: () => void;
  extractFeaturesFromImage: (imageUri: string) => Promise<{
    propertyType?: string;
    estimatedBedrooms?: number;
    estimatedBathrooms?: number;
    detectedFeatures: PropertyFeature[];
    architecturalStyle?: string;
    condition?: string;
    outdoorSpace?: boolean;
    confidence: number;
  }>;
}

const usePropertiesStore = create<PropertiesState>()(
  persist(
    (set, get) => ({
      properties: mockProperties,
      favorites: [],
      recentSearches: [],
      savedSearches: [],
      filterOptions: defaultFilters,
      filteredProperties: mockProperties,
      isLoading: false,
      
      // Initialize featured, recent, and popular properties
      featuredProperties: [],
      recentProperties: [],
      popularProperties: [],
      isLoadingFeatured: false,
      isLoadingRecent: false,
      isLoadingPopular: false,
      
      // Initialize image search results
      imageSearchResults: null,
      isImageSearching: false,

      fetchProperties: async () => {
        set({ isLoading: true });
        try {
          // In a real app, we would fetch from an API
          // const response = await mockApi.properties.getAll();
          // set({ properties: response, filteredProperties: response, isLoading: false });
          
          // For now, we'll just use the mock data with a delay to simulate network request
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ 
            properties: mockProperties, 
            filteredProperties: get().applyFilters(),
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching properties:', error);
          set({ isLoading: false });
        }
      },
      
      fetchFeaturedProperties: async () => {
        set({ isLoadingFeatured: true });
        try {
          // Simulate API call with delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Filter properties to get featured ones (for demo, we'll just take the first 5)
          const featured = mockProperties
            .filter(p => p.status === 'active')
            .slice(0, 5);
            
          set({ featuredProperties: featured, isLoadingFeatured: false });
        } catch (error) {
          console.error('Error fetching featured properties:', error);
          set({ isLoadingFeatured: false });
        }
      },
      
      fetchRecentProperties: async () => {
        set({ isLoadingRecent: true });
        try {
          // Simulate API call with delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Sort by listed date to get most recent
          const recent = [...mockProperties]
            .sort((a, b) => {
              const dateA = a.listedDate ? new Date(a.listedDate).getTime() : 0;
              const dateB = b.listedDate ? new Date(b.listedDate).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 5);
            
          set({ recentProperties: recent, isLoadingRecent: false });
        } catch (error) {
          console.error('Error fetching recent properties:', error);
          set({ isLoadingRecent: false });
        }
      },
      
      fetchPopularProperties: async () => {
        set({ isLoadingPopular: true });
        try {
          // Simulate API call with delay
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          // For demo, we'll just shuffle and take 5 properties
          const shuffled = [...mockProperties]
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
            
          set({ popularProperties: shuffled, isLoadingPopular: false });
        } catch (error) {
          console.error('Error fetching popular properties:', error);
          set({ isLoadingPopular: false });
        }
      },

      addProperty: async (property: Partial<Property>) => {
        set({ isLoading: true });
        try {
          // Generate a unique ID
          const id = Math.random().toString(36).substring(2, 15);
          
          // Create a new property with default values for missing fields
          const newProperty: Property = {
            id,
            title: '',
            description: '',
            price: 0,
            location: '',
            bedrooms: 0,
            bathrooms: 0,
            area: 0,
            images: [],
            amenities: [],
            status: 'active',
            type: 'house',
            agentId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            listedDate: new Date().toISOString(),
            ...property
          };
          
          // In a real app, we would send to an API
          // await mockApi.properties.create(newProperty);
          
          // Add to local state
          set((state) => {
            const newProperties = [newProperty, ...state.properties];
            
            // Send notifications to users with matching preferences
            const auth = useAuthStore.getState();
            if (auth.user) {
              // Check if the current user's preferences match the property
              if (auth.user.preferences) {
                const matchResult = propertyMatchesPreferences(newProperty, auth.user);
                // Only notify if it's a match
                if (matchResult && matchResult.isMatch) {
                  // In a real app, we would fetch all users with matching preferences
                  // For now, we'll just notify the current user if their preferences match
                  sendNewListingNotification([auth.user], newProperty);
                }
              }
            }
            
            return { 
              properties: newProperties,
              filteredProperties: get().applyFilters(),
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error adding property:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateProperty: async (id: string, updates: Partial<Property>) => {
        set({ isLoading: true });
        try {
          // In a real app, we would send to an API
          // await mockApi.properties.update(id, updates);
          
          set((state) => {
            const index = state.properties.findIndex(p => p.id === id);
            if (index === -1) {
              set({ isLoading: false });
              throw new Error('Property not found');
            }

            const oldProperty = state.properties[index];
            const updatedProperties = [...state.properties];
            updatedProperties[index] = { ...oldProperty, ...updates, updatedAt: new Date().toISOString() };

            // Check if price changed and notify users who favorited this property
            if (updates.price && updates.price !== oldProperty.price) {
              // Get user from auth store
              const currentUser = useAuthStore.getState().user;
              
              if (currentUser && state.favorites.includes(id)) {
                // Send price change notification to the current user
                sendPriceChangeNotification(
                  updatedProperties[index],
                  oldProperty.price,
                  updates.price,
                  [currentUser]
                );
              }
            }

            return { 
              properties: updatedProperties,
              filteredProperties: get().applyFilters(),
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error updating property:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      deleteProperty: async (id: string) => {
        set({ isLoading: true });
        try {
          // In a real app, we would send to an API
          // await mockApi.properties.delete(id);
          
          set((state) => {
            const updatedProperties = state.properties.filter(p => p.id !== id);
            return { 
              properties: updatedProperties,
              filteredProperties: get().applyFilters(),
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error deleting property:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      changePropertyStatus: async (id: string, status: PropertyStatus) => {
        try {
          await get().updateProperty(id, { status });
        } catch (error) {
          console.error('Error changing property status:', error);
          throw error;
        }
      },

      toggleFavorite: (propertyId: string) => {
        set((state) => {
          const isFavorite = state.favorites.includes(propertyId);
          const updatedFavorites = isFavorite
            ? state.favorites.filter(id => id !== propertyId)
            : [...state.favorites, propertyId];
          
          return { favorites: updatedFavorites };
        });
      },

      isFavorite: (propertyId: string) => {
        return get().favorites.includes(propertyId);
      },

      addRecentSearch: (search: string) => {
        set((state) => {
          // Remove duplicate if exists
          const filteredSearches = state.recentSearches.filter(s => s !== search);
          // Add to beginning and limit to 10 items
          const updatedSearches = [search, ...filteredSearches].slice(0, 10);
          return { recentSearches: updatedSearches };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      saveSearch: (filter: FilterOptions) => {
        set((state) => ({
          savedSearches: [...state.savedSearches, filter]
        }));
      },

      removeSavedSearch: (index: number) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter((_, i) => i !== index)
        }));
      },

      setFilterOptions: (options: Partial<FilterOptions>) => {
        set((state) => ({
          filterOptions: { ...state.filterOptions, ...options }
        }));
      },

      resetFilters: () => {
        set({ filterOptions: defaultFilters });
      },

      clearFilter: (filterType: keyof FilterOptions) => {
        set((state) => {
          const updatedFilters = { ...state.filterOptions };
          
          // Reset the specific filter type to its default value
          switch (filterType) {
            case 'propertyType':
              updatedFilters.propertyType = defaultFilters.propertyType;
              break;
            case 'priceRange':
              updatedFilters.priceRange = defaultFilters.priceRange;
              break;
            case 'location':
              updatedFilters.location = defaultFilters.location;
              break;
            case 'bedrooms':
              updatedFilters.bedrooms = defaultFilters.bedrooms;
              break;
            case 'bathrooms':
              updatedFilters.bathrooms = defaultFilters.bathrooms;
              break;
            case 'amenities':
              updatedFilters.amenities = defaultFilters.amenities;
              break;
            case 'sortBy':
              updatedFilters.sortBy = defaultFilters.sortBy;
              break;
          }
          
          return { 
            filterOptions: updatedFilters,
            filteredProperties: get().applyFilters(updatedFilters)
          };
        });
      },

      applyFilters: (options?: Partial<FilterOptions>) => {
        const { properties } = get();
        const filterOptions = options ? { ...get().filterOptions, ...options } : get().filterOptions;
        
        // Update filter options if provided
        if (options) {
          set({ filterOptions });
        }
        
        const filtered = properties.filter(property => {
          // Filter by property type
          if (filterOptions.propertyType !== 'all' && 
              property.type !== filterOptions.propertyType) {
            return false;
          }
          
          // Filter by price range
          const [minPrice, maxPrice] = filterOptions.priceRange;
          if (property.price < minPrice || property.price > maxPrice) {
            return false;
          }
          
          // Filter by location - handle both string and object locations
          if (filterOptions.location && property.location) {
            if (typeof property.location === 'string') {
              if (!property.location.toLowerCase().includes(filterOptions.location.toLowerCase())) {
                return false;
              }
            } else if (typeof property.location === 'object') {
              // Check if any of the location fields contain the search term
              const locationObj = property.location as PropertyLocation;
              const searchTerm = filterOptions.location.toLowerCase();
              const addressMatch = locationObj.address ? locationObj.address.toLowerCase().includes(searchTerm) : false;
              const cityMatch = locationObj.city ? locationObj.city.toLowerCase().includes(searchTerm) : false;
              const stateMatch = locationObj.state ? locationObj.state.toLowerCase().includes(searchTerm) : false;
              
              if (!addressMatch && !cityMatch && !stateMatch) {
                return false;
              }
            }
          }
          
          // Filter by bedrooms
          if (filterOptions.bedrooms !== 'any') {
            if (filterOptions.bedrooms === '5+') {
              if (property.bedrooms < 5) {
                return false;
              }
            } else {
              const bedroomCount = parseInt(filterOptions.bedrooms.toString());
              if (property.bedrooms !== bedroomCount) {
                return false;
              }
            }
          }
          
          // Filter by bathrooms
          if (filterOptions.bathrooms !== 'any') {
            if (filterOptions.bathrooms === '4+') {
              if (property.bathrooms < 4) {
                return false;
              }
            } else {
              const bathroomCount = parseInt(filterOptions.bathrooms.toString());
              if (property.bathrooms !== bathroomCount) {
                return false;
              }
            }
          }
          
          // Filter by amenities
          if (filterOptions.amenities && filterOptions.amenities.length > 0) {
            // Check if property.amenities exists before filtering
            if (!property.amenities) {
              return false;
            }
            
            for (const amenity of filterOptions.amenities) {
              if (!property.amenities.includes(amenity)) {
                return false;
              }
            }
          }
          
          return true;
        }).sort((a, b) => {
          // Sort properties based on sortBy option
          switch (filterOptions.sortBy) {
            case 'priceAsc':
            case 'price_asc':
              return a.price - b.price;
            case 'priceDesc':
            case 'price_desc':
              return b.price - a.price;
            case 'newest':
              // Ensure listedDate exists and convert to Date safely
              const dateA = a.listedDate ? new Date(a.listedDate).getTime() : 0;
              const dateB = b.listedDate ? new Date(b.listedDate).getTime() : 0;
              return dateB - dateA;
            case 'oldest':
              // Ensure listedDate exists and convert to Date safely
              const dateC = a.listedDate ? new Date(a.listedDate).getTime() : 0;
              const dateD = b.listedDate ? new Date(b.listedDate).getTime() : 0;
              return dateC - dateD;
            default:
              return 0;
          }
        });
        
        // Update the filteredProperties state
        set({ filteredProperties: filtered });
        
        return filtered;
      },

      // Add the getPropertyById method
      getPropertyById: (id: string) => {
        const { properties } = get();
        return properties.find(property => property.id === id);
      },
      
      // Image search methods
      searchPropertiesByImage: async (imageUri: string) => {
        set({ isImageSearching: true });
        try {
          const results = await imageRecognitionService.findSimilarProperties(imageUri, get().properties);
          set({ imageSearchResults: results });
          return results;
        } catch (error) {
          console.error('Error searching properties by image:', error);
          set({ imageSearchResults: [] });
          return [];
        } finally {
          set({ isImageSearching: false });
        }
      },
      
      clearImageSearchResults: () => {
        set({ imageSearchResults: null });
      },
      
      extractFeaturesFromImage: async (imageUri: string) => {
        try {
          return await imageRecognitionService.analyzePropertyImage(imageUri);
        } catch (error) {
          console.error('Error extracting features from image:', error);
          return {
            detectedFeatures: [],
            confidence: 0
          };
        }
      }
    }),
    {
      name: 'properties-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        savedSearches: state.savedSearches
      }),
    }
  )
);

export default usePropertiesStore;