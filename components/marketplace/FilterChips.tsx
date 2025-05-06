import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface ActiveFilters {
  propertyType: string | null;
  priceRange: [number, number] | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

interface FilterChipsProps {
  activeFilters: ActiveFilters;
  onClearFilter: (filterType: keyof ActiveFilters) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilters,
  onClearFilter,
}) => {
  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(value => value !== null);
  
  if (!hasActiveFilters) {
    return null;
  }

  const formatPrice = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {activeFilters.propertyType && (
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onClearFilter('propertyType')}
        >
          <Typography variant="caption" color={Colors.common.white}>
            Type: {activeFilters.propertyType}
          </Typography>
          <X size={14} color={Colors.common.white} style={styles.chipIcon} />
        </TouchableOpacity>
      )}
      
      {activeFilters.priceRange && (
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onClearFilter('priceRange')}
        >
          <Typography variant="caption" color={Colors.common.white}>
            Price: {formatPrice(activeFilters.priceRange[0])} - {formatPrice(activeFilters.priceRange[1])}
          </Typography>
          <X size={14} color={Colors.common.white} style={styles.chipIcon} />
        </TouchableOpacity>
      )}
      
      {activeFilters.bedrooms && (
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onClearFilter('bedrooms')}
        >
          <Typography variant="caption" color={Colors.common.white}>
            {activeFilters.bedrooms}+ Beds
          </Typography>
          <X size={14} color={Colors.common.white} style={styles.chipIcon} />
        </TouchableOpacity>
      )}
      
      {activeFilters.bathrooms && (
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onClearFilter('bathrooms')}
        >
          <Typography variant="caption" color={Colors.common.white}>
            {activeFilters.bathrooms}+ Baths
          </Typography>
          <X size={14} color={Colors.common.white} style={styles.chipIcon} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.gold,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  chipIcon: {
    marginLeft: 4,
  },
});

export default FilterChips;