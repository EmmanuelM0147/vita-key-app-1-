import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, Calendar, DollarSign, ArrowDownUp, Search, Shield, AlertTriangle } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import useTransactionsStore from '@/store/transactions-store';
import TransactionCard from '@/components/payments/TransactionCard';
import { TransactionType, TransactionStatus } from '@/services/payment-gateway';
import { TransactionRiskLevel } from '@/types/transaction';

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    transactions, 
    isLoading, 
    error, 
    fetchTransactions, 
    filterTransactions,
    getHighRiskTransactions
  } = useTransactionsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: undefined as TransactionType | undefined,
    status: undefined as TransactionStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    riskLevel: undefined as TransactionRiskLevel | undefined,
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSecurityAlerts, setShowSecurityAlerts] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchTransactions(user.id);
    }
  }, [user]);
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      riskLevel: undefined,
    });
    setSearchQuery('');
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };
  
  const toggleSecurityAlerts = () => {
    setShowSecurityAlerts(prev => !prev);
    
    if (!showSecurityAlerts) {
      // When enabling security alerts, set the risk level filter
      setFilters(prev => ({
        ...prev,
        riskLevel: 'high',
      }));
    } else {
      // When disabling, clear the risk level filter
      setFilters(prev => ({
        ...prev,
        riskLevel: undefined,
      }));
    }
  };
  
  const filteredTransactions = () => {
    let filtered = filterTransactions(filters);
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        transaction =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.reference.toLowerCase().includes(query) ||
          (transaction.propertyTitle && transaction.propertyTitle.toLowerCase().includes(query))
      );
    }
    
    // If security alerts are enabled, only show high risk transactions
    if (showSecurityAlerts) {
      filtered = filtered.filter(
        transaction => 
          transaction.riskLevel === 'high' || 
          transaction.riskLevel === 'critical'
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };
  
  const renderTransactionTypeFilter = () => {
    const types = [
      { value: undefined, label: 'All Types' },
      { value: TransactionType.FULL_PAYMENT, label: 'Full Payment' },
      { value: TransactionType.RENTAL_DEPOSIT, label: 'Rental Deposit' },
      { value: TransactionType.BOOKING_FEE, label: 'Booking Fee' },
      { value: TransactionType.SUBSCRIPTION, label: 'Subscription' },
    ];
    
    return (
      <View style={styles.filterSection}>
        <Typography variant="body2" weight="600" style={styles.filterLabel}>
          Transaction Type
        </Typography>
        
        <View style={styles.filterOptions}>
          {types.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterOption,
                filters.type === type.value && styles.filterOptionActive,
              ]}
              onPress={() => handleFilterChange('type', type.value)}
            >
              <Typography
                variant="caption"
                color={filters.type === type.value ? Colors.common.white : Colors.text.dark}
              >
                {type.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderTransactionStatusFilter = () => {
    const statuses = [
      { value: undefined, label: 'All Statuses' },
      { value: TransactionStatus.COMPLETED, label: 'Completed' },
      { value: TransactionStatus.PENDING, label: 'Pending' },
      { value: TransactionStatus.FAILED, label: 'Failed' },
      { value: TransactionStatus.REFUNDED, label: 'Refunded' },
      { value: TransactionStatus.CANCELLED, label: 'Cancelled' },
      { value: TransactionStatus.FLAGGED, label: 'Flagged' },
      { value: TransactionStatus.UNDER_REVIEW, label: 'Under Review' },
    ];
    
    return (
      <View style={styles.filterSection}>
        <Typography variant="body2" weight="600" style={styles.filterLabel}>
          Status
        </Typography>
        
        <View style={styles.filterOptions}>
          {statuses.map((status, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterOption,
                filters.status === status.value && styles.filterOptionActive,
              ]}
              onPress={() => handleFilterChange('status', status.value)}
            >
              <Typography
                variant="caption"
                color={filters.status === status.value ? Colors.common.white : Colors.text.dark}
              >
                {status.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderRiskLevelFilter = () => {
    const riskLevels = [
      { value: undefined, label: 'All Risk Levels' },
      { value: 'low', label: 'Low Risk' },
      { value: 'medium', label: 'Medium Risk' },
      { value: 'high', label: 'High Risk' },
      { value: 'critical', label: 'Critical Risk' },
    ];
    
    return (
      <View style={styles.filterSection}>
        <Typography variant="body2" weight="600" style={styles.filterLabel}>
          Security Risk Level
        </Typography>
        
        <View style={styles.filterOptions}>
          {riskLevels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterOption,
                filters.riskLevel === level.value && styles.filterOptionActive,
              ]}
              onPress={() => handleFilterChange('riskLevel', level.value)}
            >
              <Typography
                variant="caption"
                color={filters.riskLevel === level.value ? Colors.common.white : Colors.text.dark}
              >
                {level.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderDateFilter = () => {
    return (
      <View style={styles.filterSection}>
        <Typography variant="body2" weight="600" style={styles.filterLabel}>
          Date Range
        </Typography>
        
        <View style={styles.dateInputs}>
          <View style={styles.dateInput}>
            <Input
              label="From"
              placeholder="YYYY-MM-DD"
              value={filters.startDate}
              onChangeText={(text) => handleFilterChange('startDate', text)}
              leftIcon={<Calendar size={18} color={Colors.text.muted} />}
            />
          </View>
          
          <View style={styles.dateInput}>
            <Input
              label="To"
              placeholder="YYYY-MM-DD"
              value={filters.endDate}
              onChangeText={(text) => handleFilterChange('endDate', text)}
              leftIcon={<Calendar size={18} color={Colors.text.muted} />}
            />
          </View>
        </View>
      </View>
    );
  };
  
  const renderAmountFilter = () => {
    return (
      <View style={styles.filterSection}>
        <Typography variant="body2" weight="600" style={styles.filterLabel}>
          Amount Range
        </Typography>
        
        <View style={styles.dateInputs}>
          <View style={styles.dateInput}>
            <Input
              label="Min"
              placeholder="0"
              value={filters.minAmount?.toString() || ''}
              onChangeText={(text) => handleFilterChange('minAmount', text ? parseInt(text) : undefined)}
              keyboardType="numeric"
              leftIcon={<DollarSign size={18} color={Colors.text.muted} />}
            />
          </View>
          
          <View style={styles.dateInput}>
            <Input
              label="Max"
              placeholder="1000000"
              value={filters.maxAmount?.toString() || ''}
              onChangeText={(text) => handleFilterChange('maxAmount', text ? parseInt(text) : undefined)}
              keyboardType="numeric"
              leftIcon={<DollarSign size={18} color={Colors.text.muted} />}
            />
          </View>
        </View>
      </View>
    );
  };
  
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <Card variant="outlined" style={styles.filtersCard}>
        {renderTransactionTypeFilter()}
        {renderTransactionStatusFilter()}
        {renderRiskLevelFilter()}
        {renderDateFilter()}
        {renderAmountFilter()}
        
        <View style={styles.filterActions}>
          <Button
            title="Clear Filters"
            variant="outline"
            size="sm"
            onPress={clearFilters}
            style={styles.filterAction}
          />
          
          <Button
            title="Apply Filters"
            variant="primary"
            size="sm"
            onPress={() => setShowFilters(false)}
            style={styles.filterAction}
          />
        </View>
      </Card>
    );
  };
  
  const renderSecurityAlerts = () => {
    if (!showSecurityAlerts) return null;
    
    const highRiskTransactions = getHighRiskTransactions();
    
    if (highRiskTransactions.length === 0) {
      return (
        <Card variant="outlined" style={styles.securityAlertsCard}>
          <View style={styles.securityAlertsHeader}>
            <Shield size={20} color={Colors.status.success} />
            <Typography variant="body1" weight="600" style={styles.securityAlertsTitle}>
              No Security Alerts
            </Typography>
          </View>
          
          <Typography variant="body2" color={Colors.text.muted} style={styles.securityAlertsEmpty}>
            Great! There are no high-risk transactions that require your attention.
          </Typography>
        </Card>
      );
    }
    
    return (
      <Card variant="outlined" style={styles.securityAlertsCard}>
        <View style={styles.securityAlertsHeader}>
          <AlertTriangle size={20} color={Colors.status.error} />
          <Typography variant="body1" weight="600" style={styles.securityAlertsTitle}>
            Security Alerts ({highRiskTransactions.length})
          </Typography>
        </View>
        
        <Typography variant="body2" color={Colors.text.muted} style={styles.securityAlertsSubtitle}>
          The following transactions have been flagged by our AI security system and may require your attention.
        </Typography>
        
        <View style={styles.securityAlertsList}>
          {highRiskTransactions.slice(0, 3).map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.securityAlert}
              onPress={() => router.push(`/payments/${transaction.id}`)}
            >
              <View style={styles.securityAlertContent}>
                <Typography variant="body2" weight="600">
                  {transaction.propertyTitle || transaction.description}
                </Typography>
                
                <Typography variant="caption" color={Colors.text.muted}>
                  {transaction.currency} {transaction.amount.toLocaleString()} • {new Date(transaction.date).toLocaleDateString()}
                </Typography>
                
                <View style={styles.securityAlertRisk}>
                  <Typography variant="caption" color={Colors.status.error}>
                    Risk Level: {transaction.riskLevel?.toUpperCase()}
                  </Typography>
                  
                  {transaction.riskFactors && transaction.riskFactors.length > 0 && (
                    <Typography variant="caption" color={Colors.text.muted} numberOfLines={1}>
                      {transaction.riskFactors[0]}
                    </Typography>
                  )}
                </View>
              </View>
              
              <Button
                title="Review"
                variant="outline"
                size="sm"
                style={styles.securityAlertButton}
              />
            </TouchableOpacity>
          ))}
          
          {highRiskTransactions.length > 3 && (
            <Button
              title={`View All ${highRiskTransactions.length} Alerts`}
              variant="outline"
              size="sm"
              onPress={() => {
                setFilters(prev => ({
                  ...prev,
                  riskLevel: 'high',
                }));
                setShowSecurityAlerts(false);
              }}
              style={styles.viewAllAlertsButton}
            />
          )}
        </View>
      </Card>
    );
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.gold} />
          <Typography variant="body1" style={styles.loadingText}>
            Loading transactions...
          </Typography>
        </View>
      );
    }
    
    if (error) {
      return (
        <Card variant="outlined" style={styles.errorCard}>
          <Typography variant="body1" color={Colors.status.error} align="center">
            {error}
          </Typography>
          <Button
            title="Try Again"
            variant="primary"
            size="sm"
            onPress={() => user && fetchTransactions(user.id)}
            style={styles.errorButton}
          />
        </Card>
      );
    }
    
    const filtered = filteredTransactions();
    
    if (filtered.length === 0) {
      return (
        <Card variant="outlined" style={styles.emptyCard}>
          <Typography variant="body1" align="center" style={styles.emptyText}>
            {searchQuery || Object.values(filters).some(v => v !== undefined)
              ? 'No transactions match your filters'
              : 'You have no transactions yet'}
          </Typography>
          
          {searchQuery || Object.values(filters).some(v => v !== undefined) ? (
            <Button
              title="Clear Filters"
              variant="primary"
              size="sm"
              onPress={clearFilters}
              style={styles.emptyButton}
            />
          ) : (
            <Button
              title="Browse Properties"
              variant="primary"
              size="sm"
              onPress={() => router.push('/marketplace')}
              style={styles.emptyButton}
            />
          )}
        </Card>
      );
    }
    
    return (
      <View style={styles.transactionsList}>
        {filtered.map(transaction => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onPress={() => router.push(`/payments/${transaction.id}`)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Payment History
          </Typography>
          
          <Typography variant="body1" color={Colors.text.muted} style={styles.subtitle}>
            View and manage your transaction history
          </Typography>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Search size={18} color={Colors.text.muted} />}
                style={styles.searchInput}
              />
            </View>
            
            <View style={styles.searchActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleSortOrder}
              >
                <ArrowDownUp size={20} color={Colors.text.dark} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  showFilters && styles.actionButtonActive,
                ]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={showFilters ? Colors.primary.gold : Colors.text.dark} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  showSecurityAlerts && styles.securityButtonActive,
                ]}
                onPress={toggleSecurityAlerts}
              >
                <Shield size={20} color={showSecurityAlerts ? Colors.status.error : Colors.text.dark} />
              </TouchableOpacity>
            </View>
          </View>
          
          {renderSecurityAlerts()}
          {renderFilters()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
  },
  searchActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },
  actionButtonActive: {
    backgroundColor: Colors.background.tertiary,
  },
  securityButtonActive: {
    backgroundColor: Colors.status.error + '20', // 20% opacity
  },
  filtersCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    marginBottom: Spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
    marginBottom: Spacing.xs,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary.gold,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateInput: {
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  filterAction: {
    minWidth: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  errorCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  errorButton: {
    marginTop: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: Spacing.md,
  },
  emptyButton: {
    minWidth: 150,
  },
  transactionsList: {
    gap: Spacing.md,
  },
  securityAlertsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.error,
  },
  securityAlertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  securityAlertsTitle: {
    marginLeft: Spacing.xs,
  },
  securityAlertsSubtitle: {
    marginBottom: Spacing.md,
  },
  securityAlertsEmpty: {
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  securityAlertsList: {
    gap: Spacing.md,
  },
  securityAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.error,
  },
  securityAlertContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  securityAlertRisk: {
    marginTop: Spacing.xs,
  },
  securityAlertButton: {
    minWidth: 80,
  },
  viewAllAlertsButton: {
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
});