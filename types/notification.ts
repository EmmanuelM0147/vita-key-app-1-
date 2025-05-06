export type NotificationType = 
  | 'new_property' 
  | 'price_drop' 
  | 'market_trend' 
  | 'saved_search' 
  | 'viewing_reminder'
  | 'property_update'
  | 'system'
  | 'security_alert'
  | 'fraud_alert'
  | 'verification_required';

export interface NotificationData {
  propertyImage?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyPrice?: number;
  oldPrice?: number;
  newPrice?: number;
  matchScore?: number;
  searchQuery?: string;
  viewingDate?: string;
  marketTrendData?: any;
  
  // Security-related notification data
  alertType?: 'fraud_detected' | 'suspicious_activity' | 'verification_required' | 'unusual_login';
  riskLevel?: string;
  riskFactors?: string[];
  transactionId?: string;
  transactionAmount?: number;
  transactionType?: string;
  securityAction?: string;
  verificationMethod?: string;
  
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  propertyId?: string;
  data?: NotificationData;
}

export interface NotificationPreferences {
  newListings: boolean;
  inquiries: boolean;
  priceChanges: boolean;
  inquiryResponses: boolean;
  viewingScheduled: boolean;
  system: boolean;
  securityAlerts: boolean;
  fraudAlerts: boolean;
  pushEnabled: boolean;
}