import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionFilters, TransactionRiskLevel, TransactionVerification, FraudDetectionResult } from '@/types/transaction';
import { PaymentGatewayResponse, TransactionStatus } from '@/services/payment-gateway';
import { mockApi } from '@/services/api';
import { aiSecurityService } from '@/services/ai-security';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  verifications: TransactionVerification[];
  fraudDetectionResults: FraudDetectionResult[];
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByUserId: (userId: string) => Transaction[];
  getTransactionsByPropertyId: (propertyId: string) => Transaction[];
  filterTransactions: (filters: TransactionFilters) => Transaction[];
  fetchTransactions: (userId: string) => Promise<void>;
  clearTransactions: () => void;
  createTransactionFromPayment: (
    paymentResponse: PaymentGatewayResponse, 
    userId: string, 
    propertyId?: string,
    propertyTitle?: string
  ) => Promise<Transaction>;
  
  // Security-related actions
  analyzeTransactionRisk: (transactionId: string) => Promise<void>;
  verifyTransaction: (transactionId: string, method: 'document' | 'facial' | 'two_factor' | 'manual') => Promise<boolean>;
  flagTransactionAsFraudulent: (transactionId: string, notes: string) => Promise<void>;
  getTransactionVerifications: (transactionId: string) => TransactionVerification[];
  getFraudDetectionResult: (transactionId: string) => FraudDetectionResult | undefined;
  getHighRiskTransactions: () => Transaction[];
}

const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      verifications: [],
      fraudDetectionResults: [],
      
      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },
      
      updateTransactionStatus: (id: string, status: TransactionStatus) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status }
              : transaction
          ),
        }));
      },
      
      getTransactionById: (id: string) => {
        return get().transactions.find((transaction) => transaction.id === id);
      },
      
      getTransactionsByUserId: (userId: string) => {
        return get().transactions.filter((transaction) => transaction.userId === userId);
      },
      
      getTransactionsByPropertyId: (propertyId: string) => {
        return get().transactions.filter((transaction) => transaction.propertyId === propertyId);
      },
      
      filterTransactions: (filters: TransactionFilters) => {
        const { type, status, startDate, endDate, minAmount, maxAmount, riskLevel } = filters;
        
        return get().transactions.filter((transaction) => {
          // Filter by type
          if (type && transaction.type !== type) {
            return false;
          }
          
          // Filter by status
          if (status && transaction.status !== status) {
            return false;
          }
          
          // Filter by date range
          if (startDate && new Date(transaction.date) < new Date(startDate)) {
            return false;
          }
          
          if (endDate && new Date(transaction.date) > new Date(endDate)) {
            return false;
          }
          
          // Filter by amount range
          if (minAmount !== undefined && transaction.amount < minAmount) {
            return false;
          }
          
          if (maxAmount !== undefined && transaction.amount > maxAmount) {
            return false;
          }
          
          // Filter by risk level
          if (riskLevel && transaction.riskLevel !== riskLevel) {
            return false;
          }
          
          return true;
        });
      },
      
      fetchTransactions: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, you would fetch transactions from your API
          // For this demo, we'll use mock data
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Mock API call to get transactions
          const transactions = await mockApi.transactions.getByUserId(userId);
          
          set({ transactions, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch transactions',
            isLoading: false,
          });
        }
      },
      
      clearTransactions: () => {
        set({ transactions: [] });
      },
      
      createTransactionFromPayment: async (
        paymentResponse: PaymentGatewayResponse, 
        userId: string, 
        propertyId?: string,
        propertyTitle?: string
      ): Promise<Transaction> => {
        // Create transaction object
        const transaction: Transaction = {
          id: paymentResponse.transactionId || `tx_${Date.now()}`,
          userId,
          propertyId,
          propertyTitle,
          amount: paymentResponse.amount || 0,
          currency: paymentResponse.currency || 'USD',
          type: paymentResponse.metadata?.transactionType || 'FULL_PAYMENT',
          status: paymentResponse.status || 'COMPLETED',
          provider: paymentResponse.provider || 'PAYSTACK',
          method: paymentResponse.method || 'CARD',
          reference: paymentResponse.reference || `ref_${Date.now()}`,
          description: paymentResponse.metadata?.description || 'Property payment',
          date: paymentResponse.date || new Date().toISOString(),
          receiptUrl: paymentResponse.receiptUrl,
          metadata: paymentResponse.metadata,
        };
        
        // Add transaction to store
        get().addTransaction(transaction);
        
        // Analyze transaction risk
        await get().analyzeTransactionRisk(transaction.id);
        
        return transaction;
      },
      
      // Security-related actions
      analyzeTransactionRisk: async (transactionId: string) => {
        const transaction = get().getTransactionById(transactionId);
        if (!transaction) return;
        
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        let property;
        if (transaction.propertyId) {
          property = usePropertiesStore.getState().getPropertyById(transaction.propertyId);
        }
        
        try {
          // Analyze transaction risk using AI
          const riskAnalysis = await aiSecurityService.analyzeTransaction(transaction, user, property);
          
          // Update transaction with risk information
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === transactionId
                ? { 
                    ...t, 
                    riskLevel: riskAnalysis.riskLevel,
                    riskScore: riskAnalysis.riskScore,
                    riskFactors: riskAnalysis.riskFactors
                  }
                : t
            ),
            fraudDetectionResults: [
              ...state.fraudDetectionResults,
              {
                transactionId,
                riskLevel: riskAnalysis.riskLevel,
                riskScore: riskAnalysis.riskScore,
                riskFactors: riskAnalysis.riskFactors,
                detectedAt: new Date().toISOString(),
                actionTaken: riskAnalysis.recommendedAction === 'block' ? 'blocked' : 
                             riskAnalysis.recommendedAction === 'review' ? 'flagged' : 'none',
              }
            ]
          }));
          
          // Create security alert for high-risk transactions
          if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
            aiSecurityService.createSecurityAlert(
              user.id,
              'fraud_detected',
              {
                transactionId,
                transactionType: transaction.type,
                transactionAmount: transaction.amount,
                riskLevel: riskAnalysis.riskLevel,
                riskFactors: riskAnalysis.riskFactors,
              }
            );
          }
        } catch (error) {
          console.error('Error analyzing transaction risk:', error);
        }
      },
      
      verifyTransaction: async (transactionId: string, method: 'document' | 'facial' | 'two_factor' | 'manual') => {
        const transaction = get().getTransactionById(transactionId);
        if (!transaction) return false;
        
        try {
          // In a real app, this would call a verification service
          // For demo purposes, we'll simulate verification
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const verification: TransactionVerification = {
            transactionId,
            verificationId: `ver_${Date.now()}`,
            method,
            status: 'verified',
            timestamp: new Date().toISOString(),
          };
          
          // Update transaction and add verification record
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === transactionId
                ? { 
                    ...t, 
                    securityVerified: true,
                    verificationMethod: method,
                    verifiedAt: verification.timestamp
                  }
                : t
            ),
            verifications: [...state.verifications, verification]
          }));
          
          return true;
        } catch (error) {
          console.error('Error verifying transaction:', error);
          return false;
        }
      },
      
      flagTransactionAsFraudulent: async (transactionId: string, notes: string) => {
        const transaction = get().getTransactionById(transactionId);
        if (!transaction) return;
        
        try {
          // Update transaction status
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === transactionId
                ? { 
                    ...t, 
                    status: TransactionStatus.CANCELLED,
                    riskLevel: 'critical',
                    metadata: {
                      ...t.metadata,
                      fraudNotes: notes,
                      flaggedAt: new Date().toISOString(),
                    }
                  }
                : t
            ),
            fraudDetectionResults: state.fraudDetectionResults.map((result) =>
              result.transactionId === transactionId
                ? {
                    ...result,
                    actionTaken: 'blocked',
                    reviewNotes: notes
                  }
                : result
            )
          }));
          
          // In a real app, you would also notify relevant parties
          // and potentially initiate a chargeback
        } catch (error) {
          console.error('Error flagging transaction as fraudulent:', error);
        }
      },
      
      getTransactionVerifications: (transactionId: string) => {
        return get().verifications.filter(v => v.transactionId === transactionId);
      },
      
      getFraudDetectionResult: (transactionId: string) => {
        return get().fraudDetectionResults.find(r => r.transactionId === transactionId);
      },
      
      getHighRiskTransactions: () => {
        return get().transactions.filter(t => 
          t.riskLevel === 'high' || t.riskLevel === 'critical'
        );
      },
    }),
    {
      name: 'transactions-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        verifications: state.verifications,
        fraudDetectionResults: state.fraudDetectionResults,
      }),
    }
  )
);

export default useTransactionsStore;