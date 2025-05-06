import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BorderRadius } from '@/constants/theme';
import useNotificationsStore from '@/store/notifications-store';

interface NotificationBadgeProps {
  size?: number;
  color?: string;
  badgeColor?: string;
}

export default function NotificationBadge({ 
  size = 24, 
  color = Colors.text.dark,
  badgeColor = Colors.primary.gold
}: NotificationBadgeProps) {
  const router = useRouter();
  const { unreadCount } = useNotificationsStore();
  
  const handlePress = () => {
    router.push('/notifications');
  };
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Bell size={size} color={color} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <View style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount.toString()}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.common.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});