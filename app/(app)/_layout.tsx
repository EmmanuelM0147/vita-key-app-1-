import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Heart, Plus, User, MessageSquare, BarChart2, Calculator } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border.main,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="market-insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="valuation"
        options={{
          title: 'Valuation',
          tabBarIcon: ({ color, size }) => <Calculator size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/property/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/sessions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="realtor"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="valuation/results"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}