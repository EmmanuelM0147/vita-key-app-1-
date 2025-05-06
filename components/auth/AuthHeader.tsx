import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <ArrowLeft size={24} color={Colors.text.dark} />
        </TouchableOpacity>
      )}
      
      <View style={styles.titleContainer}>
        <Typography variant="h1" weight="700" style={styles.title}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body1" color={Colors.text.muted} style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
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
  titleContainer: {
    marginTop: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
    fontSize: 28,
  },
  subtitle: {
    lineHeight: 22,
  },
});

export default AuthHeader;