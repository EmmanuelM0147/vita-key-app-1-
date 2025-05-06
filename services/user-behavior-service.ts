import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '@/types/property';
import { User } from '@/types/user';
import { FilterOptions } from '@/components/marketplace/FilterModal';

// Keys for storing behavior data
const SEARCH_HISTORY_KEY = 'user_search_history';
const VIEWED_PROPERTIES_KEY = 'user_viewed_properties';
const SEARCH_FILTERS_KEY = 'user_search_filters';
const AMENITY_PREFERENCES_KEY = 'user_amenity_preferences';
const LOCATION_PREFERENCES_KEY = 'user_location_preferences';
const PRICE_RANGE_PREFERENCES_KEY = 'user_price_range_preferences';
const PROPERTY_TYPE_PREFERENCES_KEY = 'user_property_type_preferences';

// Types for behavior tracking
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export interface ViewedProperty {
  propertyId: string;
  timestamp: number;
  duration?: number; // Time spent viewing in seconds
}

export interface AmenityPreference {
  amenity: string;
  count: number;
}

export interface LocationPreference {
  location: string;
  count: number;
}

export interface PriceRangePreference {
  min: number;
  max: number;
  count: number;
}

export interface PropertyTypePreference {
  type: string;
  count: number;
}

// Maximum items to store in history
const MAX_SEARCH_HISTORY = 50;
const MAX_VIEWED_PROPERTIES = 100;

/**
 * Service for tracking and analyzing user behavior
 */
export const userBehaviorService = {
  /**
   * Track a search query
   */
  trackSearch: async (userId: string, query: string): Promise<void> => {
    try {
      const history = await userBehaviorService.getSearchHistory(userId);
      
      // Add new search to history
      const updatedHistory = [
        { query, timestamp: Date.now() },
        ...history.filter(item => item.query !== query) // Remove duplicates
      ].slice(0, MAX_SEARCH_HISTORY);
      
      await AsyncStorage.setItem(
        `${SEARCH_HISTORY_KEY}_${userId}`,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  },
  
  /**
   * Get user's search history
   */
  getSearchHistory: async (userId: string): Promise<SearchHistoryItem[]> => {
    try {
      const data = await AsyncStorage.getItem(`${SEARCH_HISTORY_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  },
  
  /**
   * Track a property view
   */
  trackPropertyView: async (
    userId: string,
    propertyId: string,
    duration?: number
  ): Promise<void> => {
    try {
      const viewedProperties = await userBehaviorService.getViewedProperties(userId);
      
      // Check if property was already viewed
      const existingIndex = viewedProperties.findIndex(p => p.propertyId === propertyId);
      
      if (existingIndex >= 0) {
        // Update existing entry
        viewedProperties[existingIndex] = {
          propertyId,
          timestamp: Date.now(),
          duration
        };
      } else {
        // Add new entry
        viewedProperties.unshift({
          propertyId,
          timestamp: Date.now(),
          duration
        });
      }
      
      // Limit the number of entries
      const updatedProperties = viewedProperties.slice(0, MAX_VIEWED_PROPERTIES);
      
      await AsyncStorage.setItem(
        `${VIEWED_PROPERTIES_KEY}_${userId}`,
        JSON.stringify(updatedProperties)
      );
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  },
  
  /**
   * Get user's viewed properties
   */
  getViewedProperties: async (userId: string): Promise<ViewedProperty[]> => {
    try {
      const data = await AsyncStorage.getItem(`${VIEWED_PROPERTIES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting viewed properties:', error);
      return [];
    }
  },
  
  /**
   * Track search filters used
   */
  trackSearchFilters: async (userId: string, filters: FilterOptions): Promise<void> => {
    try {
      const savedFilters = await userBehaviorService.getSearchFilters(userId);
      
      // Add new filters to history (limit to 10 recent filter sets)
      const updatedFilters = [
        { filters, timestamp: Date.now() },
        ...savedFilters
      ].slice(0, 10);
      
      await AsyncStorage.setItem(
        `${SEARCH_FILTERS_KEY}_${userId}`,
        JSON.stringify(updatedFilters)
      );
      
      // Also track individual preferences
      if (filters.amenities && filters.amenities.length > 0) {
        await userBehaviorService.trackAmenityPreferences(userId, filters.amenities);
      }
      
      if (filters.location) {
        await userBehaviorService.trackLocationPreference(userId, filters.location);
      }
      
      if (filters.propertyType && filters.propertyType !== 'all') {
        await userBehaviorService.trackPropertyTypePreference(userId, filters.propertyType);
      }
      
      await userBehaviorService.trackPriceRangePreference(
        userId, 
        filters.priceRange[0], 
        filters.priceRange[1]
      );
      
    } catch (error) {
      console.error('Error tracking search filters:', error);
    }
  },
  
  /**
   * Get user's search filters
   */
  getSearchFilters: async (userId: string): Promise<{filters: FilterOptions, timestamp: number}[]> => {
    try {
      const data = await AsyncStorage.getItem(`${SEARCH_FILTERS_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting search filters:', error);
      return [];
    }
  },
  
  /**
   * Track amenity preferences
   */
  trackAmenityPreferences: async (userId: string, amenities: string[]): Promise<void> => {
    try {
      const preferences = await userBehaviorService.getAmenityPreferences(userId);
      
      // Update counts for each amenity
      const updatedPreferences = [...preferences];
      
      for (const amenity of amenities) {
        const existingIndex = updatedPreferences.findIndex(p => p.amenity === amenity);
        
        if (existingIndex >= 0) {
          updatedPreferences[existingIndex].count += 1;
        } else {
          updatedPreferences.push({ amenity, count: 1 });
        }
      }
      
      // Sort by count (descending)
      updatedPreferences.sort((a, b) => b.count - a.count);
      
      await AsyncStorage.setItem(
        `${AMENITY_PREFERENCES_KEY}_${userId}`,
        JSON.stringify(updatedPreferences)
      );
    } catch (error) {
      console.error('Error tracking amenity preferences:', error);
    }
  },
  
  /**
   * Get user's amenity preferences
   */
  getAmenityPreferences: async (userId: string): Promise<AmenityPreference[]> => {
    try {
      const data = await AsyncStorage.getItem(`${AMENITY_PREFERENCES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting amenity preferences:', error);
      return [];
    }
  },
  
  /**
   * Track location preference
   */
  trackLocationPreference: async (userId: string, location: string): Promise<void> => {
    try {
      const preferences = await userBehaviorService.getLocationPreferences(userId);
      
      // Update count for this location
      const existingIndex = preferences.findIndex(p => p.location === location);
      
      if (existingIndex >= 0) {
        preferences[existingIndex].count += 1;
      } else {
        preferences.push({ location, count: 1 });
      }
      
      // Sort by count (descending)
      preferences.sort((a, b) => b.count - a.count);
      
      await AsyncStorage.setItem(
        `${LOCATION_PREFERENCES_KEY}_${userId}`,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error tracking location preference:', error);
    }
  },
  
  /**
   * Get user's location preferences
   */
  getLocationPreferences: async (userId: string): Promise<LocationPreference[]> => {
    try {
      const data = await AsyncStorage.getItem(`${LOCATION_PREFERENCES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting location preferences:', error);
      return [];
    }
  },
  
  /**
   * Track price range preference
   */
  trackPriceRangePreference: async (userId: string, min: number, max: number): Promise<void> => {
    try {
      const preferences = await userBehaviorService.getPriceRangePreferences(userId);
      
      // Find similar price ranges (within 20% difference)
      const similarIndex = preferences.findIndex(p => {
        const minDiff = Math.abs(p.min - min) / Math.max(p.min, min);
        const maxDiff = Math.abs(p.max - max) / Math.max(p.max, max);
        return minDiff < 0.2 && maxDiff < 0.2;
      });
      
      if (similarIndex >= 0) {
        preferences[similarIndex].count += 1;
        // Gradually adjust the price range to the most recent search
        preferences[similarIndex].min = Math.round((preferences[similarIndex].min * 0.8) + (min * 0.2));
        preferences[similarIndex].max = Math.round((preferences[similarIndex].max * 0.8) + (max * 0.2));
      } else {
        preferences.push({ min, max, count: 1 });
      }
      
      // Sort by count (descending)
      preferences.sort((a, b) => b.count - a.count);
      
      await AsyncStorage.setItem(
        `${PRICE_RANGE_PREFERENCES_KEY}_${userId}`,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error tracking price range preference:', error);
    }
  },
  
  /**
   * Get user's price range preferences
   */
  getPriceRangePreferences: async (userId: string): Promise<PriceRangePreference[]> => {
    try {
      const data = await AsyncStorage.getItem(`${PRICE_RANGE_PREFERENCES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting price range preferences:', error);
      return [];
    }
  },
  
  /**
   * Track property type preference
   */
  trackPropertyTypePreference: async (userId: string, type: string): Promise<void> => {
    try {
      const preferences = await userBehaviorService.getPropertyTypePreferences(userId);
      
      // Update count for this property type
      const existingIndex = preferences.findIndex(p => p.type === type);
      
      if (existingIndex >= 0) {
        preferences[existingIndex].count += 1;
      } else {
        preferences.push({ type, count: 1 });
      }
      
      // Sort by count (descending)
      preferences.sort((a, b) => b.count - a.count);
      
      await AsyncStorage.setItem(
        `${PROPERTY_TYPE_PREFERENCES_KEY}_${userId}`,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error tracking property type preference:', error);
    }
  },
  
  /**
   * Get user's property type preferences
   */
  getPropertyTypePreferences: async (userId: string): Promise<PropertyTypePreference[]> => {
    try {
      const data = await AsyncStorage.getItem(`${PROPERTY_TYPE_PREFERENCES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting property type preferences:', error);
      return [];
    }
  },
  
  /**
   * Get user's most likely preferences based on behavior
   */
  getInferredPreferences: async (userId: string): Promise<{
    locations: string[];
    propertyTypes: string[];
    priceRange: [number, number];
    amenities: string[];
  }> => {
    try {
      // Get all preference data
      const locationPrefs = await userBehaviorService.getLocationPreferences(userId);
      const propertyTypePrefs = await userBehaviorService.getPropertyTypePreferences(userId);
      const priceRangePrefs = await userBehaviorService.getPriceRangePreferences(userId);
      const amenityPrefs = await userBehaviorService.getAmenityPreferences(userId);
      
      // Extract top preferences
      const topLocations = locationPrefs
        .filter(p => p.count > 1)
        .slice(0, 3)
        .map(p => p.location);
        
      const topPropertyTypes = propertyTypePrefs
        .filter(p => p.count > 1)
        .slice(0, 3)
        .map(p => p.type);
        
      // Use the most common price range, or a default if none exists
      const priceRange: [number, number] = priceRangePrefs.length > 0
        ? [priceRangePrefs[0].min, priceRangePrefs[0].max]
        : [100000, 1000000];
        
      const topAmenities = amenityPrefs
        .filter(p => p.count > 1)
        .slice(0, 5)
        .map(p => p.amenity);
      
      return {
        locations: topLocations,
        propertyTypes: topPropertyTypes,
        priceRange,
        amenities: topAmenities
      };
    } catch (error) {
      console.error('Error getting inferred preferences:', error);
      return {
        locations: [],
        propertyTypes: [],
        priceRange: [100000, 1000000],
        amenities: []
      };
    }
  },
  
  /**
   * Clear all behavior data for a user
   */
  clearAllBehaviorData: async (userId: string): Promise<void> => {
    try {
      const keys = [
        `${SEARCH_HISTORY_KEY}_${userId}`,
        `${VIEWED_PROPERTIES_KEY}_${userId}`,
        `${SEARCH_FILTERS_KEY}_${userId}`,
        `${AMENITY_PREFERENCES_KEY}_${userId}`,
        `${LOCATION_PREFERENCES_KEY}_${userId}`,
        `${PRICE_RANGE_PREFERENCES_KEY}_${userId}`,
        `${PROPERTY_TYPE_PREFERENCES_KEY}_${userId}`
      ];
      
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error('Error clearing behavior data:', error);
    }
  }
};

export default userBehaviorService;