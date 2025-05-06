import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';
import { FilterOptions } from './FilterModal';

interface ActiveFiltersProps {
  filters: FilterOptions;
  onClearFilter: (filterKey: keyof FilterOptions) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onClearFilter,
  onClearAll,
}) => {
  // Check if any filters are active
  const hasActiveFilters = 
    filters.propertyType !== 'all' ||
    filters.bedrooms !== 'any' ||
    filters.bathrooms !== 'any' ||
    filters.location !== null ||
    filters.amenities.length > 0 ||
    filters.priceRange[0] !== 100000 ||
    filters.priceRange[1] !== 2000000 ||
    filters.sortBy !== 'newest';
  
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.propertyType !== 'all' && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('propertyType')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1)}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        {(filters.priceRange[0] !== 100000 || filters.priceRange[1] !== 2000000) && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('priceRange')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        {filters.bedrooms !== 'any' && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('bedrooms')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {filters.bedrooms} {filters.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        {filters.bathrooms !== 'any' && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('bathrooms')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {filters.bathrooms} {filters.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        {filters.location && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('location')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {filters.location}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        {filters.amenities.map((amenity) => (
          <TouchableOpacity
            key={amenity}
            style={styles.filterChip}
            onPress={() => {
              const updatedAmenities = filters.amenities.filter(a => a !== amenity);
              onClearFilter('amenities');
            }}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {amenity}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        ))}
        
        {filters.sortBy !== 'newest' && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => onClearFilter('sortBy')}
          >
            <Typography variant="caption" color={Colors.primary.main}>
              {filters.sortBy === 'priceAsc' ? 'Price: Low to High' :
               filters.sortBy === 'priceDesc' ? 'Price: High to Low' :
               filters.sortBy === 'oldest' ? 'Oldest First' : filters.sortBy}
            </Typography>
            <X size={14} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={onClearAll}
        >
          <Typography variant="caption" color={Colors.status.error}>
            Clear All
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[300],
    gap: 4,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
});

export default ActiveFilters;