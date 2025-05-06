import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Facebook, Apple, Mail } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface SocialButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  onFacebookPress: () => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({
  onGooglePress,
  onApplePress,
  onFacebookPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={onGooglePress}
        activeOpacity={0.8}
      >
        <Mail size={18} color={Colors.text.dark} />
        <Typography variant="body2" weight="600" style={styles.buttonText}>
          Google
        </Typography>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.appleButton]}
        onPress={onApplePress}
        activeOpacity={0.8}
      >
        <Apple size={18} color={Colors.common.white} />
        <Typography variant="body2" weight="600" style={[styles.buttonText, styles.appleButtonText]}>
          Apple
        </Typography>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.facebookButton]}
        onPress={onFacebookPress}
        activeOpacity={0.8}
      >
        <Facebook size={18} color={Colors.common.white} />
        <Typography variant="body2" weight="600" style={[styles.buttonText, styles.facebookButtonText]}>
          Facebook
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  googleButton: {
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  appleButton: {
    backgroundColor: Colors.common.black,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  appleButtonText: {
    color: Colors.common.white,
  },
  facebookButtonText: {
    color: Colors.common.white,
  },
});

export default SocialButtons;