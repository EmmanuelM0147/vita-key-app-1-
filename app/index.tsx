import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import useAuthStore from '@/store/auth-store';

export default function SplashScreen() {
  const { isAuthenticated } = useAuthStore();

  // In a real app, you might want to check token validity here
  // or perform other initialization tasks

  // Redirect after splash screen is shown
  useEffect(() => {
    const timer = setTimeout(() => {
      // This will be handled by the Redirect component
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }

  // This part won't be reached due to the Redirect, but we'll keep it for completeness
  return (
    <LinearGradient
      colors={[Colors.secondary[500], '#0F1A2C']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner}>
              {/* Replace with your actual logo */}
              <Typography variant="h1" color={Colors.primary[500]} style={styles.logoText}>
                VK
              </Typography>
            </View>
          </View>
        </View>
        
        <Typography variant="h1" color={Colors.white} style={styles.title}>
          Vita Key
        </Typography>
        
        <Typography variant="body1" color={Colors.white} style={styles.subtitle}>
          Your key to a better living experience
        </Typography>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: '80%',
  },
});