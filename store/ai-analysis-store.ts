import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '@/types/property';
import { findInvestmentOpportunities, findTrendingNeighborhoods } from '@/services/ai-prediction';
import { generateMarketPredictions } from '@/services/market-analysis';
import { MarketPredictions } from '@/types/market-analysis';
import { mockProperties } from '@/mocks/properties';

interface TrendingNeighborhood {
  name: string;
  growth: number;
  medianPrice?: number;
  daysOnMarket?: number;
  inventory?: string;
  insights?: string[];
}

interface AIAnalysisState {
  investmentOpportunities: Property[];
  trendingNeighborhoods: TrendingNeighborhood[];
  marketPredictions: MarketPredictions | null;
  isLoading: boolean;
  refreshInvestmentOpportunities: () => Promise<void>;
  refreshTrendingNeighborhoods: () => Promise<void>;
  refreshMarketPredictions: () => Promise<void>;
}

export const useAIAnalysisStore = create<AIAnalysisState>()(
  persist(
    (set, get) => ({
      investmentOpportunities: [],
      trendingNeighborhoods: [],
      marketPredictions: null,
      isLoading: false,
      
      refreshInvestmentOpportunities: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would fetch from an API
          // For now, we'll use our mock data and AI prediction service
          const opportunities = findInvestmentOpportunities(mockProperties, 8);
          set({ investmentOpportunities: opportunities });
        } catch (error) {
          console.error('Error refreshing investment opportunities:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      refreshTrendingNeighborhoods: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would fetch from an API
          const neighborhoods = findTrendingNeighborhoods(10);
          
          // Add additional mock data for the detailed view
          const enhancedNeighborhoods = neighborhoods.map(n => ({
            ...n,
            medianPrice: 300000 + Math.random() * 500000,
            daysOnMarket: Math.floor(20 + Math.random() * 30),
            inventory: Math.random() > 0.5 ? 'Low' : 'Moderate',
            insights: [
              `${n.name} is ${n.growth > 5 ? 'outperforming' : 'performing close to'} the market average.`,
              `Buyer demand is ${n.growth > 4 ? 'strong' : 'moderate'} with ${n.growth > 5 ? 'limited' : 'adequate'} inventory.`
            ]
          }));
          
          set({ trendingNeighborhoods: enhancedNeighborhoods });
        } catch (error) {
          console.error('Error refreshing trending neighborhoods:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      refreshMarketPredictions: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would fetch from an API
          const predictions = generateMarketPredictions();
          set({ marketPredictions: predictions });
        } catch (error) {
          console.error('Error refreshing market predictions:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ai-analysis-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);