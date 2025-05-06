import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function MarketInsightsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.light,
        },
        headerTintColor: Colors.text.dark,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background.light,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="neighborhoods"
        options={{
          title: 'Trending Neighborhoods',
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          title: 'Market Report',
        }}
      />
    </Stack>
  );
}