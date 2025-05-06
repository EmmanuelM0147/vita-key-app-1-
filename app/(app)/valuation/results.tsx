import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ValuationResult from '@/components/valuation/ValuationResult';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import Colors from '@/constants/colors';

export default function ValuationResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getValuationById } = useAIAnalysisStore();
  const [isLoading, setIsLoading] = useState(true);
  const [valuation, setValuation] = useState(getValuationById(id || ''));
  
  useEffect(() => {
    if (id) {
      const result = getValuationById(id);
      setValuation(result);
      setIsLoading(false);
    }
  }, [id]);
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Valuation Results',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerShadowVisible: false,
          headerShown: false,
        }}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : valuation ? (
        <ValuationResult valuation={valuation} />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});