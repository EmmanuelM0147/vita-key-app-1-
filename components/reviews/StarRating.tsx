import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  activeColor?: string;
  disabled?: boolean;
  showValue?: boolean;
  precision?: 'half' | 'full';
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  color = Colors.text.muted,
  activeColor = Colors.primary.gold,
  disabled = false,
  showValue = false,
  precision = 'full',
  onChange
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 28;
      case 'md':
      default: return 20;
    }
  };

  const starSize = getStarSize();
  const stars = [];

  const handlePress = (selectedRating: number) => {
    if (disabled || !onChange) return;
    onChange(selectedRating);
  };

  // Render stars based on precision
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalfFilled = precision === 'half' && i === Math.ceil(rating) && !isFilled;
    
    stars.push(
      <TouchableOpacity
        key={i}
        style={styles.starContainer}
        onPress={() => handlePress(i)}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Star
          size={starSize}
          color={isFilled || isHalfFilled ? activeColor : color}
          fill={isFilled ? activeColor : 'none'}
          strokeWidth={1.5}
        />
        {isHalfFilled && (
          <View style={styles.halfStarOverlay}>
            <Star
              size={starSize}
              color={activeColor}
              fill={activeColor}
              strokeWidth={1.5}
              style={{ width: starSize / 2 }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{stars}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starContainer: {
    position: 'relative',
    marginRight: Spacing.xs,
  },
  halfStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
    width: '50%',
  },
});

export default StarRating;