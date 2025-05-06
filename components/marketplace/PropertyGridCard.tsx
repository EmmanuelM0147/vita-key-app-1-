import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Heart, MapPin, Bed, Bath } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Property } from '@/types/property';

interface PropertyGridCardProps {
  property: Property;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  similarityScore?: number;
  style?: any;
}

export const PropertyGridCard: React.FC<PropertyGridCardProps> = ({
  property,
  onPress,
  onToggleFavorite,
  isFavorite,
  similarityScore,
  style,
}) => {
  // Format location string
  const locationString = typeof property.location === 'string'
    ? property.location
    : property.location?.city && property.location?.state
      ? `${property.location.city}, ${property.location.state}`
      : property.location?.address || 'Location not specified';

  return (
    <Card
      variant="elevated"
      style={[styles.card, style]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
            style={styles.image}
            resizeMode="cover"
          />
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart
              size={18}
              color={isFavorite ? Colors.status.error : Colors.common.white}
              fill={isFavorite ? Colors.status.error : 'none'}
            />
          </TouchableOpacity>
          
          <View style={styles.statusBadge}>
            <Typography variant="caption" color={Colors.common.white}>
              {property.status === 'for_sale' ? 'For Sale' : 
               property.status === 'for_rent' ? 'For Rent' : 
               property.status === 'pending' ? 'Pending' : 'Sold'}
            </Typography>
          </View>
          
          {similarityScore !== undefined && (
            <View style={styles.matchScoreBadge}>
              <Typography variant="caption" color={Colors.common.white}>
                {Math.round(similarityScore * 100)}% Match
              </Typography>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Typography variant="h5" numberOfLines={1} style={styles.title}>
            {property.title}
          </Typography>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color={Colors.text.muted} />
            <Typography
              variant="caption"
              color={Colors.text.muted}
              numberOfLines={1}
              style={styles.location}
            >
              {locationString}
            </Typography>
          </View>
          
          <Typography variant="body1" color={Colors.primary.main} style={styles.price}>
            ${property.price.toLocaleString()}
          </Typography>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Bed size={12} color={Colors.text.muted} />
              <Typography variant="caption" color={Colors.text.muted}>
                {property.bedrooms}
              </Typography>
            </View>
            
            <View style={styles.feature}>
              <Bath size={12} color={Colors.text.muted} />
              <Typography variant="caption" color={Colors.text.muted}>
                {property.bathrooms}
              </Typography>
            </View>
            
            <View style={styles.typeTag}>
              <Typography variant="caption" color={Colors.text.muted}>
                {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </Typography>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.full,
    padding: 6,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  content: {
    padding: Spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    marginLeft: 4,
    flex: 1,
  },
  price: {
    marginBottom: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: Colors.background.light,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
  },
});

export default PropertyGridCard;