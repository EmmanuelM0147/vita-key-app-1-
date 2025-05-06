import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Heart, MapPin, Bed, Bath, Square, Star } from 'lucide-react-native';
import Typography from './Typography';
import Card from './Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showMatchScore?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.75;

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  isFavorite = false,
  onFavoritePress,
  showMatchScore = false,
  matchScore,
  matchReasons,
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
          
          {onFavoritePress && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                onFavoritePress();
              }}
            >
              <Heart
                size={20}
                color={isFavorite ? Colors.status.error : Colors.common.white}
                fill={isFavorite ? Colors.status.error : 'none'}
              />
            </TouchableOpacity>
          )}
          
          {showMatchScore && matchScore !== undefined && (
            <View style={styles.matchScoreBadge}>
              <Typography variant="caption" color={Colors.common.white}>
                {Math.round(matchScore * 100)}% Match
              </Typography>
            </View>
          )}
          
          <View style={styles.statusBadge}>
            <Typography variant="caption" color={Colors.common.white}>
              {property.status === 'for_sale' ? 'For Sale' : 
               property.status === 'for_rent' ? 'For Rent' : 
               property.status === 'pending' ? 'Pending' : 'Sold'}
            </Typography>
          </View>
        </View>
        
        <View style={styles.content}>
          <Typography variant="h5" numberOfLines={1} style={styles.title}>
            {property.title}
          </Typography>
          
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.text.muted} />
            <Typography
              variant="caption"
              color={Colors.text.muted}
              numberOfLines={1}
              style={styles.location}
            >
              {locationString}
            </Typography>
          </View>
          
          <Typography variant="h5" color={Colors.primary.main} style={styles.price}>
            ${property.price.toLocaleString()}
          </Typography>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Bed size={14} color={Colors.text.muted} />
              <Typography variant="caption" color={Colors.text.muted}>
                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </Typography>
            </View>
            
            <View style={styles.feature}>
              <Bath size={14} color={Colors.text.muted} />
              <Typography variant="caption" color={Colors.text.muted}>
                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </Typography>
            </View>
            
            {(property.area || property.size) && (
              <View style={styles.feature}>
                <Square size={14} color={Colors.text.muted} />
                <Typography variant="caption" color={Colors.text.muted}>
                  {property.area || property.size} sqft
                </Typography>
              </View>
            )}
          </View>
          
          {showMatchScore && matchReasons && matchReasons.length > 0 && (
            <View style={styles.reasonsContainer}>
              {matchReasons.slice(0, 2).map((reason, index) => (
                <View key={index} style={styles.reasonItem}>
                  <Star size={12} color={Colors.primary.main} />
                  <Typography
                    variant="caption"
                    color={Colors.text.dark}
                    style={styles.reasonText}
                    numberOfLines={1}
                  >
                    {reason}
                  </Typography>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
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
    padding: 8,
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    flex: 1,
  },
  price: {
    marginBottom: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  reasonsContainer: {
    marginTop: 4,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    marginLeft: 4,
    flex: 1,
  },
});

export default PropertyCard;