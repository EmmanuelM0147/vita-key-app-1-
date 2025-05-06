import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface DividerProps {
  direction?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  direction = 'horizontal',
  thickness = 1,
  color = Colors.secondary.sage,
  style,
  spacing = Spacing.md,
}) => {
  const dividerStyle = {
    ...(direction === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          marginVertical: spacing,
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: spacing,
        }),
    backgroundColor: color,
  };

  return <View style={[dividerStyle, style]} />;
};

export default Divider;