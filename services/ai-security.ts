import { Transaction, TransactionRiskLevel } from '@/types/transaction';
import { User } from '@/types/user';
import { Property } from '@/types/property';
import { aiService } from './ai-service';
import { NotificationType } from '@/types/notification';
import useNotificationsStore from '@/store/notifications-store';

// AI-powered security service for fraud detection and transaction security
export const aiSecurityService = {
  // Analyze a transaction for potential fraud
  analyzeTransaction: async (
    transaction: Transaction,
    user: User,
    property?: Property
  ): Promise<{
    riskLevel: TransactionRiskLevel;
    riskScore: number;
    riskFactors: string[];
    isLikelyFraud: boolean;
    recommendedAction: 'proceed' | 'review' | 'block';
  }> => {
    try {
      // In a production app, this would call a dedicated fraud detection API
      // For demo purposes, we'll use our AI service
      
      const messages = [
        {
          role: "system",
          content: `You are an AI fraud detection system for real estate transactions. 
          Analyze the transaction details and user behavior to determine the risk level.
          Return a JSON object with riskLevel, riskScore, riskFactors, isLikelyFraud, and recommendedAction.`
        },
        {
          role: "user",
          content: `
          Transaction Details:
          ${JSON.stringify({
            id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            type: transaction.type,
            method: transaction.method,
            provider: transaction.provider,
            date: transaction.date,
            propertyId: transaction.propertyId,
          })}
          
          User Details:
          ${JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            accountCreatedAt: user.createdAt,
            verificationLevel: user.verificationLevel,
            transactionHistory: user.transactionHistory || [],
          })}
          
          ${property ? `Property Details:
          ${JSON.stringify({
            id: property.id,
            price: property.price,
            type: property.type,
            location: property.location,
            listedBy: property.listedBy,
            listedAt: property.listedAt,
          })}` : ''}
          
          Analyze this transaction for potential fraud and return a JSON object with the following structure:
          {
            "riskLevel": "low" | "medium" | "high" | "critical",
            "riskScore": 0-100,
            "riskFactors": ["reason1", "reason2", ...],
            "isLikelyFraud": boolean,
            "recommendedAction": "proceed" | "review" | "block"
          }
          `
        }
      ];

      // Make the API call
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze transaction for fraud');
      }

      const data = await response.json();
      
      // Parse the AI response
      try {
        // Extract the JSON from the completion text
        const completionText = data.completion;
        const jsonMatch = completionText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysisJson = JSON.parse(jsonMatch[0]);
          return analysisJson;
        } else {
          // Fallback if AI doesn't return proper JSON
          console.error('AI did not return proper JSON format for fraud analysis');
          return generateFallbackFraudAnalysis(transaction, user, property);
        }
      } catch (parseError) {
        console.error('Error parsing AI fraud analysis response:', parseError);
        return generateFallbackFraudAnalysis(transaction, user, property);
      }
    } catch (error) {
      console.error('Error in AI fraud analysis:', error);
      return generateFallbackFraudAnalysis(transaction, user, property);
    }
  },
  
  // Verify user identity using AI
  verifyUserIdentity: async (
    user: User,
    documentImage?: string,
    selfieImage?: string
  ): Promise<{
    verified: boolean;
    confidenceScore: number;
    verificationMethod: string;
    failureReason?: string;
  }> => {
    try {
      // In a production app, this would call a dedicated identity verification API
      // For demo purposes, we'll simulate the verification process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll always return success
      // In a real app, this would analyze the document and selfie images
      return {
        verified: true,
        confidenceScore: 0.92,
        verificationMethod: 'document_and_facial_recognition',
      };
    } catch (error) {
      console.error('Error in user identity verification:', error);
      return {
        verified: false,
        confidenceScore: 0,
        verificationMethod: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error during verification',
      };
    }
  },
  
  // Monitor user behavior for suspicious activity
  monitorUserBehavior: async (
    user: User,
    recentActions: Array<{
      type: string;
      timestamp: string;
      details?: any;
    }>
  ): Promise<{
    suspiciousActivity: boolean;
    suspiciousActions: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> => {
    try {
      // In a production app, this would analyze user behavior patterns
      // For demo purposes, we'll use simple rules
      
      const suspiciousActions: string[] = [];
      
      // Check for rapid account changes
      const accountChanges = recentActions.filter(a => 
        a.type === 'update_profile' || 
        a.type === 'change_password' ||
        a.type === 'update_payment_method'
      );
      
      if (accountChanges.length > 3) {
        suspiciousActions.push('Multiple account changes in short period');
      }
      
      // Check for multiple failed payments
      const failedPayments = recentActions.filter(a => 
        a.type === 'payment_failed'
      );
      
      if (failedPayments.length > 2) {
        suspiciousActions.push('Multiple failed payment attempts');
      }
      
      // Check for unusual location access
      const uniqueLocations = new Set(
        recentActions
          .filter(a => a.details?.location)
          .map(a => a.details.location)
      );
      
      if (uniqueLocations.size > 3) {
        suspiciousActions.push('Access from multiple unusual locations');
      }
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (suspiciousActions.length === 1) {
        riskLevel = 'medium';
      } else if (suspiciousActions.length > 1) {
        riskLevel = 'high';
      }
      
      return {
        suspiciousActivity: suspiciousActions.length > 0,
        suspiciousActions,
        riskLevel,
      };
    } catch (error) {
      console.error('Error monitoring user behavior:', error);
      return {
        suspiciousActivity: false,
        suspiciousActions: [],
        riskLevel: 'low',
      };
    }
  },
  
  // Create security alert notification
  createSecurityAlert: (
    userId: string,
    alertType: 'fraud_detected' | 'suspicious_activity' | 'verification_required' | 'unusual_login',
    details: any
  ) => {
    const notificationsStore = useNotificationsStore.getState();
    
    const alertMessages = {
      fraud_detected: {
        title: 'Potential Fraud Detected',
        message: `We've detected potentially fraudulent activity related to ${details.transactionType || 'a transaction'}. Please review and contact support if needed.`,
      },
      suspicious_activity: {
        title: 'Suspicious Account Activity',
        message: 'Unusual activity has been detected on your account. Please verify recent actions.',
      },
      verification_required: {
        title: 'Verification Required',
        message: 'Additional verification is required to complete your recent transaction.',
      },
      unusual_login: {
        title: 'Unusual Login Detected',
        message: `Login detected from ${details.location || 'an unusual location'}. If this wasn't you, please secure your account.`,
      },
    };
    
    const alert = alertMessages[alertType];
    
    notificationsStore.addNotification({
      id: `security_${Date.now()}`,
      userId,
      type: 'system' as NotificationType,
      title: alert.title,
      message: alert.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        alertType,
        ...details,
      },
    });
  },
};

// Generate a fallback fraud analysis if AI fails
function generateFallbackFraudAnalysis(
  transaction: Transaction,
  user: User,
  property?: Property
) {
  // Simple rule-based fraud detection
  let riskScore = 0;
  const riskFactors: string[] = [];
  
  // Check transaction amount vs property price
  if (property && transaction.amount > property.price * 1.1) {
    riskScore += 30;
    riskFactors.push('Transaction amount significantly exceeds property price');
  }
  
  // Check for new user making large transaction
  if (user.createdAt) {
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 7 && transaction.amount > 10000) {
      riskScore += 25;
      riskFactors.push('New account making large transaction');
    }
  }
  
  // Check for unusual payment method for large amounts
  if (transaction.amount > 50000 && transaction.method !== 'BANK_TRANSFER') {
    riskScore += 15;
    riskFactors.push('Large amount using non-bank transfer method');
  }
  
  // Determine risk level based on score
  let riskLevel: TransactionRiskLevel = 'low';
  if (riskScore > 60) {
    riskLevel = 'critical';
  } else if (riskScore > 40) {
    riskLevel = 'high';
  } else if (riskScore > 20) {
    riskLevel = 'medium';
  }
  
  // Determine recommended action
  let recommendedAction: 'proceed' | 'review' | 'block' = 'proceed';
  if (riskLevel === 'critical') {
    recommendedAction = 'block';
  } else if (riskLevel === 'high') {
    recommendedAction = 'review';
  }
  
  return {
    riskLevel,
    riskScore,
    riskFactors,
    isLikelyFraud: riskLevel === 'high' || riskLevel === 'critical',
    recommendedAction,
  };
}