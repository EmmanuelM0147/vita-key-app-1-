import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, List, Filter } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import PropertyMapCard from '@/components/marketplace/PropertyMapCard';
import FilterModal, { FilterOptions } from '@/components/marketplace/FilterModal';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import usePropertiesStore from '@/store/properties-store';

// Mock map component for web compatibility
const MapPlaceholder = ({ 
  properties, 
  onMarkerPress 
}: { 
  properties: any[],
  onMarkerPress: (id: string) => void 
}) => {
  return (
    <View style={styles.mapPlaceholder}>
      <Typography variant="body1" align="center" style={styles.mapPlaceholderText}>
        Map View
      </Typography>
      <Typography variant="body2" color={Colors.text.muted} align="center" style={styles.mapPlaceholderSubtext}>
        {Platform.OS === 'web' ? 
          'Maps are not fully supported in web preview.' : 
          'Map would display here in the full app.'}
      </Typography>
      
      <View style={styles.mockMarkers}>
        {properties.slice(0, 5).map((property, index) => (
          <TouchableOpacity
            key={property.id}
            style={[
              styles.mockMarker,
              { top: 100 + (index * 50), left: 50 + (index * 60) }
            ]}
            onPress={() => onMarkerPress(property.id)}
          >
            <Typography variant="caption" color={Colors.common.white}>
              ${Math.floor(property.price / 1000)}k
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function MapScreen() {
  const router = useRouter();
  const { 
    filteredProperties, 
    filterOptions: filters,
    toggleFavorite, 
    isFavorite,
    applyFilters,
    isLoading
  } = usePropertiesStore();
  
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleMarkerPress = (propertyId: string) => {
    const property = filteredProperties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty({
        ...property,
        isFavorite: isFavorite(property.id),
      });
    }
  };

  const handlePropertyPress = (property: any) => {
    router.push({
      pathname: '/marketplace/[id]',
      params: { id: property.id }
    });
  };

  const handleFavoritePress = (property: any) => {
    toggleFavorite(property.id);
    if (selectedProperty && selectedProperty.id === property.id) {
      setSelectedProperty({
        ...selectedProperty,
        isFavorite: !selectedProperty.isFavorite,
      });
    }
  };

  const handleListViewPress = () => {
    router.push('/marketplace');
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    applyFilters(newFilters);
    setShowFilterModal(false);
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Stack.Screen 
          options={{
            headerShown: true,
            headerTitle: 'Map View',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.text.dark} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.gold} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Map View',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleFilterPress}
              >
                <Filter size={22} color={Colors.text.dark} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleListViewPress}
              >
                <List size={22} color={Colors.text.dark} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={styles.container}>
        <MapPlaceholder 
          properties={filteredProperties} 
          onMarkerPress={handleMarkerPress} 
        />
        
        {selectedProperty && (
          <View style={styles.propertyCardContainer}>
            <PropertyMapCard
              property={selectedProperty}
              onPress={() => handlePropertyPress(selectedProperty)}
              onFavoritePress={() => handleFavoritePress(selectedProperty)}
            />
          </View>
        )}
        
        {filters && (
          <FilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            onApply={handleApplyFilters}
            initialFilters={filters}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: Spacing.md,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8EEF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginBottom: Spacing.xs,
  },
  mapPlaceholderSubtext: {
    maxWidth: '80%',
    textAlign: 'center',
  },
  mockMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mockMarker: {
    position: 'absolute',
    backgroundColor: Colors.primary.gold,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  propertyCardContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});