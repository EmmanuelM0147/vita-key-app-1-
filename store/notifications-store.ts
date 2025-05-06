import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/types/notification';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      
      addNotification: (notification: Notification) => {
        set((state) => {
          const newNotifications = [notification, ...state.notifications];
          const newUnreadCount = state.unreadCount + (notification.isRead ? 0 : 1);
          
          return {
            notifications: newNotifications,
            unreadCount: newUnreadCount
          };
        });
      },
      
      markAsRead: (id: string) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification => {
            if (notification.id === id && !notification.isRead) {
              return { ...notification, isRead: true };
            }
            return notification;
          });
          
          const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification => ({
            ...notification,
            isRead: true
          }));
          
          return {
            notifications: updatedNotifications,
            unreadCount: 0
          };
        });
      },
      
      deleteNotification: (id: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const updatedNotifications = state.notifications.filter(n => n.id !== id);
          const newUnreadCount = notification && !notification.isRead 
            ? state.unreadCount - 1 
            : state.unreadCount;
          
          return {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, newUnreadCount)
          };
        });
      },
      
      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        });
      },
      
      fetchNotifications: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          // In a real app, this would be an API call
          // For now, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // For demo purposes, we'll keep the existing notifications
          // In a real app, you would fetch from an API
          
          set((state) => ({
            isLoading: false,
            unreadCount: state.notifications.filter(n => !n.isRead).length
          }));
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationsStore;