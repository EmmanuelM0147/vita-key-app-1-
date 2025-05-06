// Mock payment processing service
// In a real app, this would integrate with a payment gateway like Stripe

export interface PaymentMethod {
  type: 'card';
  card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const processPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Basic validation
  if (!request.amount || request.amount <= 0) {
    return {
      success: false,
      error: 'Invalid amount'
    };
  }
  
  if (!request.paymentMethod || request.paymentMethod.type !== 'card') {
    return {
      success: false,
      error: 'Invalid payment method'
    };
  }
  
  const { card } = request.paymentMethod;
  
  // Validate card number (simple check for demo)
  if (!card.number || card.number.replace(/\s/g, '').length !== 16) {
    return {
      success: false,
      error: 'Invalid card number'
    };
  }
  
  // Validate expiry date
  const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  if (!card.expMonth || card.expMonth < 1 || card.expMonth > 12) {
    return {
      success: false,
      error: 'Invalid expiration month'
    };
  }
  
  if (!card.expYear || card.expYear < currentYear || 
      (card.expYear === currentYear && card.expMonth < currentMonth)) {
    return {
      success: false,
      error: 'Card has expired'
    };
  }
  
  // Validate CVC
  if (!card.cvc || card.cvc.length < 3 || card.cvc.length > 4) {
    return {
      success: false,
      error: 'Invalid CVC'
    };
  }
  
  // For demo purposes, we'll always return success
  // In a real app, this would call a payment gateway API
  return {
    success: true,
    transactionId: `tx_${Math.random().toString(36).substring(2, 15)}`
  };
};