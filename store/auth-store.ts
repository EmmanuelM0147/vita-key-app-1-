import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, UserPreferences } from '@/types/user';
import { mockApi } from '@/services/api';
import { NotificationPreferences } from '@/services/notification';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await mockApi.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to login',
            isLoading: false
          });
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await mockApi.register(data);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to register',
            isLoading: false
          });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      updateUser: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          const updatedUser = await mockApi.updateUser(currentUser.id, data);
          
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update user',
            isLoading: false
          });
          throw error;
        }
      },
      
      updatePreferences: async (preferences: UserPreferences) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          const updatedUser = await mockApi.updateUser(currentUser.id, {
            preferences
          });
          
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update preferences',
            isLoading: false
          });
          throw error;
        }
      },
      
      updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          const currentPreferences = currentUser.notificationPreferences || {
            newListings: true,
            inquiries: true,
            priceChanges: true,
            inquiryResponses: true,
            viewingScheduled: true,
            system: true,
            pushEnabled: true,
          };
          
          const updatedPreferences = {
            ...currentPreferences,
            ...preferences
          };
          
          const updatedUser = await mockApi.updateUser(currentUser.id, {
            notificationPreferences: updatedPreferences
          });
          
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update notification preferences',
            isLoading: false
          });
          throw error;
        }
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;