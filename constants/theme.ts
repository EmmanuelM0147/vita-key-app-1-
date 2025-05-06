import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Spacing
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Font Sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Screen Dimensions
export const ScreenWidth = width;
export const ScreenHeight = height;

// Shadows
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Z-Index
export const ZIndex = {
  base: 1,
  dropdown: 10,
  modal: 100,
  toast: 1000,
};

// Animation Durations
export const AnimationDurations = {
  short: 150,
  medium: 300,
  long: 500,
};

export default {
  Spacing,
  BorderRadius,
  FontSizes,
  ScreenWidth,
  ScreenHeight,
  Shadows,
  ZIndex,
  AnimationDurations,
};