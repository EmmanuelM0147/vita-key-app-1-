import { User } from './user';

export enum ReviewType {
  PROPERTY = 'property',
  REALTOR = 'realtor'
}

export interface ReviewRating {
  overall: number; // 1-5 stars
  // For properties
  location?: number;
  value?: number;
  accuracy?: number;
  // For realtors
  professionalism?: number;
  responsiveness?: number;
  knowledge?: number;
}

export interface Review {
  id: string;
  type: ReviewType;
  targetId: string; // Property ID or Realtor ID
  userId: string;
  user?: User;
  rating: ReviewRating;
  comment: string;
  title?: string;
  images?: string[];
  helpful: number; // Number of users who found this review helpful
  reported: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  // For properties
  locationRating?: number;
  valueRating?: number;
  accuracyRating?: number;
  // For realtors
  professionalismRating?: number;
  responsivenessRating?: number;
  knowledgeRating?: number;
}

export interface ReviewFormData {
  targetId: string;
  type: ReviewType;
  rating: ReviewRating;
  title?: string;
  comment: string;
  images?: string[];
}