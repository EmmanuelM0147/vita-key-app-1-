import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          ...styles.card,
          ...styles.outlined,
        };
      case 'elevated':
        return {
          ...styles.card,
          ...styles.elevated,
        };
      case 'flat':
        return {
          ...styles.card,
          ...styles.flat,
        };
      default:
        return styles.card;
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.secondary.sage,
  },
  elevated: {
    ...Shadows.medium,
  },
  flat: {
    backgroundColor: Colors.background.light,
  },
});

export default Card;