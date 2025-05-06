export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isLoading?: boolean;
  relatedPropertyId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: number;
  messages: Message[];
}

export interface QuickReply {
  id: string;
  text: string;
  action?: () => void;
}

export interface PropertyContext {
  propertyId?: string;
  propertyTitle?: string;
  propertyType?: string;
  price?: number;
  location?: string;
}