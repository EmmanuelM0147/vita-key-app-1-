import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import RangeSlider from '@/components/marketplace/RangeSlider';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

// Property types
const propertyTypes = [
  { id: 'house', name: 'House' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'condo', name: 'Condo' },
  { id: 'townhouse', name: 'Townhouse' },
  { id: 'land', name: 'Land' },
  { id: 'commercial', name: 'Commercial' },
];

// Bedroom options
const bedroomOptions = [
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

// Bathroom options
const bathroomOptions = [
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

// Amenities
const amenities = [
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'gym', name: 'Gym' },
  { id: 'parking', name: 'Parking' },
  { id: 'ac', name: 'Air Conditioning' },
  { id: 'heating', name: 'Heating' },
  { id: 'washer', name: 'Washer/Dryer' },
  { id: 'balcony', name: 'Balcony' },
  { id: 'security', name: 'Security System' },
  { id: 'elevator', name: 'Elevator' },
  { id: 'furnished', name: 'Furnished' },
];

export default function FiltersScreen() {
  const router = useRouter();
  
  // Filter states
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([100000, 2000000]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handlePropertyTypeSelect = (typeId: string) => {
    setSelectedPropertyType(selectedPropertyType === typeId ? null : typeId);
  };

  const handleBedroomSelect = (value: number) => {
    setSelectedBedrooms(selectedBedrooms === value ? null : value);
  };

  const handleBathroomSelect = (value: number) => {
    setSelectedBathrooms(selectedBathrooms === value ? null : value);
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleApplyFilters = () => {
    // In a real app, you would pass these filters to a global state or context
    console.log('Applied filters:', {
      propertyType: selectedPropertyType,
      priceRange,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,
      amenities: selectedAmenities,
    });
    
    router.back();
  };

  const handleResetFilters = () => {
    setSelectedPropertyType(null);
    setPriceRange([100000, 2000000]);
    setSelectedBedrooms(null);
    setSelectedBathrooms(null);
    setSelectedAmenities([]);
  };

  return (
    <SafeAreaWrapper>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Filters',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleResetFilters}>
              <Typography variant="body2" color={Colors.primary.main}>
                Reset
              </Typography>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Card variant="outlined" style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Property Type
            </Typography>
            <View style={styles.optionsContainer}>
              {propertyTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionButton,
                    selectedPropertyType === type.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => handlePropertyTypeSelect(type.id)}
                >
                  <Typography
                    variant="body2"
                    color={selectedPropertyType === type.id ? Colors.common.white : Colors.text.dark}
                  >
                    {type.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Price Range
            </Typography>
            <RangeSlider
              min={100000}
              max={2000000}
              step={50000}
              values={priceRange}
              onValuesChange={setPriceRange}
            />
            <View style={styles.priceLabels}>
              <Typography variant="body2" color={Colors.text.muted}>
                ${priceRange[0].toLocaleString()}
              </Typography>
              <Typography variant="body2" color={Colors.text.muted}>
                ${priceRange[1].toLocaleString()}
              </Typography>
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Bedrooms
            </Typography>
            <View style={styles.optionsContainer}>
              {bedroomOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedBedrooms === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleBedroomSelect(option.value)}
                >
                  <Typography
                    variant="body2"
                    color={selectedBedrooms === option.value ? Colors.common.white : Colors.text.dark}
                  >
                    {option.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Bathrooms
            </Typography>
            <View style={styles.optionsContainer}>
              {bathroomOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedBathrooms === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleBathroomSelect(option.value)}
                >
                  <Typography
                    variant="body2"
                    color={selectedBathrooms === option.value ? Colors.common.white : Colors.text.dark}
                  >
                    {option.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Amenities
            </Typography>
            <View style={styles.amenitiesContainer}>
              {amenities.map(amenity => (
                <TouchableOpacity
                  key={amenity.id}
                  style={styles.amenityItem}
                  onPress={() => handleAmenityToggle(amenity.id)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedAmenities.includes(amenity.id) && styles.checkboxSelected,
                  ]}>
                    {selectedAmenities.includes(amenity.id) && (
                      <Check size={14} color={Colors.common.white} />
                    )}
                  </View>
                  <Typography variant="body2" style={styles.amenityName}>
                    {amenity.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Apply Filters"
          onPress={handleApplyFilters}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  amenityName: {
    flex: 1,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.common.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});