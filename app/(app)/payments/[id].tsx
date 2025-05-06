import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useTransactionsStore from '@/store/transactions-store';
import useAuthStore from '@/store/auth-store';
import Receipt from '@/components/payments/Receipt';
import { Transaction, TransactionRiskLevel } from '@/types/transaction';
import { TransactionStatus, verifyTransaction } from '@/services/payment-gateway';
import { aiSecurityService } from '@/services/ai-security';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    getTransactionById, 
    updateTransactionStatus, 
    verifyTransaction: verifyTransactionAction,
    flagTransactionAsFraudulent,
    getFraudDetectionResult
  } = useTransactionsStore();
  
  const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  
  useEffect(() => {
    const loadTransaction = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!id) {
          throw new Error('Transaction ID is required');
        }
        
        // Get transaction from store
        const storedTransaction = getTransactionById(id);
        
        if (!storedTransaction) {
          throw new Error('Transaction not found');
        }
        
        // Verify transaction status with payment provider
        // In a real app, you would verify the transaction status with the payment provider
        // For this demo, we'll just use the stored transaction
        const verifiedTransaction = await verifyTransaction(
          storedTransaction.id,
          storedTransaction.provider
        );
        
        // Update transaction status if it has changed
        if (verifiedTransaction.status !== storedTransaction.status) {
          updateTransactionStatus(storedTransaction.id, verifiedTransaction.status);
        }
        
        setTransaction(storedTransaction);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load transaction');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTransaction();
  }, [id]);
  
  const handleVerifyTransaction = async () => {
    if (!transaction) return;
    
    setIsVerifying(true);
    
    try {
      const success = await verifyTransactionAction(transaction.id, 'manual');
      
      if (success) {
        // Refresh transaction data
        const updatedTransaction = getTransactionById(transaction.id);
        setTransaction(updatedTransaction);
        
        Alert.alert(
          'Verification Successful',
          'The transaction has been verified and marked as secure.'
        );
      } else {
        Alert.alert(
          'Verification Failed',
          'Unable to verify the transaction. Please try again later.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Verification Error',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleFlagAsFraudulent = async () => {
    if (!transaction) return;
    
    Alert.alert(
      'Flag as Fraudulent',
      'Are you sure you want to flag this transaction as fraudulent? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Flag as Fraudulent',
          style: 'destructive',
          onPress: async () => {
            setIsFlagging(true);
            
            try {
              await flagTransactionAsFraudulent(
                transaction.id,
                'Manually flagged as fraudulent by user'
              );
              
              // Refresh transaction data
              const updatedTransaction = getTransactionById(transaction.id);
              setTransaction(updatedTransaction);
              
              Alert.alert(
                'Transaction Flagged',
                'The transaction has been flagged as fraudulent and will be reviewed by our team.'
              );
              
              // Create security alert
              if (user) {
                aiSecurityService.createSecurityAlert(
                  user.id,
                  'fraud_detected',
                  {
                    transactionId: transaction.id,
                    transactionType: transaction.type,
                    transactionAmount: transaction.amount,
                    securityAction: 'Transaction flagged as fraudulent',
                  }
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'An unknown error occurred'
              );
            } finally {
              setIsFlagging(false);
            }
          },
        },
      ]
    );
  };
  
  const renderSecurityActions = () => {
    if (!transaction) return null;
    
    const fraudDetectionResult = getFraudDetectionResult(transaction.id);
    const isHighRisk = transaction.riskLevel === 'high' || transaction.riskLevel === 'critical';
    const isVerified = transaction.securityVerified;
    const isFlagged = transaction.status === TransactionStatus.FLAGGED;
    
    if (!isHighRisk && !fraudDetectionResult && !isVerified) return null;
    
    return (
      <Card variant="outlined" style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Shield size={20} color={Colors.text.dark} />
          <Typography variant="body1" weight="600" style={styles.securityTitle}>
            Security Actions
          </Typography>
        </View>
        
        <View style={styles.securityContent}>
          {isHighRisk && !isVerified && !isFlagged && (
            <View style={styles.securityWarning}>
              <AlertTriangle size={18} color={Colors.status.warning} />
              <Typography variant="body2" color={Colors.text.dark} style={styles.securityWarningText}>
                This transaction has been flagged as {transaction.riskLevel} risk by our AI security system.
              </Typography>
            </View>
          )}
          
          {isVerified && (
            <View style={styles.securityInfo}>
              <CheckCircle size={18} color={Colors.status.success} />
              <Typography variant="body2" color={Colors.text.dark} style={styles.securityInfoText}>
                This transaction has been verified and is secure.
              </Typography>
            </View>
          )}
          
          {isFlagged && (
            <View style={styles.securityWarning}>
              <XCircle size={18} color={Colors.status.error} />
              <Typography variant="body2" color={Colors.text.dark} style={styles.securityWarningText}>
                This transaction has been flagged as potentially fraudulent and is under review.
              </Typography>
            </View>
          )}
          
          {isHighRisk && !isVerified && !isFlagged && (
            <View style={styles.securityActions}>
              <Button
                title="Verify as Legitimate"
                variant="outline"
                onPress={handleVerifyTransaction}
                loading={isVerifying}
                disabled={isVerifying || isFlagging}
                leftIcon={<CheckCircle size={18} color={Colors.status.success} />}
                style={styles.securityAction}
              />
              
              <Button
                title="Flag as Fraudulent"
                variant="danger"
                onPress={handleFlagAsFraudulent}
                loading={isFlagging}
                disabled={isVerifying || isFlagging}
                leftIcon={<AlertTriangle size={18} color={Colors.common.white} />}
                style={styles.securityAction}
              />
            </View>
          )}
        </View>
      </Card>
    );
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Typography variant="body1" style={styles.loadingText}>
            Loading transaction details...
          </Typography>
        </View>
      );
    }
    
    if (error || !transaction) {
      return (
        <View style={styles.errorContainer}>
          <Typography variant="body1" color={Colors.status.error} align="center" style={styles.errorText}>
            {error || 'Transaction not found'}
          </Typography>
          <Button
            title="Go Back"
            variant="primary"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      );
    }
    
    return (
      <>
        <Receipt transaction={transaction} />
        
        {renderSecurityActions()}
        
        <Button
          title="Back to Transactions"
          variant="outline"
          onPress={() => router.push('/payments')}
          leftIcon={<ArrowLeft size={18} color={Colors.primary[500]} />}
          style={styles.backButton}
        />
      </>
    );
  };

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Transaction Details
          </Typography>
          
          <Typography variant="body1" color={Colors.text.muted} style={styles.subtitle}>
            View your transaction receipt and details
          </Typography>
          
          {renderContent()}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    marginBottom: Spacing.md,
  },
  errorButton: {
    minWidth: 150,
  },
  backButton: {
    marginTop: Spacing.md,
  },
  securityCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.gold,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  securityTitle: {
    marginLeft: Spacing.xs,
  },
  securityContent: {
    gap: Spacing.md,
  },
  securityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.warning + '20', // 20% opacity
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  securityWarningText: {
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.success + '20', // 20% opacity
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  securityInfoText: {
    flex: 1,
  },
  securityActions: {
    gap: Spacing.md,
  },
  securityAction: {
    width: '100%',
  },
});