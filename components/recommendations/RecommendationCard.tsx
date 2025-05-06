import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Brain, MapPin, Star, DollarSign } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Recommendation } from '@/types/recommendation';
import { useRouter } from 'expo-router';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onExplainPress?: () => void;
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.75;
const compactCardWidth = width * 0.9;

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onExplainPress,
  compact = false,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/marketplace/${recommendation.property.id}`);
  };

  if (compact) {
    return (
      <Card
        variant="elevated"
        style={styles.compactCard}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <View style={styles.compactContent}>
            <Image
              source={{ uri: recommendation.property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
              style={styles.compactImage}
              resizeMode="cover"
            />
            
            <View style={styles.compactDetails}>
              <View style={styles.compactHeader}>
                <Typography variant="body1" numberOfLines={1} style={styles.compactTitle}>
                  {recommendation.property.title}
                </Typography>
                <View style={styles.matchBadgeSmall}>
                  <Typography variant="caption" color={Colors.common.white}>
                    {Math.round(recommendation.matchScore * 100)}%
                  </Typography>
                </View>
              </View>
              
              <View style={styles.locationContainer}>
                <MapPin size={12} color={Colors.text.muted} />
                <Typography
                  variant="caption"
                  color={Colors.text.muted}
                  numberOfLines={1}
                  style={styles.location}
                >
                  {recommendation.property.location?.city}, {recommendation.property.location?.state}
                </Typography>
              </View>
              
              <Typography variant="h6" color={Colors.primary.main}>
                ${recommendation.property.price.toLocaleString()}
              </Typography>
              
              <View style={styles.compactTagsContainer}>
                {recommendation.property.type && (
                  <View style={styles.tag}>
                    <Typography variant="caption" color={Colors.text.muted}>
                      {recommendation.property.type}
                    </Typography>
                  </View>
                )}
                {recommendation.property.bedrooms && (
                  <View style={styles.tag}>
                    <Typography variant="caption" color={Colors.text.muted}>
                      {recommendation.property.bedrooms} Beds
                    </Typography>
                  </View>
                )}
                {recommendation.property.bathrooms && (
                  <View style={styles.tag}>
                    <Typography variant="caption" color={Colors.text.muted}>
                      {recommendation.property.bathrooms} Baths
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {onExplainPress && (
            <TouchableOpacity
              style={styles.compactExplainButton}
              onPress={(e) => {
                e.stopPropagation();
                onExplainPress();
              }}
            >
              <Brain size={12} color={Colors.primary.main} />
              <Typography
                variant="caption"
                color={Colors.primary.main}
                style={styles.explainText}
              >
                Why recommended
              </Typography>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      style={styles.card}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recommendation.property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.matchBadge}>
            <Typography variant="caption" color={Colors.common.white}>
              {Math.round(recommendation.matchScore * 100)}% Match
            </Typography>
          </View>
        </View>
        
        <View style={styles.content}>
          <Typography variant="h5" numberOfLines={1} style={styles.title}>
            {recommendation.property.title}
          </Typography>
          
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.text.muted} />
            <Typography
              variant="caption"
              color={Colors.text.muted}
              numberOfLines={1}
              style={styles.location}
            >
              {recommendation.property.location?.city}, {recommendation.property.location?.state}
            </Typography>
          </View>
          
          <View style={styles.priceContainer}>
            <DollarSign size={16} color={Colors.primary.main} />
            <Typography variant="h5" color={Colors.primary.main}>
              {recommendation.property.price.toLocaleString()}
            </Typography>
          </View>
          
          <View style={styles.tagsContainer}>
            {recommendation.property.type && (
              <View style={styles.tag}>
                <Typography variant="caption" color={Colors.text.muted}>
                  {recommendation.property.type}
                </Typography>
              </View>
            )}
            {recommendation.property.bedrooms && (
              <View style={styles.tag}>
                <Typography variant="caption" color={Colors.text.muted}>
                  {recommendation.property.bedrooms} Beds
                </Typography>
              </View>
            )}
            {recommendation.property.bathrooms && (
              <View style={styles.tag}>
                <Typography variant="caption" color={Colors.text.muted}>
                  {recommendation.property.bathrooms} Baths
                </Typography>
              </View>
            )}
          </View>
          
          <View style={styles.reasonsContainer}>
            {recommendation.reasons.slice(0, 2).map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Star size={12} color={Colors.primary.main} />
                <Typography
                  variant="caption"
                  color={Colors.text.dark}
                  style={styles.reasonText}
                >
                  {reason}
                </Typography>
              </View>
            ))}
          </View>
          
          {onExplainPress && (
            <TouchableOpacity
              style={styles.explainButton}
              onPress={onExplainPress}
            >
              <Brain size={14} color={Colors.primary.main} />
              <Typography
                variant="caption"
                color={Colors.primary.main}
                style={styles.explainText}
              >
                Why we recommend this
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginRight: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  compactCard: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  matchBadgeSmall: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 2,
    paddingHorizontal: 6,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: Colors.background.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    marginRight: 4,
    marginBottom: 4,
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    marginLeft: 4,
  },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignSelf: 'flex-start',
  },
  explainText: {
    marginLeft: 4,
  },
  // Compact styles
  compactContent: {
    flexDirection: 'row',
    height: 100,
  },
  compactImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  compactDetails: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactTitle: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  compactTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  compactExplainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignSelf: 'flex-start',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});

export default RecommendationCard;