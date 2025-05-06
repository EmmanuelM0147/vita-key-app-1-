export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'for_sale' | 'for_rent';

export interface PropertyLocation {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyFeature {
  name: string;
  description?: string;
  icon?: string;
  confidence?: number;
}

export interface PropertyDetails {
  yearBuilt?: number;
  lotSize?: number;
  parkingSpaces?: number;
  stories?: number;
  heating?: string;
  cooling?: string;
  basement?: boolean;
  garage?: boolean;
  pool?: boolean;
  view?: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  size?: number; // Alias for area
  location: PropertyLocation | string;
  images?: string[];
  amenities?: string[];
  features?: PropertyFeature[];
  details?: PropertyDetails;
  createdAt: string;
  updatedAt: string;
  listedDate?: string;
  realtorId?: string;
  agentId?: string;
  virtualTour?: string;
  floorPlan?: string;
  tags?: string[];
  
  // AI-powered fields
  matchScore?: number;
  matchReasons?: string[];
  predictedValue?: number;
  investmentScore?: number;
  appreciationRate?: number;
  similarProperties?: string[];
  
  // Visual recognition fields
  visualFeatures?: {
    architecturalStyle?: string;
    condition?: string;
    outdoorSpace?: boolean;
    detectedAmenities?: string[];
    visualSimilarityScore?: number;
  };
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  location: string | PropertyLocation;
  images: string[];
  amenities: string[];
  features?: PropertyFeature[];
  details?: PropertyDetails;
}

export interface PropertyFilter {
  type?: PropertyType | 'all';
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  areaMin?: number;
  location?: string;
  amenities?: string[];
  status?: 'for_sale' | 'for_rent' | 'all';
}

export interface PropertySortOption {
  field: 'price' | 'createdAt' | 'bedrooms' | 'bathrooms' | 'area';
  direction: 'asc' | 'desc';
}

export interface VisualSearchResult {
  property: Property;
  similarityScore: number;
  matchReasons: string[];
}

export interface ImageAnalysisResult {
  propertyType?: PropertyType;
  estimatedBedrooms?: number;
  estimatedBathrooms?: number;
  detectedFeatures: PropertyFeature[];
  architecturalStyle?: string;
  condition?: string;
  outdoorSpace?: boolean;
  confidence: number;
}