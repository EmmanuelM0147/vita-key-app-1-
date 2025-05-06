import React from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function RealtorLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.common.white,
        },
        headerTintColor: Colors.text.dark,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Realtor Dashboard',
        }}
      />
      <Stack.Screen
        name="add-property"
        options={{
          title: 'Add Property',
        }}
      />
      <Stack.Screen
        name="edit-property"
        options={{
          title: 'Edit Property',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Subscription Plans',
        }}
      />
    </Stack>
  );
}