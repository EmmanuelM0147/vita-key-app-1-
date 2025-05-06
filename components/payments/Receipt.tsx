import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { Download, Calendar, DollarSign, CreditCard, Building, User, ShieldCheck, AlertTriangle, Shield } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Transaction, TransactionRiskLevel } from '@/types/transaction';
import { TransactionStatus, TransactionType } from '@/services/payment-gateway';
import useTransactionsStore from '@/store/transactions-store';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  const { getFraudDetectionResult, getTransactionVerifications } = useTransactionsStore();
  
  const fraudDetectionResult = getFraudDetectionResult(transaction.id);
  const verifications = getTransactionVerifications(transaction.id);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.FULL_PAYMENT:
        return 'Full Payment';
      case TransactionType.RENTAL_DEPOSIT:
        return 'Rental Deposit';
      case TransactionType.BOOKING_FEE:
        return 'Booking Fee';
      case TransactionType.SUBSCRIPTION:
        return 'Subscription';
      default:
        return 'Payment';
    }
  };
  
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return Colors.status.success;
      case TransactionStatus.PENDING:
        return Colors.status.warning;
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return Colors.status.error;
      case TransactionStatus.REFUNDED:
        return Colors.status.info;
      case TransactionStatus.FLAGGED:
      case TransactionStatus.UNDER_REVIEW:
        return Colors.status.warning;
      default:
        return Colors.text.muted;
    }
  };
  
  const getRiskLevelColor = (riskLevel?: TransactionRiskLevel) => {
    switch (riskLevel) {
      case 'low':
        return Colors.status.success;
      case 'medium':
        return Colors.status.warning;
      case 'high':
        return Colors.status.error;
      case 'critical':
        return Colors.status.error;
      default:
        return Colors.text.muted;
    }
  };
  
  const handleDownloadReceipt = () => {
    if (transaction.receiptUrl) {
      Linking.openURL(transaction.receiptUrl);
    }
  };
  
  return (
    <Card variant="elevated" style={styles.receiptCard}>
      <View style={styles.receiptHeader}>
        <Typography variant="h4" style={styles.receiptTitle}>
          Receipt
        </Typography>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(transaction.status) }
        ]}>
          <Typography variant="caption" color={Colors.common.white} style={styles.statusText}>
            {transaction.status}
          </Typography>
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Typography variant="h3" color={Colors.primary.gold} style={styles.amount}>
          {transaction.currency} {transaction.amount.toLocaleString()}
        </Typography>
        <Typography variant="body2" color={Colors.text.muted}>
          {getTransactionTypeLabel(transaction.type)}
        </Typography>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Calendar size={18} color={Colors.primary.gold} />
          </View>
          <View style={styles.detailTextContainer}>
            <Typography variant="caption" color={Colors.text.muted}>
              Date
            </Typography>
            <Typography variant="body2">
              {formatDate(transaction.date)}
            </Typography>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <CreditCard size={18} color={Colors.primary.gold} />
          </View>
          <View style={styles.detailTextContainer}>
            <Typography variant="caption" color={Colors.text.muted}>
              Payment Method
            </Typography>
            <Typography variant="body2">
              {transaction.method} via {transaction.provider}
            </Typography>
          </View>
        </View>
        
        {transaction.propertyTitle && (
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Building size={18} color={Colors.primary.gold} />
            </View>
            <View style={styles.detailTextContainer}>
              <Typography variant="caption" color={Colors.text.muted}>
                Property
              </Typography>
              <Typography variant="body2">
                {transaction.propertyTitle}
              </Typography>
            </View>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <User size={18} color={Colors.primary.gold} />
          </View>
          <View style={styles.detailTextContainer}>
            <Typography variant="caption" color={Colors.text.muted}>
              Transaction ID
            </Typography>
            <Typography variant="body2">
              {transaction.id}
            </Typography>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <DollarSign size={18} color={Colors.primary.gold} />
          </View>
          <View style={styles.detailTextContainer}>
            <Typography variant="caption" color={Colors.text.muted}>
              Reference
            </Typography>
            <Typography variant="body2">
              {transaction.reference}
            </Typography>
          </View>
        </View>
      </View>
      
      {/* Security Information */}
      {transaction.riskLevel && (
        <>
          <Divider style={styles.divider} />
          
          <View style={styles.securityContainer}>
            <View style={styles.securityHeader}>
              <Shield size={18} color={Colors.text.dark} />
              <Typography variant="body1" weight="600" style={styles.securityTitle}>
                Security Information
              </Typography>
            </View>
            
            <View style={styles.securityContent}>
              <View style={styles.securityItem}>
                <Typography variant="caption" color={Colors.text.muted}>
                  Risk Level
                </Typography>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskLevelColor(transaction.riskLevel) }
                ]}>
                  <Typography variant="caption" color={Colors.common.white}>
                    {transaction.riskLevel.toUpperCase()}
                  </Typography>
                </View>
              </View>
              
              {transaction.securityVerified && (
                <View style={styles.securityItem}>
                  <Typography variant="caption" color={Colors.text.muted}>
                    Verification
                  </Typography>
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={14} color={Colors.status.success} />
                    <Typography variant="caption" color={Colors.status.success} style={styles.verifiedText}>
                      Verified
                    </Typography>
                  </View>
                </View>
              )}
              
              {transaction.riskFactors && transaction.riskFactors.length > 0 && (
                <View style={styles.riskFactorsContainer}>
                  <Typography variant="caption" color={Colors.text.muted} style={styles.riskFactorsTitle}>
                    Risk Factors
                  </Typography>
                  {transaction.riskFactors.map((factor, index) => (
                    <View key={index} style={styles.riskFactor}>
                      <AlertTriangle size={12} color={Colors.text.muted} />
                      <Typography variant="caption" color={Colors.text.muted} style={styles.riskFactorText}>
                        {factor}
                      </Typography>
                    </View>
                  ))}
                </View>
              )}
              
              {verifications && verifications.length > 0 && (
                <View style={styles.verificationsContainer}>
                  <Typography variant="caption" color={Colors.text.muted} style={styles.verificationsTitle}>
                    Verification History
                  </Typography>
                  {verifications.map((verification, index) => (
                    <View key={index} style={styles.verification}>
                      <Typography variant="caption" color={Colors.text.dark}>
                        {verification.method.replace('_', ' ').toUpperCase()} verification
                      </Typography>
                      <Typography variant="caption" color={Colors.text.muted}>
                        {formatDate(verification.timestamp)}
                      </Typography>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </>
      )}
      
      <Divider style={styles.divider} />
      
      <View style={styles.descriptionContainer}>
        <Typography variant="body2" color={Colors.text.muted}>
          {transaction.description}
        </Typography>
      </View>
      
      {transaction.receiptUrl && (
        <Button
          title="Download Receipt"
          variant="outline"
          onPress={handleDownloadReceipt}
          leftIcon={<Download size={18} color={Colors.primary.gold} />}
          style={styles.downloadButton}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  receiptCard: {
    padding: Spacing.xl,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptTitle: {},
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  amount: {
    marginBottom: Spacing.xs,
  },
  divider: {
    marginVertical: Spacing.md,
  },
  detailsContainer: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  securityContainer: {
    gap: Spacing.md,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  securityTitle: {
    marginLeft: Spacing.xs,
  },
  securityContent: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontWeight: '600',
  },
  riskFactorsContainer: {
    gap: Spacing.xs,
  },
  riskFactorsTitle: {
    marginBottom: 2,
  },
  riskFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: Spacing.xs,
  },
  riskFactorText: {
    flex: 1,
  },
  verificationsContainer: {
    gap: Spacing.xs,
  },
  verificationsTitle: {
    marginBottom: 2,
  },
  verification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  downloadButton: {
    marginTop: Spacing.md,
  },
});

export default Receipt;