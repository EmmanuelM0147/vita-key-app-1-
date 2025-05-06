import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, ChevronRight } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Property } from '@/types/property';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import usePropertiesStore from '@/store/properties-store';

interface PersonalizedSectionProps {
  title: string;
  subtitle?: string;
  properties: Property[];
  isLoading?: boolean;
  onViewProperty: (property: Property) => void;
  onSeeAllPress?: () => void;
}

export const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({
  title,
  subtitle,
  properties,
  isLoading = false,
  onViewProperty,
  onSeeAllPress,
}) => {
  const router = useRouter();
  const { favorites, toggleFavorite } = usePropertiesStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Typography variant="h5" style={styles.title}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color={Colors.text.muted} style={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </View>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.skeletonCard} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Brain size={18} color={Colors.primary.main} />
          <View>
            <Typography variant="h5" style={styles.title}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color={Colors.text.muted} style={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </View>
        </View>
        
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Typography variant="body2" color={Colors.primary.main}>
              See All
            </Typography>
            <ChevronRight size={16} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {properties.map((property) => (
          <View key={property.id} style={styles.cardContainer}>
            <PropertyCard
              property={property}
              onPress={() => onViewProperty(property)}
              isFavorite={favorites.includes(property.id)}
              onFavoritePress={() => toggleFavorite(property.id)}
              showMatchScore={property.matchScore !== undefined}
              matchScore={property.matchScore}
              matchReasons={property.matchReasons}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  cardContainer: {
    width: 280,
    marginRight: Spacing.md,
  },
  skeletonCard: {
    width: 280,
    height: 220,
    backgroundColor: Colors.gray[200],
    borderRadius: 12,
    marginRight: Spacing.md,
  },
});

export default PersonalizedSection;