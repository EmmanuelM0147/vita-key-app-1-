// Payment gateway service for handling transactions

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  WALLET = 'WALLET',
}

export enum TransactionType {
  FULL_PAYMENT = 'FULL_PAYMENT',
  RENTAL_DEPOSIT = 'RENTAL_DEPOSIT',
  BOOKING_FEE = 'BOOKING_FEE',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
  FLAGGED = 'FLAGGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
}

export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  description: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  transactionType: TransactionType;
  propertyId?: string;
  metadata?: Record<string, any>;
  
  // Security-related fields
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  securityToken?: string;
  verificationMethod?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  status?: TransactionStatus;
  message?: string;
  error?: string;
  receiptUrl?: string;
  amount?: number;
  currency?: string;
  date?: string;
  provider?: PaymentProvider;
  method?: PaymentMethod;
  metadata?: Record<string, any>;
  
  // Security-related fields
  securityChecks?: {
    passed: boolean;
    verificationRequired?: boolean;
    riskLevel?: string;
    fraudDetected?: boolean;
  };
}

// Mock function to simulate payment processing
export const processPaymentWithGateway = async (
  request: PaymentGatewayRequest,
  cardDetails?: CardDetails
): Promise<PaymentGatewayResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate security checks
  const securityChecks = await performSecurityChecks(request, cardDetails);
  
  // If security checks failed, return error
  if (!securityChecks.passed && securityChecks.fraudDetected) {
    return {
      success: false,
      status: TransactionStatus.FLAGGED,
      error: 'Transaction flagged for security reasons. Please contact support.',
      securityChecks,
    };
  }
  
  // If verification required, return pending status
  if (!securityChecks.passed && securityChecks.verificationRequired) {
    return {
      success: false,
      status: TransactionStatus.PENDING,
      error: 'Additional verification required to complete this transaction.',
      securityChecks,
    };
  }
  
  // Simulate success (90% of the time)
  const isSuccess = Math.random() < 0.9;
  
  if (isSuccess) {
    const transactionId = `tx_${Date.now()}`;
    return {
      success: true,
      transactionId,
      reference: `ref_${Date.now()}`,
      status: TransactionStatus.COMPLETED,
      message: 'Payment processed successfully',
      receiptUrl: `https://receipts.example.com/${transactionId}`,
      amount: request.amount,
      currency: request.currency,
      date: new Date().toISOString(),
      provider: request.provider,
      method: request.method,
      metadata: request.metadata,
      securityChecks,
    };
  } else {
    // Simulate various error scenarios
    const errorMessages = [
      'Card declined by issuer',
      'Insufficient funds',
      'Payment gateway timeout',
      'Invalid card details',
    ];
    
    return {
      success: false,
      status: TransactionStatus.FAILED,
      error: errorMessages[Math.floor(Math.random() * errorMessages.length)],
      securityChecks,
    };
  }
};

// Mock function to verify transaction status
export const verifyTransaction = async (
  transactionId: string,
  provider: PaymentProvider
): Promise<{
  verified: boolean;
  status: TransactionStatus;
  message?: string;
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, we'll always return verified
  return {
    verified: true,
    status: TransactionStatus.COMPLETED,
    message: 'Transaction verified successfully',
  };
};

// Mock function to perform security checks
const performSecurityChecks = async (
  request: PaymentGatewayRequest,
  cardDetails?: CardDetails
): Promise<{
  passed: boolean;
  verificationRequired?: boolean;
  riskLevel?: string;
  fraudDetected?: boolean;
  riskFactors?: string[];
}> => {
  // Simulate security checks
  
  // 1. Check for high-risk amount
  const isHighAmount = request.amount > 50000;
  
  // 2. Check for suspicious payment method for amount
  const isSuspiciousMethod = isHighAmount && request.method !== PaymentMethod.BANK_TRANSFER;
  
  // 3. Check for unusual location
  const isUnusualLocation = request.location?.country === 'Unknown';
  
  // 4. Check for known fraudulent patterns in card details
  const isSuspiciousCard = cardDetails?.number?.startsWith('1234');
  
  // Collect risk factors
  const riskFactors: string[] = [];
  
  if (isHighAmount) {
    riskFactors.push('High transaction amount');
  }
  
  if (isSuspiciousMethod) {
    riskFactors.push('Unusual payment method for amount');
  }
  
  if (isUnusualLocation) {
    riskFactors.push('Transaction from unusual location');
  }
  
  if (isSuspiciousCard) {
    riskFactors.push('Card details match known fraud pattern');
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (riskFactors.length === 1) {
    riskLevel = 'medium';
  } else if (riskFactors.length === 2) {
    riskLevel = 'high';
  } else if (riskFactors.length > 2) {
    riskLevel = 'critical';
  }
  
  // Determine if verification is required
  const verificationRequired = riskLevel === 'high' || riskLevel === 'critical';
  
  // Determine if fraud is detected
  const fraudDetected = riskLevel === 'critical' && isSuspiciousCard;
  
  // Return security check results
  return {
    passed: riskLevel === 'low' || riskLevel === 'medium',
    verificationRequired,
    riskLevel,
    fraudDetected,
    riskFactors: riskFactors.length > 0 ? riskFactors : undefined,
  };
};