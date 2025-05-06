import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin, Bed, Bath } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import { PropertyData } from '@/components/ui/PropertyCard';

interface PropertyMapCardProps {
  property: PropertyData;
  onPress: () => void;
  onFavoritePress: () => void;
}

export const PropertyMapCard: React.FC<PropertyMapCardProps> = ({
  property,
  onPress,
  onFavoritePress,
}) => {
  const {
    title,
    address,
    price,
    bedrooms,
    bathrooms,
    imageUrl,
    isFavorite,
  } = property;

  const formatPrice = (value: number) => {
    return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.container}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="body1" weight="600" numberOfLines={1} style={styles.title}>
              {title}
            </Typography>
            
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={onFavoritePress}
            >
              <Heart
                size={20}
                color={isFavorite ? Colors.accent.coral : Colors.text.dark}
                fill={isFavorite ? Colors.accent.coral : 'none'}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.text.muted} style={styles.locationIcon} />
            <Typography variant="caption" color={Colors.text.muted} numberOfLines={1}>
              {address}
            </Typography>
          </View>
          
          <View style={styles.footer}>
            <Typography variant="body1" color={Colors.primary.gold} weight="600">
              {formatPrice(price)}
            </Typography>
            
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Bed size={14} color={Colors.text.muted} />
                <Typography variant="caption" style={styles.featureText}>
                  {bedrooms}
                </Typography>
              </View>
              
              <View style={styles.featureItem}>
                <Bath size={14} color={Colors.text.muted} />
                <Typography variant="caption" style={styles.featureText}>
                  {bathrooms}
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  favoriteButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationIcon: {
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  features: {
    flexDirection: 'row',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  featureText: {
    marginLeft: 4,
  },
});

export default PropertyMapCard;