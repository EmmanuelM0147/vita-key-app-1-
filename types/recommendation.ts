import { Property } from './property';

export interface PropertyPreference {
  locations?: string[];
  priceRange: {
    min: number;
    max: number;
  };
  propertyTypes: string[];
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
}

export interface RecommendationSettings {
  enablePersonalized: boolean;
  enableSimilarProperties: boolean;
  enableTrending: boolean;
  minMatchScore: number;
  notifyOnNewMatches: boolean;
  maxRecommendationsPerDay: number;
}

export interface RecommendationExplanationFactor {
  title: string;
  description: string;
  score: number;
}

export interface RecommendationExplanation {
  summary: string;
  factors: RecommendationExplanationFactor[];
  conclusion: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  propertyId: string;
  property: Property;
  propertyTitle?: string;
  matchScore: number;
  reasons: string[];
  isViewed: boolean;
  createdAt: string;
  explanation?: RecommendationExplanation | null;
}