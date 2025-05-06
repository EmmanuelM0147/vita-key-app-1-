import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ArrowLeft } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import PropertyCard from '@/components/ui/PropertyCard';
import usePropertiesStore from '@/store/properties-store';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { properties, favorites, toggleFavorite } = usePropertiesStore();
  
  // Get saved properties
  const savedProperties = properties.filter(property => 
    favorites.includes(property.id)
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={60} color={Colors.secondary.main} />
      <Typography variant="h4" style={styles.emptyTitle}>
        No Favorites Yet
      </Typography>
      <Typography variant="body1" color={Colors.text.muted} align="center" style={styles.emptyText}>
        Start saving properties you like by tapping the heart icon on any property.
      </Typography>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => router.push('/marketplace')}
      >
        <Typography variant="body1" color={Colors.primary[500]} weight="600">
          Browse Properties
        </Typography>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Colors.text.dark} />
          </TouchableOpacity>
          <Typography variant="h3">Favorites</Typography>
          <View style={styles.placeholder} />
        </View>
        
        {savedProperties.length > 0 ? (
          <FlatList
            data={savedProperties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <PropertyCard
                  property={item}
                  onPress={() => router.push(`/marketplace/${item.id}`)}
                  isFavorite={true}
                  onFavoritePress={() => toggleFavorite(item.id)}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.common.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light, // Fixed: Changed from Colors.gray[200] to Colors.border.light
  },
  backButton: {
    padding: Spacing.xs,
  },
  placeholder: {
    width: 24,
  },
  listContent: {
    padding: Spacing.lg,
  },
  cardContainer: {
    marginBottom: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginBottom: Spacing.xl,
  },
  browseButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 30,
  },
});