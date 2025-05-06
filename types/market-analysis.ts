export interface MarketPredictions {
  // Market overview
  marketSummary: string;
  
  // Price forecasts
  forecast3Month: number;
  forecast6Month: number;
  forecast1Year: number;
  forecast2Year: number;
  forecast5Year: number;
  
  // Outlook data
  priceGrowthRange: string;
  interestRateOutlook: string;
  inventoryOutlook: string;
  buyerDemandOutlook: string;
  
  // Risk factors
  riskFactors: string;
  timeframeInsight: string;
  
  // Property type insights
  propertyTypeInsights: string[];
  
  // Investment recommendations
  investmentRecommendations: {
    buyers: string[];
    sellers: string[];
    investors: string[];
  };
  
  // Confidence level
  confidenceLevel: 'low' | 'medium' | 'high';
  
  // Last updated
  lastUpdated: Date;
}

export interface MarketTrend {
  // Time period
  period: string; // e.g., '1Y', '5Y', '10Y'
  
  // Price trends
  priceGrowth: number;
  priceIndex: number[];
  priceLabels: string[];
  
  // Supply and demand
  inventoryLevel: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  demandLevel: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  
  // Market conditions
  buyerMarket: boolean;
  marketCondition: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold';
  
  // Affordability
  affordabilityIndex: number;
  medianIncomeRatio: number;
}

export interface RegionalAnalysis {
  region: string;
  priceGrowth: number;
  medianPrice: number;
  inventory: number;
  daysOnMarket: number;
  salesVolume: number;
  yearOverYearChange: number;
  forecast: number;
  hotspots: string[];
}

export interface PropertyTypeAnalysis {
  type: string;
  priceGrowth: number;
  medianPrice: number;
  inventory: number;
  daysOnMarket: number;
  popularity: 'increasing' | 'stable' | 'decreasing';
  forecast: number;
}

export interface MarketReport {
  summary: string;
  marketTrends: MarketTrend;
  regionalAnalysis: RegionalAnalysis[];
  propertyTypeAnalysis: PropertyTypeAnalysis[];
  predictions: MarketPredictions;
  investmentOpportunities: {
    neighborhoods: string[];
    propertyTypes: string[];
    strategies: string[];
  };
  riskFactors: string[];
  generatedDate: Date;
}