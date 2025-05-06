import { MarketPredictions, MarketTrend, RegionalAnalysis, PropertyTypeAnalysis, MarketReport } from '@/types/market-analysis';
import { Property } from '@/types/property';
import { mockProperties } from '@/mocks/properties';

/**
 * Generates market predictions based on historical data and current trends
 */
export const generateMarketPredictions = (): MarketPredictions => {
  // In a real app, this would use actual data and AI models
  // For now, we'll return mock predictions
  
  return {
    marketSummary: "The real estate market is showing steady growth with increasing demand in urban areas. Prices are expected to continue rising moderately over the next year, though at a slower pace than the previous two years. Interest rates remain a key factor to watch, with potential increases that could impact affordability.",
    
    forecast3Month: 101.5,
    forecast6Month: 103.2,
    forecast1Year: 105.8,
    forecast2Year: 110.3,
    forecast5Year: 122.7,
    
    priceGrowthRange: "+4.2% to +5.8%",
    interestRateOutlook: "Expected to remain stable with potential slight increases",
    inventoryOutlook: "Gradual increase expected in most markets",
    buyerDemandOutlook: "Strong, especially in urban and suburban areas",
    
    riskFactors: "Interest rate changes could impact market stability",
    timeframeInsight: "Prices expected to increase by 5-7% over the next year",
    
    propertyTypeInsights: [
      "Single-family homes showing strongest appreciation at 5.5%",
      "Condos gaining popularity in urban centers with 4.5% growth",
      "Luxury properties experiencing slower growth at 3.9%"
    ],
    
    investmentRecommendations: {
      buyers: [
        "Consider emerging neighborhoods with strong growth potential",
        "Lock in mortgage rates now if planning to buy within 6 months",
        "Focus on properties with renovation potential for added value"
      ],
      sellers: [
        "Market conditions remain favorable but consider listing soon",
        "Focus on curb appeal and minor renovations for maximum return",
        "Price competitively as buyers become more selective"
      ],
      investors: [
        "Focus on neighborhoods with strong rental demand",
        "Consider multi-family properties for diversified income",
        "Look for properties near planned infrastructure improvements"
      ]
    },
    
    confidenceLevel: 'high',
    lastUpdated: new Date()
  };
};

/**
 * Analyzes market trends based on historical data
 */
export const analyzeMarketTrends = (period: string = '1Y'): MarketTrend => {
  // Mock data for different time periods
  const trends: Record<string, MarketTrend> = {
    '3M': {
      period: '3M',
      priceGrowth: 1.2,
      priceIndex: [100, 100.4, 100.8, 101.2],
      priceLabels: ['3M ago', '2M ago', '1M ago', 'Now'],
      inventoryLevel: 'low',
      demandLevel: 'high',
      buyerMarket: false,
      marketCondition: 'hot',
      affordabilityIndex: 0.85,
      medianIncomeRatio: 5.2
    },
    '6M': {
      period: '6M',
      priceGrowth: 2.5,
      priceIndex: [100, 100.5, 101.0, 101.5, 102.0, 102.5],
      priceLabels: ['6M ago', '5M ago', '4M ago', '3M ago', '2M ago', '1M ago'],
      inventoryLevel: 'low',
      demandLevel: 'high',
      buyerMarket: false,
      marketCondition: 'hot',
      affordabilityIndex: 0.83,
      medianIncomeRatio: 5.3
    },
    '1Y': {
      period: '1Y',
      priceGrowth: 4.7,
      priceIndex: [100, 101, 102, 103, 104, 104.7],
      priceLabels: ['1Y ago', '10M ago', '8M ago', '6M ago', '3M ago', 'Now'],
      inventoryLevel: 'moderate',
      demandLevel: 'high',
      buyerMarket: false,
      marketCondition: 'warm',
      affordabilityIndex: 0.80,
      medianIncomeRatio: 5.5
    },
    '5Y': {
      period: '5Y',
      priceGrowth: 28.3,
      priceIndex: [100, 105, 112, 118, 124, 128.3],
      priceLabels: ['5Y ago', '4Y ago', '3Y ago', '2Y ago', '1Y ago', 'Now'],
      inventoryLevel: 'moderate',
      demandLevel: 'moderate',
      buyerMarket: true,
      marketCondition: 'neutral',
      affordabilityIndex: 0.75,
      medianIncomeRatio: 6.1
    }
  };
  
  return trends[period] || trends['1Y'];
};

/**
 * Analyzes regional market performance
 */
export const analyzeRegionalMarkets = (): RegionalAnalysis[] => {
  // In a real app, this would analyze actual regional data
  // For now, we'll return mock regional analyses
  
  return [
    {
      region: 'Downtown',
      priceGrowth: 5.2,
      medianPrice: 425000,
      inventory: 120,
      daysOnMarket: 28,
      salesVolume: 450,
      yearOverYearChange: 3.8,
      forecast: 4.5,
      hotspots: ['Central District', 'Waterfront', 'Arts District']
    },
    {
      region: 'Suburban North',
      priceGrowth: 6.1,
      medianPrice: 385000,
      inventory: 210,
      daysOnMarket: 24,
      salesVolume: 620,
      yearOverYearChange: 7.2,
      forecast: 5.8,
      hotspots: ['Lakeside', 'Greenwood', 'Maple Heights']
    },
    {
      region: 'Eastside',
      priceGrowth: 4.8,
      medianPrice: 405000,
      inventory: 180,
      daysOnMarket: 30,
      salesVolume: 520,
      yearOverYearChange: 4.1,
      forecast: 4.2,
      hotspots: ['Tech Corridor', 'University District', 'Hillcrest']
    },
    {
      region: 'Westside',
      priceGrowth: 3.9,
      medianPrice: 365000,
      inventory: 230,
      daysOnMarket: 35,
      salesVolume: 480,
      yearOverYearChange: 2.8,
      forecast: 3.5,
      hotspots: ['Coastal Heights', 'Sunset District', 'Marina']
    },
    {
      region: 'Southside',
      priceGrowth: 5.5,
      medianPrice: 345000,
      inventory: 190,
      daysOnMarket: 32,
      salesVolume: 510,
      yearOverYearChange: 5.2,
      forecast: 5.0,
      hotspots: ['Garden District', 'Riverside', 'Historic Quarter']
    }
  ];
};

/**
 * Analyzes performance by property type
 */
export const analyzePropertyTypes = (): PropertyTypeAnalysis[] => {
  // In a real app, this would analyze actual property type data
  // For now, we'll return mock analyses
  
  return [
    {
      type: 'Single-Family Home',
      priceGrowth: 5.2,
      medianPrice: 425000,
      inventory: 450,
      daysOnMarket: 28,
      popularity: 'increasing',
      forecast: 4.8
    },
    {
      type: 'Condominium',
      priceGrowth: 4.5,
      medianPrice: 325000,
      inventory: 380,
      daysOnMarket: 32,
      popularity: 'increasing',
      forecast: 4.2
    },
    {
      type: 'Townhouse',
      priceGrowth: 4.8,
      medianPrice: 375000,
      inventory: 220,
      daysOnMarket: 30,
      popularity: 'stable',
      forecast: 4.5
    },
    {
      type: 'Multi-Family',
      priceGrowth: 3.9,
      medianPrice: 650000,
      inventory: 120,
      daysOnMarket: 45,
      popularity: 'stable',
      forecast: 3.5
    },
    {
      type: 'Luxury',
      priceGrowth: 2.8,
      medianPrice: 950000,
      inventory: 85,
      daysOnMarket: 60,
      popularity: 'decreasing',
      forecast: 2.5
    }
  ];
};

/**
 * Generates a comprehensive market report
 */
export const generateMarketReport = (): MarketReport => {
  const predictions = generateMarketPredictions();
  const trends = analyzeMarketTrends('1Y');
  const regions = analyzeRegionalMarkets();
  const propertyTypes = analyzePropertyTypes();
  
  return {
    summary: "The real estate market continues to show resilience with moderate price growth across most segments. Urban and suburban areas are experiencing strong demand, while inventory levels remain relatively low. Interest rates are a key factor to watch in the coming months, as they could impact affordability and market dynamics.",
    marketTrends: trends,
    regionalAnalysis: regions,
    propertyTypeAnalysis: propertyTypes,
    predictions: predictions,
    investmentOpportunities: {
      neighborhoods: ['Downtown', 'Suburban North', 'Eastside'],
      propertyTypes: ['Single-Family Home', 'Condominium', 'Townhouse'],
      strategies: [
        'Focus on properties in emerging neighborhoods',
        'Consider properties with renovation potential',
        'Look for multi-family properties in high-rental areas'
      ]
    },
    riskFactors: [
      'Potential interest rate increases',
      'Economic uncertainty',
      'Regulatory changes affecting lending',
      'Rising construction costs'
    ],
    generatedDate: new Date()
  };
};

/**
 * Identifies properties with high investment potential based on market analysis
 */
export const identifyInvestmentOpportunities = (properties: Property[], count: number = 5): Property[] => {
  // In a real app, this would use AI to analyze properties against market trends
  // For now, we'll use a simple algorithm
  
  // Get regional market performance
  const regions = analyzeRegionalMarkets();
  const regionGrowthMap = new Map<string, number>();
  regions.forEach(region => {
    regionGrowthMap.set(region.region, region.forecast);
  });
  
  // Get property type performance
  const propertyTypes = analyzePropertyTypes();
  const typeGrowthMap = new Map<string, number>();
  propertyTypes.forEach(type => {
    typeGrowthMap.set(type.type.toLowerCase(), type.forecast);
  });
  
  // Score properties based on location and type
  const scoredProperties = properties.map(property => {
    let score = 0;
    
    // Score based on location
    if (typeof property.location === 'object' && property.location.city) {
      const regionMatch = regions.find(r => 
        r.region.toLowerCase().includes(property.location.city?.toLowerCase() || '')
      );
      if (regionMatch) {
        score += regionMatch.forecast * 10;
      }
    }
    
    // Score based on property type
    const typeMatch = propertyTypes.find(t => 
      t.type.toLowerCase().includes(property.type.toLowerCase())
    );
    if (typeMatch) {
      score += typeMatch.forecast * 8;
    }
    
    // Bonus for properties with good price-to-area ratio
    if (property.area && property.price) {
      const pricePerSqFt = property.price / property.area;
      if (pricePerSqFt < 200) score += 15;
      else if (pricePerSqFt < 300) score += 10;
      else if (pricePerSqFt < 400) score += 5;
    }
    
    // Bonus for newer properties
    if (property.details?.yearBuilt) {
      const age = new Date().getFullYear() - property.details.yearBuilt;
      if (age < 5) score += 15;
      else if (age < 10) score += 10;
      else if (age < 20) score += 5;
    }
    
    return { property, score };
  });
  
  // Sort by score and return top properties
  scoredProperties.sort((a, b) => b.score - a.score);
  return scoredProperties.slice(0, count).map(item => item.property);
};

/**
 * Predicts future property value based on market trends
 */
export const predictPropertyValue = (
  property: Property, 
  yearsInFuture: number = 5
): { 
  currentValue: number, 
  futureValue: number, 
  growthRate: number, 
  confidence: 'low' | 'medium' | 'high' 
} => {
  // In a real app, this would use AI models and actual market data
  // For now, we'll use a simple algorithm
  
  const currentValue = property.price;
  let annualGrowthRate = 0.04; // Default 4% annual growth
  
  // Adjust growth rate based on property type
  if (property.type === 'house') annualGrowthRate += 0.01;
  else if (property.type === 'condo') annualGrowthRate += 0.005;
  else if (property.type === 'land') annualGrowthRate -= 0.01;
  
  // Adjust growth rate based on location
  if (typeof property.location === 'object' && property.location.city) {
    const city = property.location.city.toLowerCase();
    if (city.includes('downtown') || city.includes('central')) annualGrowthRate += 0.01;
    else if (city.includes('suburban') || city.includes('north')) annualGrowthRate += 0.005;
  }
  
  // Adjust growth rate based on property age
  if (property.details?.yearBuilt) {
    const age = new Date().getFullYear() - property.details.yearBuilt;
    if (age < 5) annualGrowthRate += 0.01;
    else if (age > 30) annualGrowthRate -= 0.005;
  }
  
  // Calculate future value using compound growth
  const futureValue = currentValue * Math.pow(1 + annualGrowthRate, yearsInFuture);
  
  // Determine confidence level
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (yearsInFuture <= 2) confidence = 'high';
  else if (yearsInFuture > 7) confidence = 'low';
  
  return {
    currentValue,
    futureValue,
    growthRate: annualGrowthRate * 100, // Convert to percentage
    confidence
  };
};