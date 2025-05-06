import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { CreditCard, Calendar, AlertCircle, DollarSign, Check, Shield, Camera, Fingerprint } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { 
  PaymentProvider, 
  PaymentMethod, 
  TransactionType,
  processPaymentWithGateway,
  PaymentGatewayRequest,
  PaymentGatewayResponse
} from '@/services/payment-gateway';
import { aiSecurityService } from '@/services/ai-security';
import useAuthStore from '@/store/auth-store';

interface PaymentFormProps {
  amount: number;
  currency: string;
  description: string;
  transactionType: TransactionType;
  propertyId?: string;
  propertyTitle?: string;
  onPaymentSuccess: (response: PaymentGatewayResponse) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  description,
  transactionType,
  propertyId,
  propertyTitle,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(PaymentProvider.PAYSTACK);
  const [showSecurityVerification, setShowSecurityVerification] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'document' | 'facial' | 'two_factor'>('two_factor');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};
    
    if (!paymentForm.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!paymentForm.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
      errors.expiryDate = 'Invalid format (MM/YY)';
    }
    
    if (!paymentForm.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    if (!paymentForm.name) {
      errors.name = 'Name is required';
    }
    
    if (!paymentForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(paymentForm.email)) {
      errors.email = 'Invalid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Prepare payment request
      const paymentRequest: PaymentGatewayRequest = {
        amount,
        currency,
        email: paymentForm.email,
        fullName: paymentForm.name,
        phoneNumber: paymentForm.phoneNumber,
        description,
        provider: selectedProvider,
        method: PaymentMethod.CARD,
        transactionType,
        propertyId,
        metadata: {
          transactionType,
          description,
          propertyId,
          propertyTitle,
        },
        // Add security-related fields
        deviceId: `device_${Math.random().toString(36).substring(2, 15)}`,
        ipAddress: '192.168.1.1', // Mock IP address
        userAgent: 'RealEstateApp/1.0',
        location: {
          city: 'New York',
          country: 'USA',
        },
      };
      
      // Process payment
      const paymentResult = await processPaymentWithGateway(
        paymentRequest,
        {
          number: paymentForm.cardNumber.replace(/\s/g, ''),
          expMonth: parseInt(paymentForm.expiryDate.split('/')[0]),
          expYear: parseInt(paymentForm.expiryDate.split('/')[1]),
          cvc: paymentForm.cvv,
          name: paymentForm.name,
        }
      );
      
      // Check if additional verification is required
      if (paymentResult.securityChecks?.verificationRequired) {
        setIsProcessing(false);
        setShowSecurityVerification(true);
        return;
      }
      
      if (paymentResult.success) {
        onPaymentSuccess(paymentResult);
      } else {
        onPaymentError(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerification = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    
    try {
      // Simulate verification process
      const verificationResult = await aiSecurityService.verifyUserIdentity(
        user,
        verificationMethod === 'document' ? 'document_image_url' : undefined,
        verificationMethod === 'facial' ? 'selfie_image_url' : undefined
      );
      
      if (verificationResult.verified) {
        // Retry payment with verification
        setShowSecurityVerification(false);
        setIsProcessing(true);
        
        // Prepare payment request with verification
        const paymentRequest: PaymentGatewayRequest = {
          amount,
          currency,
          email: paymentForm.email,
          fullName: paymentForm.name,
          phoneNumber: paymentForm.phoneNumber,
          description,
          provider: selectedProvider,
          method: PaymentMethod.CARD,
          transactionType,
          propertyId,
          metadata: {
            transactionType,
            description,
            propertyId,
            propertyTitle,
          },
          // Add security-related fields
          deviceId: `device_${Math.random().toString(36).substring(2, 15)}`,
          ipAddress: '192.168.1.1', // Mock IP address
          userAgent: 'RealEstateApp/1.0',
          location: {
            city: 'New York',
            country: 'USA',
          },
          securityToken: `verified_${Date.now()}`,
          verificationMethod,
        };
        
        // Process payment with verification
        const paymentResult = await processPaymentWithGateway(
          paymentRequest,
          {
            number: paymentForm.cardNumber.replace(/\s/g, ''),
            expMonth: parseInt(paymentForm.expiryDate.split('/')[0]),
            expYear: parseInt(paymentForm.expiryDate.split('/')[1]),
            cvc: paymentForm.cvv,
            name: paymentForm.name,
          }
        );
        
        if (paymentResult.success) {
          onPaymentSuccess(paymentResult);
        } else {
          onPaymentError(paymentResult.error || 'Payment failed');
        }
      } else {
        onPaymentError(`Verification failed: ${verificationResult.failureReason || 'Unknown reason'}`);
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  if (showSecurityVerification) {
    return (
      <Card variant="elevated" style={styles.paymentCard}>
        <View style={styles.securityHeader}>
          <Shield size={24} color={Colors.primary.gold} />
          <Typography variant="h4" style={styles.securityTitle}>
            Security Verification Required
          </Typography>
        </View>
        
        <Typography variant="body2" color={Colors.text.muted} style={styles.securitySubtitle}>
          For your security, we need to verify your identity before processing this payment of {currency} {amount.toLocaleString()}.
        </Typography>
        
        <View style={styles.verificationOptions}>
          <Typography variant="body2" style={styles.verificationLabel}>
            Select Verification Method:
          </Typography>
          
          <TouchableOpacity
            style={[
              styles.verificationOption,
              verificationMethod === 'document' && styles.verificationOptionSelected,
            ]}
            onPress={() => setVerificationMethod('document')}
          >
            <Camera size={24} color={verificationMethod === 'document' ? Colors.primary.gold : Colors.text.muted} />
            <View style={styles.verificationOptionText}>
              <Typography variant="body2" weight={verificationMethod === 'document' ? '600' : '400'}>
                ID Verification
              </Typography>
              <Typography variant="caption" color={Colors.text.muted}>
                Upload a photo of your ID
              </Typography>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.verificationOption,
              verificationMethod === 'facial' && styles.verificationOptionSelected,
            ]}
            onPress={() => setVerificationMethod('facial')}
          >
            <Camera size={24} color={verificationMethod === 'facial' ? Colors.primary.gold : Colors.text.muted} />
            <View style={styles.verificationOptionText}>
              <Typography variant="body2" weight={verificationMethod === 'facial' ? '600' : '400'}>
                Facial Recognition
              </Typography>
              <Typography variant="caption" color={Colors.text.muted}>
                Take a selfie for verification
              </Typography>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.verificationOption,
              verificationMethod === 'two_factor' && styles.verificationOptionSelected,
            ]}
            onPress={() => setVerificationMethod('two_factor')}
          >
            <Fingerprint size={24} color={verificationMethod === 'two_factor' ? Colors.primary.gold : Colors.text.muted} />
            <View style={styles.verificationOptionText}>
              <Typography variant="body2" weight={verificationMethod === 'two_factor' ? '600' : '400'}>
                Two-Factor Authentication
              </Typography>
              <Typography variant="caption" color={Colors.text.muted}>
                Receive a code via SMS or email
              </Typography>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.securityNote}>
          <AlertCircle size={16} color={Colors.status.info} />
          <Typography variant="caption" color={Colors.text.muted} style={styles.securityNoteText}>
            This additional verification helps protect against fraud and ensures the security of your transaction.
          </Typography>
        </View>
        
        <View style={styles.paymentActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.paymentButton}
            disabled={isVerifying}
          />
          <Button
            title={isVerifying ? 'Verifying...' : 'Verify & Pay'}
            onPress={handleVerification}
            loading={isVerifying}
            style={styles.paymentButton}
            disabled={isVerifying}
            leftIcon={isVerifying ? undefined : <Shield size={18} color={Colors.common.white} />}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.paymentCard}>
      <Typography variant="h4" style={styles.paymentTitle}>
        Payment Details
      </Typography>
      
      <Typography variant="body2" color={Colors.text.muted} style={styles.paymentSubtitle}>
        You are paying {currency} {amount.toLocaleString()} for {description}
      </Typography>
      
      <View style={styles.paymentProviders}>
        <Typography variant="body2" style={styles.paymentProviderLabel}>
          Select Payment Provider:
        </Typography>
        
        <View style={styles.providerOptions}>
          <Button
            title="Paystack"
            variant={selectedProvider === PaymentProvider.PAYSTACK ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setSelectedProvider(PaymentProvider.PAYSTACK)}
            style={styles.providerButton}
          />
          
          <Button
            title="Flutterwave"
            variant={selectedProvider === PaymentProvider.FLUTTERWAVE ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setSelectedProvider(PaymentProvider.FLUTTERWAVE)}
            style={styles.providerButton}
          />
        </View>
      </View>
      
      <Input
        label="Email"
        placeholder="your.email@example.com"
        value={paymentForm.email}
        onChangeText={(text) => handlePaymentFormChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={formErrors.email}
      />
      
      <Input
        label="Phone Number (Optional)"
        placeholder="+1234567890"
        value={paymentForm.phoneNumber}
        onChangeText={(text) => handlePaymentFormChange('phoneNumber', text)}
        keyboardType="phone-pad"
      />
      
      <Input
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        value={paymentForm.cardNumber}
        onChangeText={(text) => handlePaymentFormChange('cardNumber', formatCardNumber(text))}
        keyboardType="numeric"
        maxLength={19} // 16 digits + 3 spaces
        error={formErrors.cardNumber}
        leftIcon={<CreditCard size={20} color={Colors.text.muted} />}
      />
      
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Expiry Date"
            placeholder="MM/YY"
            value={paymentForm.expiryDate}
            onChangeText={(text) => handlePaymentFormChange('expiryDate', formatExpiryDate(text))}
            keyboardType="numeric"
            maxLength={5} // MM/YY
            error={formErrors.expiryDate}
            leftIcon={<Calendar size={20} color={Colors.text.muted} />}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="CVV"
            placeholder="123"
            value={paymentForm.cvv}
            onChangeText={(text) => handlePaymentFormChange('cvv', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={4}
            error={formErrors.cvv}
            leftIcon={<AlertCircle size={20} color={Colors.text.muted} />}
          />
        </View>
      </View>
      
      <Input
        label="Cardholder Name"
        placeholder="John Doe"
        value={paymentForm.name}
        onChangeText={(text) => handlePaymentFormChange('name', text)}
        error={formErrors.name}
      />
      
      <View style={styles.totalSection}>
        <Typography variant="body1" weight="600">
          Total Amount:
        </Typography>
        <Typography variant="h4" color={Colors.primary.gold}>
          {currency} {amount.toLocaleString()}
        </Typography>
      </View>
      
      <View style={styles.paymentActions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.paymentButton}
          disabled={isProcessing}
        />
        <Button
          title={isProcessing ? 'Processing...' : 'Pay Now'}
          onPress={handlePayment}
          loading={isProcessing}
          style={styles.paymentButton}
          disabled={isProcessing}
          leftIcon={isProcessing ? undefined : <DollarSign size={18} color={Colors.common.white} />}
        />
      </View>
      
      <View style={styles.securityInfo}>
        <View style={styles.securePaymentInfo}>
          <Check size={16} color={Colors.status.success} />
          <Typography variant="caption" color={Colors.text.muted} style={styles.secureText}>
            Secure payment processed by {selectedProvider}. Your card details are encrypted.
          </Typography>
        </View>
        
        <View style={styles.securePaymentInfo}>
          <Shield size={16} color={Colors.status.info} />
          <Typography variant="caption" color={Colors.text.muted} style={styles.secureText}>
            AI-powered fraud detection protects your transaction.
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  paymentCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  paymentTitle: {
    marginBottom: Spacing.sm,
  },
  paymentSubtitle: {
    marginBottom: Spacing.lg,
  },
  paymentProviders: {
    marginBottom: Spacing.md,
  },
  paymentProviderLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  providerOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  providerButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  paymentButton: {
    flex: 1,
  },
  securityInfo: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  securePaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  secureText: {
    flex: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  securityTitle: {
    marginLeft: Spacing.xs,
  },
  securitySubtitle: {
    marginBottom: Spacing.lg,
  },
  verificationOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  verificationLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  verificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  verificationOptionSelected: {
    borderColor: Colors.primary.gold,
    backgroundColor: Colors.background.tertiary,
  },
  verificationOptionText: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  securityNoteText: {
    flex: 1,
  },
});

export default PaymentForm;