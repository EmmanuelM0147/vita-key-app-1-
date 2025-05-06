import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

// Mock location data - in a real app, this would come from an API
const mockLocations = [
  { id: '1', name: 'New York, NY' },
  { id: '2', name: 'Los Angeles, CA' },
  { id: '3', name: 'Chicago, IL' },
  { id: '4', name: 'Houston, TX' },
  { id: '5', name: 'Phoenix, AZ' },
  { id: '6', name: 'Philadelphia, PA' },
  { id: '7', name: 'San Antonio, TX' },
  { id: '8', name: 'San Diego, CA' },
  { id: '9', name: 'Dallas, TX' },
  { id: '10', name: 'San Francisco, CA' },
  { id: '11', name: 'Austin, TX' },
  { id: '12', name: 'Seattle, WA' },
  { id: '13', name: 'Denver, CO' },
  { id: '14', name: 'Boston, MA' },
  { id: '15', name: 'Miami, FL' },
];

interface LocationSearchProps {
  selectedLocation: string | null;
  onLocationSelect: (location: string | null) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedLocation,
  onLocationSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockLocations>([]);
  const [showResults, setShowResults] = useState(false);

  // Update search query when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      setSearchQuery(selectedLocation);
    } else {
      setSearchQuery('');
    }
  }, [selectedLocation]);

  // Search for locations based on query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      const filteredLocations = mockLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredLocations);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLocationPress = (location: string) => {
    onLocationSelect(location);
    setShowResults(false);
  };

  const handleClearLocation = () => {
    setSearchQuery('');
    onLocationSelect(null);
  };

  const renderLocationItem = ({ item }: { item: typeof mockLocations[0] }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationPress(item.name)}
    >
      <MapPin size={16} color={Colors.text.muted} style={styles.locationIcon} />
      <Typography variant="body2">{item.name}</Typography>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MapPin size={20} color={Colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for a location"
          placeholderTextColor={Colors.text.muted}
          onFocus={() => setShowResults(true)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearLocation}
          >
            <X size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && searchQuery.length > 0 && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary.gold} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Typography variant="body2" color={Colors.text.muted}>
                    No locations found
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary.sage,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.dark,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.secondary.sage,
    zIndex: 10,
    maxHeight: 200,
  },
  resultsList: {
    padding: Spacing.xs,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary.sage,
  },
  locationIcon: {
    marginRight: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
});

export default LocationSearch;