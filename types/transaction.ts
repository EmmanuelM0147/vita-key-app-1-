import { PaymentProvider, PaymentMethod, TransactionStatus, TransactionType } from '@/services/payment-gateway';

export type TransactionRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Transaction {
  id: string;
  userId: string;
  propertyId?: string;
  propertyTitle?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  provider: PaymentProvider;
  method: PaymentMethod;
  reference: string;
  description: string;
  date: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
  
  // Security-related fields
  riskLevel?: TransactionRiskLevel;
  riskScore?: number;
  riskFactors?: string[];
  securityVerified?: boolean;
  verificationMethod?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  riskLevel?: TransactionRiskLevel;
}

export interface TransactionVerification {
  transactionId: string;
  verificationId: string;
  method: 'document' | 'facial' | 'two_factor' | 'manual';
  status: 'pending' | 'verified' | 'rejected';
  timestamp: string;
  verifierName?: string;
  verifierRole?: string;
  notes?: string;
}

export interface FraudDetectionResult {
  transactionId: string;
  riskLevel: TransactionRiskLevel;
  riskScore: number;
  riskFactors: string[];
  detectedAt: string;
  actionTaken: 'none' | 'flagged' | 'blocked' | 'reversed';
  reviewedBy?: string;
  reviewNotes?: string;
}