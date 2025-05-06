export interface PropertyDetails {
  address: string;
  neighborhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  lotSize: number;
  condition: 'poor' | 'fair' | 'good' | 'excellent';
  features: string[];
}

export interface ValuationResult {
  id: string;
  propertyDetails: PropertyDetails;
  estimatedValue: number;
  valueRange: {
    min: number;
    max: number;
  };
  confidence: number; // 0-100
  timestamp: number;
  comparableProperties: ComparableProperty[];
  marketTrends: {
    neighborhoodGrowth: number; // percentage
    cityGrowth: number; // percentage
    pricePerSqFt: number;
  };
  valuationFactors: {
    factor: string;
    impact: number; // -10 to 10, negative means decreasing value
    description: string;
  }[];
}

export interface ComparableProperty {
  id: string;
  address: string;
  price: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  distanceInMiles: number;
  soldDate?: number; // timestamp
  imageUrl: string;
  similarity: number; // 0-100
}