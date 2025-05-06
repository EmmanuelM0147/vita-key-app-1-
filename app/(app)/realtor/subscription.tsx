import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Crown, Shield, CreditCard, Calendar, AlertCircle } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import { processPayment } from '@/services/payment';

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    features: [
      'Up to 10 listings',
      'Basic analytics',
      'Email support',
      '30-day listing duration',
    ],
    icon: <Shield size={24} color={Colors.primary.main} />,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    features: [
      'Unlimited listings',
      'Advanced analytics',
      'Priority support',
      '90-day listing duration',
      'Featured listings',
      'Custom branding',
    ],
    icon: <Crown size={24} color={Colors.primary.gold} />,
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handlePlanSelect = (planId: string) => {
    if (user?.subscription?.plan === planId) {
      Alert.alert('Current Plan', 'You are already subscribed to this plan.');
      return;
    }
    
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubscribe = async () => {
    if (!validatePaymentForm() || !selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Invalid plan selected');
      
      // Process payment
      const paymentResult = await processPayment({
        amount: plan.price,
        currency: 'USD',
        description: `${plan.name} Subscription`,
        paymentMethod: {
          type: 'card',
          card: {
            number: paymentForm.cardNumber,
            expMonth: parseInt(paymentForm.expiryDate.split('/')[0]),
            expYear: parseInt(paymentForm.expiryDate.split('/')[1]),
            cvc: paymentForm.cvv,
          },
        },
      });
      
      if (paymentResult.success) {
        // Update user subscription
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
        
        await updateUser({
          subscription: {
            plan: selectedPlan as 'basic' | 'premium',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
          },
        });
        
        Alert.alert(
          'Subscription Successful',
          `You are now subscribed to the ${plan.name} plan.`,
          [{ text: 'OK', onPress: () => {
            setShowPaymentForm(false);
            setSelectedPlan(null);
            setPaymentForm({
              cardNumber: '',
              expiryDate: '',
              cvv: '',
              name: '',
            });
          }}]
        );
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'An error occurred during payment processing'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updateUser({
                subscription: {
                  ...user?.subscription!,
                  status: 'cancelled',
                },
              });
              
              Alert.alert(
                'Subscription Cancelled',
                'Your subscription has been cancelled. You will have access until the end of your current billing period.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        },
      ]
    );
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

  const renderPaymentForm = () => {
    if (!showPaymentForm) return null;
    
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return null;
    
    return (
      <Card variant="elevated" style={styles.paymentCard}>
        <Typography variant="h4" style={styles.paymentTitle}>
          Payment Details
        </Typography>
        
        <Typography variant="body2" color={Colors.text.muted} style={styles.paymentSubtitle}>
          You are subscribing to the {plan.name} plan for ${plan.price}/month
        </Typography>
        
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
        
        <View style={styles.paymentActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowPaymentForm(false)}
            style={styles.paymentButton}
            disabled={isProcessing}
          />
          <Button
            title={isProcessing ? 'Processing...' : 'Subscribe'}
            onPress={handleSubscribe}
            loading={isProcessing}
            style={styles.paymentButton}
            disabled={isProcessing}
          />
        </View>
      </Card>
    );
  };

  const renderSubscriptionStatus = () => {
    if (!user?.subscription) return null;
    
    const { plan, startDate, endDate, status } = user.subscription;
    const planDetails = subscriptionPlans.find(p => p.id === plan);
    
    if (!planDetails) return null;
    
    const startDateFormatted = new Date(startDate).toLocaleDateString();
    const endDateFormatted = new Date(endDate).toLocaleDateString();
    
    return (
      <Card variant="elevated" style={styles.statusCard}>
        <Typography variant="h4" style={styles.statusTitle}>
          Current Subscription
        </Typography>
        
        <View style={styles.statusDetails}>
          <View style={styles.statusItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Plan
            </Typography>
            <Typography variant="body1" style={styles.statusValue}>
              {planDetails.name}
            </Typography>
          </View>
          
          <View style={styles.statusItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Status
            </Typography>
            <View style={[
              styles.statusBadge,
              { backgroundColor: status === 'active' ? Colors.success.main : Colors.warning.main }
            ]}>
              <Typography variant="caption" color={Colors.common.white}>
                {status.toUpperCase()}
              </Typography>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Start Date
            </Typography>
            <Typography variant="body1" style={styles.statusValue}>
              {startDateFormatted}
            </Typography>
          </View>
          
          <View style={styles.statusItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Renewal Date
            </Typography>
            <Typography variant="body1" style={styles.statusValue}>
              {endDateFormatted}
            </Typography>
          </View>
        </View>
        
        {status === 'active' && (
          <Button
            title="Cancel Subscription"
            variant="outline"
            onPress={cancelSubscription}
            style={styles.cancelButton}
            textStyle={{ color: Colors.status.error }}
          />
        )}
      </Card>
    );
  };

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Subscription Plans
          </Typography>

          <Typography
            variant="body1"
            color={Colors.text.muted}
            style={styles.subtitle}
          >
            Choose the plan that best fits your needs
          </Typography>

          {renderSubscriptionStatus()}
          {renderPaymentForm()}

          {!showPaymentForm && subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              variant="elevated"
              style={[
                styles.planCard,
                user?.subscription?.plan === plan.id && styles.activePlan,
              ]}
            >
              <View style={styles.planHeader}>
                {plan.icon}
                <Typography variant="h4" style={styles.planName}>
                  {plan.name}
                </Typography>
                <Typography variant="h3" style={styles.planPrice}>
                  ${plan.price}
                  <Typography variant="body2" color={Colors.text.muted}>
                    /month
                  </Typography>
                </Typography>
              </View>

              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={16} color={Colors.success.main} />
                    <Typography variant="body2" style={styles.featureText}>
                      {feature}
                    </Typography>
                  </View>
                ))}
              </View>

              <Button
                title={
                  user?.subscription?.plan === plan.id && user?.subscription?.status === 'active'
                    ? 'Current Plan'
                    : 'Subscribe'
                }
                onPress={() => handlePlanSelect(plan.id)}
                variant={
                  user?.subscription?.plan === plan.id && user?.subscription?.status === 'active'
                    ? 'outline'
                    : 'primary'
                }
                style={styles.subscribeButton}
                disabled={user?.subscription?.plan === plan.id && user?.subscription?.status === 'active'}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  planCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  activePlan: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  planName: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planPrice: {
    marginBottom: Spacing.md,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  subscribeButton: {
    marginTop: Spacing.md,
  },
  paymentCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  paymentTitle: {
    marginBottom: Spacing.sm,
  },
  paymentSubtitle: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
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
  statusCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  statusTitle: {
    marginBottom: Spacing.lg,
  },
  statusDetails: {
    marginBottom: Spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusValue: {
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  cancelButton: {
    borderColor: Colors.status.error,
  },
});