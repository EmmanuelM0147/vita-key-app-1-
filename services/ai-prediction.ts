import { Property } from '@/types/property';

// Mock historical data - in a real app, this would come from an API
const historicalPriceData = {
  // Average price changes by neighborhood (%)
  neighborhoodTrends: {
    'Downtown': 5.2,
    'Westside': 4.8,
    'Eastside': 3.9,
    'Northside': 6.1,
    'Southside': 2.7,
    'Suburban': 3.5,
    'Beachfront': 7.2,
    'Mountain View': 5.8,
    'Riverside': 4.3,
    'Central': 5.5,
  },
  // Price changes by property type (%)
  propertyTypeTrends: {
    'Apartment': 3.8,
    'House': 4.5,
    'Condo': 4.2,
    'Townhouse': 3.9,
    'Villa': 5.1,
    'Penthouse': 6.3,
    'Duplex': 3.7,
    'Studio': 3.2,
    'Loft': 4.7,
  },
  // Market factors affecting prices
  marketFactors: {
    interestRate: 3.5, // Current interest rate
    economicGrowth: 2.8, // Economic growth rate
    housingDemand: 'high', // Housing demand level
    constructionCosts: 'increasing', // Construction cost trend
    inventoryLevel: 'low', // Housing inventory level
  }
};

// Prediction confidence levels
export enum PredictionConfidence {
  VeryHigh = 'Very High',
  High = 'High',
  Moderate = 'Moderate',
  Low = 'Low',
  VeryLow = 'Very Low',
}

// Investment potential levels
export enum InvestmentPotential {
  Excellent = 'Excellent',
  VeryGood = 'Very Good',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
}

// Price prediction result
export interface PricePrediction {
  currentPrice: number;
  predictedPrice1Year: number;
  predictedPrice3Year: number;
  predictedPrice5Year: number;
  growthRate1Year: number;
  growthRate3Year: number;
  growthRate5Year: number;
  confidence: PredictionConfidence;
}

// Investment analysis result
export interface InvestmentAnalysis {
  potential: InvestmentPotential;
  roi1Year: number;
  roi3Year: number;
  roi5Year: number;
  riskLevel: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

// Market trend data
export interface MarketTrend {
  neighborhood: string;
  currentTrend: number; // % change
  forecast: number; // % change
  demandLevel: string;
  supplyLevel: string;
  priceHistory: { month: string; value: number }[];
}

// Comprehensive property analysis
export interface PropertyAnalysis {
  propertyId: string;
  pricePrediction: PricePrediction;
  investmentAnalysis: InvestmentAnalysis;
  marketTrend: MarketTrend;
  similarProperties: string[]; // IDs of similar properties
  lastUpdated: Date;
}

/**
 * Predicts property price based on historical data and property attributes
 */
export const predictPropertyPrice = (property: Property): PricePrediction => {
  // Get neighborhood trend or default to average
  const neighborhoodGrowth = 
    historicalPriceData.neighborhoodTrends[property.location?.neighborhood || ''] || 4.5;
  
  // Get property type trend or default to average
  const propertyTypeGrowth = 
    historicalPriceData.propertyTypeTrends[property.type || ''] || 4.0;
  
  // Calculate combined growth rate (weighted average)
  const combinedGrowthRate = (neighborhoodGrowth * 0.6) + (propertyTypeGrowth * 0.4);
  
  // Apply adjustments based on property features
  let adjustedGrowthRate = combinedGrowthRate;
  
  // Adjust for property age (newer properties appreciate faster)
  if (property.yearBuilt) {
    const age = new Date().getFullYear() - property.yearBuilt;
    if (age < 5) adjustedGrowthRate += 0.5;
    else if (age > 30) adjustedGrowthRate -= 0.7;
  }
  
  // Adjust for amenities
  if (property.amenities && property.amenities.length > 0) {
    const premiumAmenities = ['Pool', 'Gym', 'Doorman', 'Parking', 'Garden'];
    const hasPremiumAmenities = property.amenities.some(amenity => 
      premiumAmenities.includes(amenity));
    
    if (hasPremiumAmenities) {
      adjustedGrowthRate += 0.3;
    }
  }
  
  // Calculate predicted prices
  const currentPrice = property.price;
  const growthRate1Year = adjustedGrowthRate;
  const growthRate3Year = adjustedGrowthRate * 2.8; // Compounded growth
  const growthRate5Year = adjustedGrowthRate * 4.5; // Compounded growth
  
  const predictedPrice1Year = currentPrice * (1 + (growthRate1Year / 100));
  const predictedPrice3Year = currentPrice * (1 + (growthRate3Year / 100));
  const predictedPrice5Year = currentPrice * (1 + (growthRate5Year / 100));
  
  // Determine confidence level based on data quality
  let confidence = PredictionConfidence.Moderate;
  if (adjustedGrowthRate > 6) {
    confidence = PredictionConfidence.VeryHigh;
  } else if (adjustedGrowthRate > 5) {
    confidence = PredictionConfidence.High;
  } else if (adjustedGrowthRate < 3) {
    confidence = PredictionConfidence.Low;
  }
  
  return {
    currentPrice,
    predictedPrice1Year,
    predictedPrice3Year,
    predictedPrice5Year,
    growthRate1Year,
    growthRate3Year,
    growthRate5Year,
    confidence,
  };
};

/**
 * Analyzes investment potential for a property
 */
export const analyzeInvestment = (property: Property, prediction: PricePrediction): InvestmentAnalysis => {
  // Calculate ROI
  const roi1Year = (prediction.predictedPrice1Year - property.price) / property.price * 100;
  const roi3Year = (prediction.predictedPrice3Year - property.price) / property.price * 100;
  const roi5Year = (prediction.predictedPrice5Year - property.price) / property.price * 100;
  
  // Determine risk level
  let riskLevel = 'Medium';
  if (prediction.confidence === PredictionConfidence.VeryHigh || 
      prediction.confidence === PredictionConfidence.High) {
    riskLevel = 'Low';
  } else if (prediction.confidence === PredictionConfidence.Low || 
             prediction.confidence === PredictionConfidence.VeryLow) {
    riskLevel = 'High';
  }
  
  // Determine investment potential
  let potential = InvestmentPotential.Good;
  if (roi5Year > 25) {
    potential = InvestmentPotential.Excellent;
  } else if (roi5Year > 20) {
    potential = InvestmentPotential.VeryGood;
  } else if (roi5Year < 15) {
    potential = InvestmentPotential.Fair;
  } else if (roi5Year < 10) {
    potential = InvestmentPotential.Poor;
  }
  
  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  
  // Location analysis
  if (property.location?.neighborhood && 
      historicalPriceData.neighborhoodTrends[property.location.neighborhood] > 5) {
    strengths.push('Located in a high-growth neighborhood');
    opportunities.push('Area is experiencing rapid development');
  } else if (property.location?.neighborhood && 
             historicalPriceData.neighborhoodTrends[property.location.neighborhood] < 3) {
    weaknesses.push('Located in a slower-growth neighborhood');
  }
  
  // Property type analysis
  if (property.type && historicalPriceData.propertyTypeTrends[property.type] > 4.5) {
    strengths.push(`${property.type}s are in high demand`);
  }
  
  // Price analysis
  if (property.price < 300000) {
    strengths.push('Entry-level price point with broad market appeal');
  } else if (property.price > 1000000) {
    weaknesses.push('Luxury price point with limited buyer pool');
    opportunities.push('Potential for luxury rental income');
  }
  
  // Age analysis
  if (property.yearBuilt && (new Date().getFullYear() - property.yearBuilt) < 5) {
    strengths.push('New construction with minimal maintenance needs');
  } else if (property.yearBuilt && (new Date().getFullYear() - property.yearBuilt) > 30) {
    weaknesses.push('Older property may require renovations');
    opportunities.push('Potential to add value through renovations');
  }
  
  return {
    potential,
    roi1Year,
    roi3Year,
    roi5Year,
    riskLevel,
    strengths,
    weaknesses,
    opportunities,
  };
};

/**
 * Analyzes market trends for a property's neighborhood
 */
export const analyzeMarketTrend = (property: Property): MarketTrend => {
  const neighborhood = property.location?.neighborhood || 'Central';
  const currentTrend = historicalPriceData.neighborhoodTrends[neighborhood] || 4.0;
  
  // Generate mock price history data
  const priceHistory = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  let baseValue = 100;
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i) % 12;
    const month = months[monthIndex < 0 ? monthIndex + 12 : monthIndex];
    
    // Add some randomness to the trend
    const randomFactor = 0.9 + (Math.random() * 0.2);
    baseValue = baseValue * (1 + ((currentTrend / 100) * randomFactor) / 12);
    
    priceHistory.push({
      month,
      value: Math.round(baseValue * 10) / 10,
    });
  }
  
  // Determine demand and supply levels
  let demandLevel = 'Moderate';
  if (currentTrend > 5) {
    demandLevel = 'High';
  } else if (currentTrend < 3) {
    demandLevel = 'Low';
  }
  
  let supplyLevel = 'Moderate';
  if (historicalPriceData.marketFactors.inventoryLevel === 'low') {
    supplyLevel = 'Low';
  } else if (historicalPriceData.marketFactors.inventoryLevel === 'high') {
    supplyLevel = 'High';
  }
  
  // Forecast slightly adjusted from current trend
  const forecast = currentTrend * (0.9 + (Math.random() * 0.2));
  
  return {
    neighborhood,
    currentTrend,
    forecast,
    demandLevel,
    supplyLevel,
    priceHistory,
  };
};

/**
 * Generates a comprehensive property analysis
 */
export const generatePropertyAnalysis = (property: Property): PropertyAnalysis => {
  const pricePrediction = predictPropertyPrice(property);
  const investmentAnalysis = analyzeInvestment(property, pricePrediction);
  const marketTrend = analyzeMarketTrend(property);
  
  // Mock similar properties (in a real app, this would use a recommendation algorithm)
  const similarProperties = ['prop123', 'prop456', 'prop789', 'prop101'];
  
  return {
    propertyId: property.id,
    pricePrediction,
    investmentAnalysis,
    marketTrend,
    similarProperties,
    lastUpdated: new Date(),
  };
};

/**
 * Identifies properties with high investment potential
 */
export const findInvestmentOpportunities = (properties: Property[], count: number = 5): Property[] => {
  // Analyze all properties
  const analyzedProperties = properties.map(property => {
    const analysis = generatePropertyAnalysis(property);
    return {
      property,
      analysis,
      score: analysis.investmentAnalysis.roi5Year * 
             (analysis.investmentAnalysis.potential === InvestmentPotential.Excellent ? 1.5 : 
              analysis.investmentAnalysis.potential === InvestmentPotential.VeryGood ? 1.3 : 
              analysis.investmentAnalysis.potential === InvestmentPotential.Good ? 1.1 : 
              analysis.investmentAnalysis.potential === InvestmentPotential.Fair ? 0.9 : 0.7)
    };
  });
  
  // Sort by investment score
  analyzedProperties.sort((a, b) => b.score - a.score);
  
  // Return top properties
  return analyzedProperties.slice(0, count).map(item => item.property);
};

/**
 * Identifies trending neighborhoods
 */
export const findTrendingNeighborhoods = (count: number = 5): { name: string, growth: number }[] => {
  const neighborhoods = Object.entries(historicalPriceData.neighborhoodTrends)
    .map(([name, growth]) => ({ name, growth }))
    .sort((a, b) => b.growth - a.growth);
  
  return neighborhoods.slice(0, count);
};