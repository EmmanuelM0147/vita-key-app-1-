import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  Text, 
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(null as any);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const renderPasswordIcon = () => {
    if (!secureTextEntry) return null;
    
    return (
      <TouchableOpacity 
        onPress={togglePasswordVisibility} 
        style={styles.iconRight}
      >
        {isPasswordVisible ? (
          <EyeOff size={20} color={Colors.text.muted} />
        ) : (
          <Eye size={20} color={Colors.text.muted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            inputStyle,
            (leftIcon || rightIcon || secureTextEntry) && { paddingRight: 40 }
          ]}
          placeholderTextColor={Colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {renderPasswordIcon() || (rightIcon && <View style={styles.iconRight}>{rightIcon}</View>)}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    color: Colors.text.dark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary.sage,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.common.white,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text.dark,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
    position: 'absolute',
    right: 0,
  },
  focused: {
    borderColor: Colors.primary.gold,
  },
  error: {
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});

export default Input;