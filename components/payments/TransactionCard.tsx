import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Transaction, TransactionRiskLevel } from '@/types/transaction';
import { TransactionStatus, TransactionType } from '@/services/payment-gateway';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
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
  
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return <CheckCircle size={18} color={getStatusColor(status)} />;
      case TransactionStatus.PENDING:
        return <Clock size={18} color={getStatusColor(status)} />;
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return <XCircle size={18} color={getStatusColor(status)} />;
      case TransactionStatus.REFUNDED:
        return <DollarSign size={18} color={getStatusColor(status)} />;
      case TransactionStatus.FLAGGED:
      case TransactionStatus.UNDER_REVIEW:
        return <AlertTriangle size={18} color={getStatusColor(status)} />;
      default:
        return null;
    }
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
  
  const showSecurityBadge = transaction.riskLevel && 
    (transaction.riskLevel === 'high' || transaction.riskLevel === 'critical');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Typography variant="body2" weight="600">
              {getTransactionTypeLabel(transaction.type)}
            </Typography>
            
            <View style={styles.statusContainer}>
              {getStatusIcon(transaction.status)}
              <Typography variant="caption" color={getStatusColor(transaction.status)} style={styles.statusText}>
                {transaction.status}
              </Typography>
            </View>
          </View>
          
          <Typography variant="h4" color={Colors.primary.gold}>
            {transaction.currency} {transaction.amount.toLocaleString()}
          </Typography>
        </View>
        
        {transaction.propertyTitle && (
          <Typography variant="body2" style={styles.propertyTitle}>
            {transaction.propertyTitle}
          </Typography>
        )}
        
        <Typography variant="caption" color={Colors.text.muted} style={styles.description}>
          {transaction.description}
        </Typography>
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={Colors.text.muted} />
            <Typography variant="caption" color={Colors.text.muted} style={styles.dateText}>
              {formatDate(transaction.date)}
            </Typography>
          </View>
          
          <View style={styles.referenceContainer}>
            <Typography variant="caption" color={Colors.text.muted}>
              Ref: {transaction.reference}
            </Typography>
          </View>
        </View>
        
        {showSecurityBadge && (
          <View style={[
            styles.securityBadge,
            { backgroundColor: getRiskLevelColor(transaction.riskLevel) }
          ]}>
            <ShieldAlert size={12} color={Colors.common.white} />
            <Typography variant="caption" color={Colors.common.white} style={styles.securityText}>
              {transaction.riskLevel === 'critical' ? 'Security Alert' : 'Review Required'}
            </Typography>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  typeContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  statusText: {
    marginLeft: Spacing.xs,
    textTransform: 'capitalize',
  },
  propertyTitle: {
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: Spacing.xs,
  },
  referenceContainer: {},
  securityBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  securityText: {
    marginLeft: 4,
    fontSize: 10,
  },
});

export default TransactionCard;