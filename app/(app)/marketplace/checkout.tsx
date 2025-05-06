import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, CreditCard, Building, Calendar, User, Shield, Check, Info } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Divider from '@/components/ui/Divider';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import usePropertiesStore from '@/store/properties-store';
import useAuthStore from '@/store/auth-store';
import useTransactionsStore from '@/store/transactions-store';
import { PaymentMethod, TransactionType, PaymentProvider, TransactionStatus } from '@/services/payment-gateway';
import { Transaction } from '@/types/transaction';

export default function CheckoutScreen() {
  const { id, type = TransactionType.BOOKING_FEE } = useLocalSearchParams<{ 
    id: string;
    type: TransactionType;
  }>();
  
  const router = useRouter();
  const { getPropertyById } = usePropertiesStore();
  const { user } = useAuthStore();
  const { addTransaction, isLoading } = useTransactionsStore();
  
  const [property, setProperty] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  useEffect(() => {
    if (id) {
      const propertyData = getPropertyById(id);
      if (propertyData) {
        setProperty(propertyData);
      } else {
        Alert.alert('Error', 'Property not found');
        router.back();
      }
    }
  }, [id]);
  
  const getTransactionAmount = () => {
    if (!property) return 0;
    
    switch (type) {
      case TransactionType.FULL_PAYMENT:
        return property.price;
      case TransactionType.RENTAL_DEPOSIT:
        return property.price * 0.1; // 10% deposit
      case TransactionType.BOOKING_FEE:
        return 500; // Fixed booking fee
      case TransactionType.SUBSCRIPTION:
        return 99.99; // Monthly subscription
      default:
        return 0;
    }
  };
  
  const getTransactionDescription = () => {
    if (!property) return '';
    
    switch (type) {
      case TransactionType.FULL_PAYMENT:
        return `Full payment for ${property.title}`;
      case TransactionType.RENTAL_DEPOSIT:
        return `Rental deposit for ${property.title}`;
      case TransactionType.BOOKING_FEE:
        return `Booking fee for ${property.title}`;
      case TransactionType.SUBSCRIPTION:
        return 'Monthly premium subscription';
      default:
        return '';
    }
  };
  
  const handlePaymentSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a payment');
      return;
    }
    
    if (!property) {
      Alert.alert('Error', 'Property not found');
      return;
    }
    
    if (!agreeToTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions');
      return;
    }
    
    try {
      // Create transaction object with all required properties
      const transactionData: Transaction = {
        id: `tx_${Date.now()}`, // Generate a unique ID
        userId: user.id,
        propertyId: property.id,
        propertyTitle: property.title,
        amount: getTransactionAmount(),
        currency: 'USD',
        type: type,
        status: TransactionStatus.COMPLETED, // Set initial status
        provider: PaymentProvider.STRIPE, // Default provider
        method: paymentMethod,
        reference: `ref_${Date.now()}`, // Generate a reference
        description: getTransactionDescription(),
        date: new Date().toISOString(), // Current date
        receiptUrl: `https://receipts.example.com/tx_${Date.now()}`, // Mock receipt URL
      };
      
      // Add transaction to store
      const result = addTransaction(transactionData);
      
      // Navigate to success page
      router.push({
        pathname: '/payments/[id]',
        params: { id: transactionData.id }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Payment Failed', errorMessage);
    }
  };

  if (!property) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <Typography variant="body1">Loading...</Typography>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Checkout',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Card variant="elevated" style={styles.propertyCard}>
            <View style={styles.propertyHeader}>
              <Building size={20} color={Colors.primary.main} />
              <Typography variant="body1" weight="600" style={styles.propertyTitle}>
                {property.title}
              </Typography>
            </View>
            
            <View style={styles.propertyDetails}>
              <View style={styles.propertyDetail}>
                <Typography variant="body2" color={Colors.text.muted}>
                  Location:
                </Typography>
                <Typography variant="body2">
                  {property.address}
                </Typography>
              </View>
              
              <View style={styles.propertyDetail}>
                <Typography variant="body2" color={Colors.text.muted}>
                  Property Type:
                </Typography>
                <Typography variant="body2">
                  {property.type}
                </Typography>
              </View>
              
              <View style={styles.propertyDetail}>
                <Typography variant="body2" color={Colors.text.muted}>
                  Transaction Type:
                </Typography>
                <Typography variant="body2" weight="600">
                  {type === TransactionType.FULL_PAYMENT ? 'Full Payment' :
                   type === TransactionType.RENTAL_DEPOSIT ? 'Rental Deposit' :
                   type === TransactionType.BOOKING_FEE ? 'Booking Fee' : 'Subscription'}
                </Typography>
              </View>
            </View>
          </Card>
          
          <Typography variant="h4" style={styles.sectionTitle}>
            Payment Details
          </Typography>
          
          <Card variant="elevated" style={styles.paymentCard}>
            <View style={styles.paymentMethodSelector}>
              <Typography variant="body1" weight="600" style={styles.paymentMethodTitle}>
                Payment Method
              </Typography>
              
              <View style={styles.paymentMethodOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === PaymentMethod.CARD && styles.paymentMethodOptionSelected
                  ]}
                  onPress={() => setPaymentMethod(PaymentMethod.CARD)}
                >
                  <CreditCard size={20} color={paymentMethod === PaymentMethod.CARD ? Colors.common.white : Colors.text.dark} />
                  <Typography 
                    variant="body2" 
                    color={paymentMethod === PaymentMethod.CARD ? Colors.common.white : Colors.text.dark}
                    style={styles.paymentMethodText}
                  >
                    Credit Card
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === PaymentMethod.BANK_TRANSFER && styles.paymentMethodOptionSelected
                  ]}
                  onPress={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                >
                  <Building size={20} color={paymentMethod === PaymentMethod.BANK_TRANSFER ? Colors.common.white : Colors.text.dark} />
                  <Typography 
                    variant="body2" 
                    color={paymentMethod === PaymentMethod.BANK_TRANSFER ? Colors.common.white : Colors.text.dark}
                    style={styles.paymentMethodText}
                  >
                    Bank Transfer
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
            
            {paymentMethod === PaymentMethod.CARD && (
              <View style={styles.cardDetailsSection}>
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChangeText={(text) => setCardDetails({...cardDetails, number: text})}
                  keyboardType="numeric"
                  leftIcon={<CreditCard size={20} color={Colors.text.muted} />}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChangeText={(text) => setCardDetails({...cardDetails, expiry: text})}
                      keyboardType="numeric"
                      leftIcon={<Calendar size={20} color={Colors.text.muted} />}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Input
                      label="CVC"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChangeText={(text) => setCardDetails({...cardDetails, cvc: text})}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                </View>
                
                <Input
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChangeText={(text) => setCardDetails({...cardDetails, name: text})}
                  leftIcon={<User size={20} color={Colors.text.muted} />}
                />
              </View>
            )}
            
            {paymentMethod === PaymentMethod.BANK_TRANSFER && (
              <View style={styles.bankTransferSection}>
                <Typography variant="body2" color={Colors.text.muted} style={styles.bankTransferInfo}>
                  Please use the following details to make a bank transfer:
                </Typography>
                
                <View style={styles.bankDetails}>
                  <View style={styles.bankDetailRow}>
                    <Typography variant="body2" color={Colors.text.muted}>
                      Bank Name:
                    </Typography>
                    <Typography variant="body2" weight="600">
                      Global Bank
                    </Typography>
                  </View>
                  
                  <View style={styles.bankDetailRow}>
                    <Typography variant="body2" color={Colors.text.muted}>
                      Account Name:
                    </Typography>
                    <Typography variant="body2" weight="600">
                      Property Marketplace Ltd
                    </Typography>
                  </View>
                  
                  <View style={styles.bankDetailRow}>
                    <Typography variant="body2" color={Colors.text.muted}>
                      Account Number:
                    </Typography>
                    <Typography variant="body2" weight="600">
                      1234567890
                    </Typography>
                  </View>
                  
                  <View style={styles.bankDetailRow}>
                    <Typography variant="body2" color={Colors.text.muted}>
                      Sort Code:
                    </Typography>
                    <Typography variant="body2" weight="600">
                      12-34-56
                    </Typography>
                  </View>
                  
                  <View style={styles.bankDetailRow}>
                    <Typography variant="body2" color={Colors.text.muted}>
                      Reference:
                    </Typography>
                    <Typography variant="body2" weight="600">
                      {property.id}
                    </Typography>
                  </View>
                </View>
                
                <Typography variant="caption" color={Colors.text.muted} style={styles.bankTransferNote}>
                  Please include the reference number in your transfer. Payments typically take 1-3 business days to process.
                </Typography>
              </View>
            )}
          </Card>
          
          <Typography variant="h4" style={styles.sectionTitle}>
            Order Summary
          </Typography>
          
          <Card variant="outlined" style={styles.summaryCard}>
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Typography variant="body2" color={Colors.text.muted}>
                  {type === TransactionType.FULL_PAYMENT ? 'Property Price' :
                   type === TransactionType.RENTAL_DEPOSIT ? 'Deposit Amount (10%)' :
                   type === TransactionType.BOOKING_FEE ? 'Booking Fee' : 'Subscription Fee'}
                </Typography>
                <Typography variant="body2">
                  ${getTransactionAmount().toLocaleString()}
                </Typography>
              </View>
              
              {type === TransactionType.BOOKING_FEE && (
                <View style={styles.summaryRow}>
                  <Typography variant="body2" color={Colors.text.muted}>
                    Processing Fee
                  </Typography>
                  <Typography variant="body2">
                    $25.00
                  </Typography>
                </View>
              )}
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Typography variant="body1" weight="600">
                  Total
                </Typography>
                <Typography variant="body1" weight="600" color={Colors.primary.main}>
                  ${(getTransactionAmount() + (type === TransactionType.BOOKING_FEE ? 25 : 0)).toLocaleString()}
                </Typography>
              </View>
            </View>
            
            <View style={styles.securityNote}>
              <Shield size={16} color={Colors.text.muted} />
              <Typography variant="caption" color={Colors.text.muted} style={styles.securityText}>
                Your payment information is encrypted and secure. We never store your full card details.
              </Typography>
            </View>
          </Card>
          
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View style={[
                styles.checkbox,
                agreeToTerms && styles.checkboxChecked
              ]}>
                {agreeToTerms && <Check size={14} color={Colors.common.white} />}
              </View>
              <Typography variant="body2" style={styles.termsText}>
                I agree to the Terms and Conditions and Privacy Policy
              </Typography>
            </TouchableOpacity>
          </View>
          
          <Button
            title={`Pay $${(getTransactionAmount() + (type === TransactionType.BOOKING_FEE ? 25 : 0)).toLocaleString()}`}
            variant="primary"
            size="lg"
            onPress={handlePaymentSubmit}
            disabled={!agreeToTerms || isLoading}
            loading={isLoading}
            style={styles.payButton}
            fullWidth
          />
          
          <View style={styles.cancelContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Typography variant="body2" color={Colors.text.muted}>
                Cancel and return to property
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyCard: {
    marginBottom: Spacing.lg,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  propertyTitle: {
    marginLeft: Spacing.xs,
  },
  propertyDetails: {
    gap: Spacing.xs,
  },
  propertyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  paymentCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  paymentMethodSelector: {
    marginBottom: Spacing.md,
  },
  paymentMethodTitle: {
    marginBottom: Spacing.sm,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  paymentMethodOptionSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  paymentMethodText: {
    marginLeft: Spacing.xs,
  },
  cardDetailsSection: {
    gap: Spacing.md,
  },
  bankTransferSection: {
    gap: Spacing.md,
  },
  bankTransferInfo: {
    marginBottom: Spacing.sm,
  },
  bankDetails: {
    backgroundColor: Colors.background.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankTransferNote: {
    marginTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  paymentSummary: {
    borderTopWidth: 1,
    borderTopColor: Colors.primary.light,
    paddingTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryDivider: {
    marginVertical: Spacing.sm,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  securityText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  termsContainer: {
    marginBottom: Spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  termsText: {
    flex: 1,
  },
  payButton: {
    marginBottom: Spacing.md,
  },
  cancelContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
});