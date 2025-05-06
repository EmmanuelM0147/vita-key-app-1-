import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { initNotifications } from "@/services/notification";
import useAuthStore from "@/store/auth-store";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Create a client for React Query
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Set a shorter timeout for font loading to prevent long waits
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
  });
  
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Handle font loading with a timeout
  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load or timeout after 3 seconds
        const fontLoadPromise = new Promise((resolve) => {
          if (fontsLoaded) {
            resolve(true);
          } else {
            // Set a listener for font loading
            const checkInterval = setInterval(() => {
              if (fontsLoaded) {
                clearInterval(checkInterval);
                resolve(true);
              }
            }, 100);
            
            // Timeout after 3 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              console.warn("Font loading timed out, continuing anyway");
              resolve(false);
            }, 3000);
          }
        });
        
        await fontLoadPromise;
        
        // Hide the splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error loading app assets:", e);
      } finally {
        setAppReady(true);
      }
    }
    
    prepare();
  }, [fontsLoaded]);
  
  // Initialize notifications when the app loads
  useEffect(() => {
    // Only initialize notifications if the user is authenticated
    if (isAuthenticated) {
      const unsubscribe = initNotifications((notification) => {
        console.log('Notification received:', notification);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated]);

  // Check for trpcClient initialization errors
  useEffect(() => {
    try {
      // Attempt to initialize trpcClient (this will throw if EXPO_PUBLIC_RORK_API_BASE_URL is missing)
      trpcClient;
    } catch (e: any) {
      setError(e.message || "Failed to initialize API client. Please check your environment configuration.");
    }
  }, []);

  // Show a loading screen until everything is ready
  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
        <Text style={{ color: Colors.text.dark }}>Loading...</Text>
      </View>
    );
  }

  // Show an error screen if there's an initialization error
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary, padding: 20 }}>
        <Text style={{ color: Colors.text.dark, fontSize: 18, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <RootLayoutNav />
            </SafeAreaProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: Colors.background.primary,
      },
      headerShadowVisible: false,
      headerTintColor: Colors.text.dark,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: Colors.background.primary,
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}