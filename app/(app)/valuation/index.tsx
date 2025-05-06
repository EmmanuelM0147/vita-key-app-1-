import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ValuationForm from '@/components/valuation/ValuationForm';
import Colors from '@/constants/colors';

export default function ValuationScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Property Valuation',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ValuationForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
});