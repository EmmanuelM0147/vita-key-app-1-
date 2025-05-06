import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Filter, Trash2, Home, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import SmartNotificationCard from '@/components/personalization/SmartNotificationCard';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import useNotificationsStore from '@/store/notifications-store';
import usePersonalizationStore from '@/store/personalization-store';
import { Notification, NotificationType } from '@/types/notification';
import { ScrollView } from 'react-native';

// Notification filter types
type NotificationFilter = 'all' | 'unread' | 'property' | 'price' | 'market' | 'system';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    fetchNotifications
  } = useNotificationsStore();
  
  const {
    personalizedProperties,
    propertiesOfInterest,
    fetchPersonalizedProperties,
    fetchPropertiesOfInterest
  } = usePersonalizationStore();
  
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      fetchPersonalizedProperties();
      fetchPropertiesOfInterest();
    }
  }, [user]);
  
  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter]);
  
  const filterNotifications = () => {
    let filtered = [...notifications];
    
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.isRead);
        break;
      case 'property':
        filtered = filtered.filter(notification => 
          notification.type === 'new_property' || notification.type === 'property_update'
        );
        break;
      case 'price':
        filtered = filtered.filter(notification => notification.type === 'price_drop');
        break;
      case 'market':
        filtered = filtered.filter(notification => notification.type === 'market_trend');
        break;
      case 'system':
        filtered = filtered.filter(notification => notification.type === 'system');
        break;
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredNotifications(filtered);
  };
  
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.propertyId) {
      router.push(`/marketplace/${notification.propertyId}`);
    } else if (notification.type === 'market_trend') {
      router.push('/market-insights');
    } else if (notification.type === 'saved_search') {
      router.push({
        pathname: '/search',
        params: { query: notification.data?.searchQuery || '' }
      });
    }
  };
  
  const handleDismissNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const renderFilterButton = (filter: NotificationFilter, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      {icon}
      <Typography 
        variant="caption" 
        color={activeFilter === filter ? Colors.primary.main : Colors.text.dark}
        style={styles.filterLabel}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color={Colors.text.muted} />
      <Typography variant="h5" style={styles.emptyTitle}>
        No notifications
      </Typography>
      <Typography variant="body2" color={Colors.text.muted} style={styles.emptyText}>
        You don't have any notifications yet. We'll notify you about new properties, price changes, and more.
      </Typography>
    </View>
  );
  
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <SmartNotificationCard
      id={item.id}
      type={item.type}
      title={item.title}
      message={item.message}
      timestamp={item.createdAt}
      propertyId={item.propertyId}
      propertyImage={item.data?.propertyImage}
      propertyTitle={item.data?.propertyTitle}
      propertyLocation={item.data?.propertyLocation}
      propertyPrice={item.data?.propertyPrice}
      oldPrice={item.data?.oldPrice}
      newPrice={item.data?.newPrice}
      matchScore={item.data?.matchScore}
      isRead={item.isRead}
      onPress={() => handleNotificationPress(item)}
      onDismiss={() => handleDismissNotification(item.id)}
    />
  );
  
  // Generate personalized notifications based on AI recommendations
  const generatePersonalizedNotifications = () => {
    if (!user) return;
    
    // Create notifications for personalized properties
    personalizedProperties.slice(0, 3).forEach((property, index) => {
      const notification: Notification = {
        id: `personalized-${property.id}`,
        userId: user.id,
        type: 'new_property' as NotificationType,
        title: 'Property Match Found',
        message: `We found a property that matches ${Math.round((property.matchScore || 0.7) * 100)}% of your preferences.`,
        isRead: false,
        createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
        propertyId: property.id,
        data: {
          propertyImage: property.images?.[0],
          propertyTitle: property.title,
          propertyLocation: typeof property.location === 'string' 
            ? property.location 
            : `${property.location?.city}, ${property.location?.state}`,
          propertyPrice: property.price,
          matchScore: property.matchScore || 0.7
        }
      };
      
      // Add notification if it doesn't exist
      if (!notifications.some(n => n.id === notification.id)) {
        useNotificationsStore.getState().addNotification(notification);
      }
    });
    
    // Create notifications for properties of interest
    propertiesOfInterest.slice(0, 2).forEach((property, index) => {
      const notification: Notification = {
        id: `interest-${property.id}`,
        userId: user.id,
        type: 'property_update' as NotificationType,
        title: 'Property You Might Like',
        message: 'Based on your browsing history, we think you might be interested in this property.',
        isRead: false,
        createdAt: new Date(Date.now() - (index * 7200000)).toISOString(),
        propertyId: property.id,
        data: {
          propertyImage: property.images?.[0],
          propertyTitle: property.title,
          propertyLocation: typeof property.location === 'string' 
            ? property.location 
            : `${property.location?.city}, ${property.location?.state}`,
          propertyPrice: property.price
        }
      };
      
      // Add notification if it doesn't exist
      if (!notifications.some(n => n.id === notification.id)) {
        useNotificationsStore.getState().addNotification(notification);
      }
    });
  };
  
  // Generate personalized notifications when properties are loaded
  useEffect(() => {
    if (personalizedProperties.length > 0 || propertiesOfInterest.length > 0) {
      generatePersonalizedNotifications();
    }
  }, [personalizedProperties, propertiesOfInterest]);

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Typography variant="h4" style={styles.title}>
          Notifications
        </Typography>
        
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleMarkAllAsRead}
              >
                <Typography variant="caption" color={Colors.primary.main}>
                  Mark all as read
                </Typography>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleClearAll}
              >
                <Trash2 size={18} color={Colors.text.muted} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilterButton('all', 'All', <Bell size={16} color={activeFilter === 'all' ? Colors.primary.main : Colors.text.dark} />)}
          {renderFilterButton('unread', 'Unread', <Bell size={16} color={activeFilter === 'unread' ? Colors.primary.main : Colors.text.dark} />)}
          {renderFilterButton('property', 'Properties', <Home size={16} color={activeFilter === 'property' ? Colors.primary.main : Colors.text.dark} />)}
          {renderFilterButton('price', 'Price Changes', <DollarSign size={16} color={activeFilter === 'price' ? Colors.primary.main : Colors.text.dark} />)}
          {renderFilterButton('market', 'Market Trends', <TrendingUp size={16} color={activeFilter === 'market' ? Colors.primary.main : Colors.text.dark} />)}
          {renderFilterButton('system', 'System', <AlertTriangle size={16} color={activeFilter === 'system' ? Colors.primary.main : Colors.text.dark} />)}
        </ScrollView>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : filteredNotifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  filtersScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.light,
  },
  activeFilterButton: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary[100],
  },
  filterLabel: {
    marginLeft: 4,
  },
  listContent: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: '80%',
  },
});