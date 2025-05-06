import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Text } from 'react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  textStyle?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallButton;
      case 'md':
        return styles.mediumButton;
      case 'lg':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallText;
      case 'md':
        return styles.mediumText;
      case 'lg':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getDisabledStyle = () => {
    if (disabled || loading) {
      switch (variant) {
        case 'primary':
          return styles.disabledPrimaryButton;
        case 'secondary':
          return styles.disabledSecondaryButton;
        case 'outline':
          return styles.disabledOutlineButton;
        case 'text':
          return styles.disabledTextButton;
        case 'danger':
          return styles.disabledDangerButton;
        default:
          return styles.disabledPrimaryButton;
      }
    }
    return {};
  };

  const getDisabledTextStyle = () => {
    if (disabled || loading) {
      switch (variant) {
        case 'primary':
          return styles.disabledPrimaryText;
        case 'secondary':
          return styles.disabledSecondaryText;
        case 'outline':
          return styles.disabledOutlineText;
        case 'text':
          return styles.disabledTextButtonText;
        case 'danger':
          return styles.disabledDangerText;
        default:
          return styles.disabledPrimaryText;
      }
    }
    return {};
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.common.white;
      case 'secondary':
        return Colors.common.white;
      case 'outline':
        return Colors.primary[500];
      case 'text':
        return Colors.primary[500];
      case 'danger':
        return Colors.common.white;
      default:
        return Colors.common.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        getDisabledStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              getDisabledTextStyle(),
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
  // Variants
  primaryButton: {
    backgroundColor: Colors.primary.gold,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.gold,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: Colors.status.error,
  },
  // Text styles
  primaryText: {
    color: Colors.common.white,
  },
  secondaryText: {
    color: Colors.common.white,
  },
  outlineText: {
    color: Colors.primary.gold,
  },
  textButtonText: {
    color: Colors.primary.gold,
  },
  dangerText: {
    color: Colors.common.white,
  },
  // Sizes
  smallButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  mediumButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  largeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  // Disabled styles
  disabledPrimaryButton: {
    backgroundColor: Colors.primary[100],
  },
  disabledSecondaryButton: {
    backgroundColor: Colors.secondary[100],
  },
  disabledOutlineButton: {
    borderColor: Colors.border.light,
  },
  disabledTextButton: {
    // No background change
  },
  disabledDangerButton: {
    backgroundColor: Colors.status.error + '60', // 60% opacity
  },
  // Disabled text styles
  disabledPrimaryText: {
    color: Colors.common.white,
  },
  disabledSecondaryText: {
    color: Colors.common.white,
  },
  disabledOutlineText: {
    color: Colors.text.muted,
  },
  disabledTextButtonText: {
    color: Colors.text.muted,
  },
  disabledDangerText: {
    color: Colors.common.white,
  },
});

export default Button;