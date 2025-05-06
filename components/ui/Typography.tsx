import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import Colors from '@/constants/colors';
import { FontSizes } from '@/constants/theme';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body1' | 'body2' | 'caption' | 'button';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color,
  align,
  weight,
  style,
  ...props
}) => {
  return (
    <Text
      style={[
        styles[variant],
        color && { color },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  h2: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  h3: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 6,
  },
  h4: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  h5: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  body1: {
    fontSize: FontSizes.md,
    color: Colors.text.dark,
  },
  body2: {
    fontSize: FontSizes.sm,
    color: Colors.text.dark,
  },
  caption: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  button: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});

export default Typography;