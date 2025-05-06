import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { X, Check, Home, Building, MapPin, Bed, Bath, DollarSign, ArrowUpDown, Filter } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import RangeSlider from '@/components/marketplace/RangeSlider';
import LocationSearch from '@/components/marketplace/LocationSearch';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';

export interface FilterOptions {
  propertyType: 'all' | string;
  priceRange: [number, number];
  location: string | null;
  bedrooms: 'any' | string | number;
  bathrooms: 'any' | string | number;
  amenities: string[];
  sortBy: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  initialFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  initialFilters,
  onApply,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange);
  
  // Reset filters when modal opens with new initialFilters
  useEffect(() => {
    setFilters(initialFilters);
    setPriceRange(initialFilters.priceRange);
  }, [initialFilters, visible]);
  
  const handlePropertyTypeSelect = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyType: type
    }));
  };
  
  const handleBedroomSelect = (bedrooms: 'any' | string | number) => {
    setFilters(prev => ({
      ...prev,
      bedrooms
    }));
  };
  
  const handleBathroomSelect = (bathrooms: 'any' | string | number) => {
    setFilters(prev => ({
      ...prev,
      bathrooms
    }));
  };
  
  const handleLocationSelect = (location: string | null) => {
    setFilters(prev => ({
      ...prev,
      location
    }));
  };
  
  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => {
      const amenities = [...prev.amenities];
      
      if (amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...amenities, amenity]
        };
      }
    });
  };
  
  const handleSortBySelect = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };
  
  const handleApplyFilters = () => {
    // Update the price range in filters before applying
    const updatedFilters = { ...filters, priceRange };
    onApply(updatedFilters);
    onClose();
  };
  
  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      propertyType: 'all',
      priceRange: [100000, 2000000],
      location: null,
      bedrooms: 'any',
      bathrooms: 'any',
      amenities: [],
      sortBy: 'newest',
    };
    
    setFilters(resetFilters);
    setPriceRange(resetFilters.priceRange);
  };
  
  const propertyTypes = ['all', 'house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];
  const bedroomOptions = ['any', '1', '2', '3', '4', '5+'];
  const bathroomOptions = ['any', '1', '2', '3', '4+'];
  const amenities = [
    'Pool', 'Gym', 'Parking', 'Elevator', 'Balcony', 
    'Garden', 'Security', 'Air Conditioning', 'Furnished', 'Pet Friendly'
  ];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
  ];
  
  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Typography variant="h5">Filters</Typography>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Property Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Home size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Property Type
                </Typography>
              </View>
              
              <View style={styles.optionsContainer}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      filters.propertyType === type && styles.optionButtonActive
                    ]}
                    onPress={() => handlePropertyTypeSelect(type)}
                  >
                    <Typography
                      variant="body2"
                      color={filters.propertyType === type ? Colors.common.white : Colors.text.dark}
                    >
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Typography>
                    
                    {filters.propertyType === type && (
                      <Check size={16} color={Colors.common.white} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Price Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <DollarSign size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Price Range
                </Typography>
              </View>
              
              <View style={styles.priceRangeContainer}>
                <Typography variant="body2" style={styles.priceLabel}>
                  {formatPrice(priceRange[0])}
                </Typography>
                <Typography variant="body2" style={styles.priceLabel}>
                  {formatPrice(priceRange[1])}
                </Typography>
              </View>
              
              <RangeSlider
                min={50000}
                max={5000000}
                step={10000}
                values={priceRange}
                onValuesChange={setPriceRange}
              />
            </View>
            
            {/* Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Location
                </Typography>
              </View>
              
              <LocationSearch
                value={filters.location || ''}
                onSelect={handleLocationSelect}
                placeholder="Enter city, neighborhood, or zip code"
              />
            </View>
            
            {/* Bedrooms */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bed size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Bedrooms
                </Typography>
              </View>
              
              <View style={styles.optionsContainer}>
                {bedroomOptions.map((option) => (
                  <TouchableOpacity
                    key={`bed-${option}`}
                    style={[
                      styles.optionButton,
                      filters.bedrooms === option && styles.optionButtonActive
                    ]}
                    onPress={() => handleBedroomSelect(option)}
                  >
                    <Typography
                      variant="body2"
                      color={filters.bedrooms === option ? Colors.common.white : Colors.text.dark}
                    >
                      {option === 'any' ? 'Any' : option}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Bathrooms */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bath size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Bathrooms
                </Typography>
              </View>
              
              <View style={styles.optionsContainer}>
                {bathroomOptions.map((option) => (
                  <TouchableOpacity
                    key={`bath-${option}`}
                    style={[
                      styles.optionButton,
                      filters.bathrooms === option && styles.optionButtonActive
                    ]}
                    onPress={() => handleBathroomSelect(option)}
                  >
                    <Typography
                      variant="body2"
                      color={filters.bathrooms === option ? Colors.common.white : Colors.text.dark}
                    >
                      {option === 'any' ? 'Any' : option}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Amenities */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Amenities
                </Typography>
              </View>
              
              <View style={styles.amenitiesContainer}>
                {amenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityButton,
                      filters.amenities.includes(amenity) && styles.amenityButtonActive
                    ]}
                    onPress={() => handleAmenityToggle(amenity)}
                  >
                    {filters.amenities.includes(amenity) && (
                      <Check size={16} color={Colors.common.white} style={styles.amenityCheckIcon} />
                    )}
                    <Typography
                      variant="body2"
                      color={filters.amenities.includes(amenity) ? Colors.common.white : Colors.text.dark}
                    >
                      {amenity}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Sort By */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ArrowUpDown size={20} color={Colors.primary.main} />
                <Typography variant="h6" style={styles.sectionTitle}>
                  Sort By
                </Typography>
              </View>
              
              <View style={styles.sortOptionsContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOptionButton,
                      filters.sortBy === option.value && styles.sortOptionButtonActive
                    ]}
                    onPress={() => handleSortBySelect(option.value as FilterOptions['sortBy'])}
                  >
                    <Typography
                      variant="body2"
                      color={filters.sortBy === option.value ? Colors.common.white : Colors.text.dark}
                    >
                      {option.label}
                    </Typography>
                    
                    {filters.sortBy === option.value && (
                      <Check size={16} color={Colors.common.white} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="outline"
              onPress={handleResetFilters}
              style={styles.resetButton}
            />
            
            <Button
              title="Apply Filters"
              variant="primary"
              onPress={handleApplyFilters}
              style={styles.applyButton}
              leftIcon={<Filter size={18} color={Colors.common.white} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.common.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.xs,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkIcon: {
    marginLeft: 4,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    color: Colors.text.muted,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.xs,
  },
  amenityButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  amenityCheckIcon: {
    marginRight: 4,
  },
  sortOptionsContainer: {
    gap: Spacing.sm,
  },
  sortOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sortOptionButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  resetButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  applyButton: {
    flex: 2,
  },
});

export default FilterModal;