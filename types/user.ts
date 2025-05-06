export type UserRole = 'user' | 'realtor' | 'admin';
export type SubscriptionPlan = 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Subscription {
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface UserPreferences {
  propertyTypes?: string[];
  priceRange?: { min: number; max: number };
  locations?: string[];
  bedrooms?: number;
  bathrooms?: number;
  notificationsEnabled?: boolean;
  amenities?: string[];
  location?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  subscription?: Subscription;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
  viewHistory?: string[];
  favorites?: string[];
  preferredAmenities?: string[];
  inquiries?: any[];
  notificationPreferences?: {
    newListings: boolean;
    inquiries: boolean;
    priceChanges: boolean;
    inquiryResponses: boolean;
    viewingScheduled: boolean;
    system: boolean;
    pushEnabled: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}