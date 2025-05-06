import { Notification, NotificationType } from '@/types/notification';

export interface NotificationPreferences {
  newListings: boolean;
  inquiries: boolean;
  priceChanges: boolean;
  inquiryResponses: boolean;
  viewingScheduled: boolean;
  system: boolean;
  pushEnabled: boolean;
}

/**
 * Service for handling notifications
 */
export const notificationService = {
  /**
   * Get notifications for a user
   * @param userId User ID
   * @returns Promise resolving to an array of notifications
   */
  getNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      // In a real app, this would fetch from an API
      // For demo purposes, we'll return mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock notifications
      return [
        {
          id: '1',
          userId,
          type: 'new_property' as NotificationType,
          title: 'New Property Match',
          message: 'We found a new property that matches your preferences.',
          isRead: false,
          createdAt: new Date().toISOString(),
          propertyId: 'property1',
          data: {
            propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            propertyTitle: 'Modern Apartment in Downtown',
            propertyLocation: 'Downtown, New York',
            propertyPrice: 450000,
            matchScore: 0.85
          }
        },
        {
          id: '2',
          userId,
          type: 'price_drop' as NotificationType,
          title: 'Price Drop Alert',
          message: 'A property you saved has dropped in price.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          propertyId: 'property2',
          data: {
            propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            propertyTitle: 'Luxury Villa with Pool',
            propertyLocation: 'Beverly Hills, CA',
            oldPrice: 1200000,
            newPrice: 1100000
          }
        }
      ];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @returns Promise resolving to a boolean indicating success
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      // In a real app, this would update the notification in the database
      // For demo purposes, we'll just return success
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  /**
   * Delete a notification
   * @param notificationId Notification ID
   * @returns Promise resolving to a boolean indicating success
   */
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      // In a real app, this would delete the notification from the database
      // For demo purposes, we'll just return success
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },
  
  /**
   * Update notification preferences
   * @param userId User ID
   * @param preferences Updated notification preferences
   * @returns Promise resolving to a boolean indicating success
   */
  updateNotificationPreferences: async (
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    try {
      // In a real app, this would update the user's notification preferences in the database
      // For demo purposes, we'll just return success
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
};

export default notificationService;