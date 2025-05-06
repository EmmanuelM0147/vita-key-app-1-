import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Key, Users, ChevronRight } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const onboardingSlides = [
  {
    id: 1,
    title: "Find Your Dream Home",
    description: "Browse thousands of properties tailored to your preferences and budget.",
    icon: <Home size={32} color={Colors.primary.gold} />
  },
  {
    id: 2,
    title: "Connect with Realtors",
    description: "Get in touch with professional realtors who can guide you through the process.",
    icon: <Users size={32} color={Colors.primary.gold} />
  },
  {
    id: 3,
    title: "Unlock Your Future",
    description: "Secure your ideal living space with just a few taps.",
    icon: <Key size={32} color={Colors.primary.gold} />
  }
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  const handleSkip = () => {
    router.push('/(app)');
  };

  const renderOnboardingItem = ({ item, index }) => {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          {item.icon}
        </View>
        <Typography variant="h3" color={Colors.common.white} style={styles.slideTitle}>
          {item.title}
        </Typography>
        <Typography variant="body1" color={Colors.common.white} style={styles.slideDescription}>
          {item.description}
        </Typography>
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <LinearGradient
        colors={['#0A2463', '#0D2B76', '#102F82']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Background pattern */}
        <View style={styles.patternOverlay}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.patternRow}>
              {Array.from({ length: 5 }).map((_, j) => (
                <View 
                  key={`${i}-${j}`} 
                  style={[
                    styles.patternDot,
                    { opacity: Math.random() * 0.2 + 0.05 }
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>

        <Animated.View style={[styles.logoSection, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.primary.gold, '#C69115']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoInner}>
                <Typography variant="h1" color={Colors.common.white} style={styles.logoText}>
                  VK
                </Typography>
              </View>
            </LinearGradient>
          </View>
          
          <Typography variant="h1" color={Colors.common.white} style={styles.title}>
            Welcome to Vita Key
          </Typography>
          
          <Typography variant="body1" color={Colors.common.white} style={styles.subtitle}>
            Your key to a better living experience
          </Typography>
        </Animated.View>
        
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            data={onboardingSlides}
            renderItem={renderOnboardingItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveSlide(slideIndex);
            }}
            style={styles.carousel}
          />
          
          <View style={styles.paginationContainer}>
            {onboardingSlides.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
                extrapolate: 'clamp',
              });
              
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { width: dotWidth, opacity },
                  ]}
                />
              );
            })}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.button}
            rightIcon={<ChevronRight size={20} color={Colors.text.dark} />}
          />
          
          <Button
            title="Create Account"
            onPress={handleSignUp}
            variant="outline"
            size="lg"
            fullWidth
            style={styles.button}
            textStyle={{ color: Colors.common.white }}
          />
          
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Typography variant="body2" color={Colors.common.white} style={styles.skipText}>
              Skip for now
            </Typography>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 60,
  },
  patternDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.common.white,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: Colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.common.white,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  carouselContainer: {
    flex: 1,
    marginTop: Spacing.xl,
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  slideTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  slideDescription: {
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.gold,
    marginHorizontal: 4,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  button: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  skipText: {
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});