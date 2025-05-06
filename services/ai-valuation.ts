import { PropertyDetails, ValuationResult, ComparableProperty } from '@/types/valuation';
import { generateRandomId } from '@/utils/helpers';

// Mock data for comparable properties
const mockComparableProperties: ComparableProperty[] = [
  {
    id: 'comp1',
    address: '123 Maple Street, Austin, TX',
    price: 425000,
    squareFeet: 1850,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2010,
    distanceInMiles: 0.5,
    soldDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    similarity: 92
  },
  {
    id: 'comp2',
    address: '456 Oak Avenue, Austin, TX',
    price: 450000,
    squareFeet: 1950,
    bedrooms: 3,
    bathrooms: 2.5,
    yearBuilt: 2012,
    distanceInMiles: 0.7,
    soldDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    similarity: 88
  },
  {
    id: 'comp3',
    address: '789 Pine Road, Austin, TX',
    price: 410000,
    squareFeet: 1750,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2008,
    distanceInMiles: 0.9,
    soldDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    similarity: 85
  },
  {
    id: 'comp4',
    address: '321 Elm Boulevard, Austin, TX',
    price: 475000,
    squareFeet: 2100,
    bedrooms: 4,
    bathrooms: 2.5,
    yearBuilt: 2015,
    distanceInMiles: 1.2,
    soldDate: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    similarity: 82
  },
  {
    id: 'comp5',
    address: '654 Cedar Lane, Austin, TX',
    price: 435000,
    squareFeet: 1900,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2011,
    distanceInMiles: 1.5,
    soldDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    imageUrl: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126',
    similarity: 80
  }
];

// Valuation factors that affect property price
const valuationFactors = [
  {
    factor: 'Location',
    impact: 8,
    description: 'Property is in a highly desirable neighborhood with good schools and amenities.'
  },
  {
    factor: 'Property Size',
    impact: 6,
    description: 'Square footage is above average for the area, positively impacting value.'
  },
  {
    factor: 'Property Age',
    impact: -2,
    description: 'The property is older than comparable homes in the area.'
  },
  {
    factor: 'Condition',
    impact: 5,
    description: 'Property is in good condition with modern updates.'
  },
  {
    factor: 'Market Trends',
    impact: 7,
    description: 'The neighborhood has shown consistent price appreciation over the last 3 years.'
  }
];

/**
 * Generate a property valuation based on provided details
 * In a real app, this would call an ML model or API
 */
export const generatePropertyValuation = (details: PropertyDetails): Promise<ValuationResult> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Base price calculation (simplified for demo)
      const basePrice = details.squareFeet * 225; // $225 per sq ft base
      
      // Adjustments based on property details
      const bedroomAdjustment = details.bedrooms * 15000;
      const bathroomAdjustment = details.bathrooms * 12000;
      const ageAdjustment = Math.max(0, 2023 - details.yearBuilt) * -500;
      
      // Condition adjustment
      let conditionAdjustment = 0;
      switch (details.condition) {
        case 'excellent': conditionAdjustment = 50000; break;
        case 'good': conditionAdjustment = 25000; break;
        case 'fair': conditionAdjustment = 0; break;
        case 'poor': conditionAdjustment = -25000; break;
      }
      
      // Features adjustment
      const featuresAdjustment = details.features.length * 5000;
      
      // Calculate estimated value
      let estimatedValue = basePrice + bedroomAdjustment + bathroomAdjustment + 
                          ageAdjustment + conditionAdjustment + featuresAdjustment;
      
      // Add some randomness to make it realistic
      estimatedValue = Math.round(estimatedValue * (1 + (Math.random() * 0.1 - 0.05)));
      
      // Create value range (±5%)
      const valueRange = {
        min: Math.round(estimatedValue * 0.95),
        max: Math.round(estimatedValue * 1.05)
      };
      
      // Calculate confidence score (70-95%)
      const confidence = Math.round(70 + Math.random() * 25);
      
      // Filter comparable properties based on similarity to the subject property
      const comparableProperties = mockComparableProperties
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
      
      // Create the valuation result
      const result: ValuationResult = {
        id: generateRandomId(),
        propertyDetails: details,
        estimatedValue,
        valueRange,
        confidence,
        timestamp: Date.now(),
        comparableProperties,
        marketTrends: {
          neighborhoodGrowth: 5.2, // 5.2% annual growth
          cityGrowth: 4.8, // 4.8% annual growth
          pricePerSqFt: Math.round(estimatedValue / details.squareFeet)
        },
        valuationFactors: valuationFactors
      };
      
      resolve(result);
    }, 1500); // 1.5 second delay to simulate processing
  });
};

/**
 * Get comparable properties for a given location and property type
 */
export const getComparableProperties = (
  neighborhood: string,
  propertyType: string,
  squareFeet: number,
  bedrooms: number
): ComparableProperty[] => {
  // In a real app, this would query a database or API
  // For demo, we'll return mock data
  return mockComparableProperties
    .sort(() => Math.random() - 0.5) // Shuffle the array
    .slice(0, 5); // Return 5 random properties
};

/**
 * Get market trends for a specific neighborhood
 */
export const getNeighborhoodTrends = (neighborhood: string) => {
  // Mock data for neighborhood trends
  return {
    priceGrowth: 5.2, // 5.2% annual growth
    averageDaysOnMarket: 28,
    medianPrice: 435000,
    inventory: 42, // number of active listings
    salesVolume: 18, // monthly sales
    pricePerSqFt: 225
  };
};