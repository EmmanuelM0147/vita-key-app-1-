import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Edit, Trash2, Eye, Filter } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';
import { Property, PropertyStatus } from '@/types/property';

type FilterOption = 'all' | PropertyStatus;

export default function RealtorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { properties, deleteProperty, isLoading, fetchProperties } = usePropertiesStore();
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filter properties by agent ID
  const agentProperties = properties.filter(property => property.agentId === user?.id);
  
  // Apply status filter
  const filteredProperties = filterOption === 'all'
    ? agentProperties
    : agentProperties.filter(property => property.status === filterOption);

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAddProperty = () => {
    router.push('/realtor/add-property');
  };

  const handleEditProperty = (id: string) => {
    router.push(`/realtor/edit-property?id=${id}`);
  };

  const handleViewProperty = (id: string) => {
    router.push(`/marketplace/${id}`);
  };

  const handleDeleteProperty = (id: string) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(id);
              Alert.alert('Success', 'Property deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          }
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const renderPropertyItem = ({ item }: { item: Property }) => {
    const statusColors = {
      active: Colors.success.main,
      pending: Colors.warning.main,
      sold: Colors.primary.gold,
      inactive: Colors.text.muted,
    };

    // Handle location display safely
    const locationDisplay = typeof item.location === 'string' 
      ? item.location 
      : item.location && typeof item.location === 'object' && 'address' in item.location 
        ? item.location.address 
        : 'Location not specified';

    return (
      <Card variant="elevated" style={styles.propertyCard}>
        <View style={styles.propertyHeader}>
          <Typography variant="h4" numberOfLines={1} style={styles.propertyTitle}>
            {item.title}
          </Typography>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Typography variant="caption" color={Colors.common.white} style={styles.statusText}>
              {item.status.toUpperCase()}
            </Typography>
          </View>
        </View>

        <Typography variant="body2" color={Colors.text.muted} style={styles.propertyLocation}>
          {locationDisplay}
        </Typography>

        <Typography variant="h3" style={styles.propertyPrice}>
          ${item.price.toLocaleString()}
        </Typography>

        <View style={styles.propertyDetails}>
          <View style={styles.detailItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Beds
            </Typography>
            <Typography variant="body1" style={styles.detailValue}>
              {item.bedrooms}
            </Typography>
          </View>
          <View style={styles.detailItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Baths
            </Typography>
            <Typography variant="body1" style={styles.detailValue}>
              {item.bathrooms}
            </Typography>
          </View>
          <View style={styles.detailItem}>
            <Typography variant="body2" color={Colors.text.muted}>
              Sq Ft
            </Typography>
            <Typography variant="body1" style={styles.detailValue}>
              {item.area}
            </Typography>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="View"
            variant="outline"
            size="sm"
            leftIcon={<Eye size={16} color={Colors.primary.gold} />}
            onPress={() => handleViewProperty(item.id)}
            style={styles.actionButton}
          />
          <Button
            title="Edit"
            variant="outline"
            size="sm"
            leftIcon={<Edit size={16} color={Colors.primary.navy} />}
            onPress={() => handleEditProperty(item.id)}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            variant="outline"
            size="sm"
            leftIcon={<Trash2 size={16} color={Colors.status.error} />}
            onPress={() => handleDeleteProperty(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={{ color: Colors.status.error }}
          />
        </View>
      </Card>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Typography variant="h4" style={styles.emptyTitle}>
        No Properties Found
      </Typography>
      <Typography variant="body1" color={Colors.text.muted} style={styles.emptySubtitle}>
        {filterOption !== 'all'
          ? `You don't have any ${filterOption} properties.`
          : 'Start adding properties to your portfolio.'}
      </Typography>
      <Button
        title="Add Your First Property"
        onPress={handleAddProperty}
        style={styles.emptyButton}
      />
    </View>
  );

  // Check if user is a realtor
  if (user?.role !== 'realtor') {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Realtor Access Required
          </Typography>
          <Typography variant="body1" color={Colors.text.muted} style={styles.subtitle}>
            You need a realtor account to access this feature.
          </Typography>
          <Button
            title="Go Back"
            onPress={() => router.push('/')}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h3" style={styles.title}>
            My Listings
          </Typography>
          <Button
            title="Add Property"
            onPress={handleAddProperty}
            leftIcon={<Plus size={18} color={Colors.common.white} />}
            size="sm"
          />
        </View>

        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statCard}>
            <Typography variant="h2" style={styles.statNumber}>
              {agentProperties.filter(p => p.status === 'active').length}
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Active
            </Typography>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Typography variant="h2" style={styles.statNumber}>
              {agentProperties.filter(p => p.status === 'pending').length}
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Pending
            </Typography>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Typography variant="h2" style={styles.statNumber}>
              {agentProperties.filter(p => p.status === 'sold').length}
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Sold
            </Typography>
          </Card>
        </View>

        <View style={styles.filterContainer}>
          <Typography variant="body2" color={Colors.text.muted} style={styles.filterLabel}>
            <Filter size={16} color={Colors.text.muted} /> Filter by status:
          </Typography>
          <View style={styles.filterOptions}>
            {(['all', 'active', 'pending', 'sold', 'inactive'] as FilterOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  filterOption === option && styles.filterOptionActive,
                ]}
                onPress={() => setFilterOption(option)}
              >
                <Typography
                  variant="body2"
                  color={filterOption === option ? Colors.common.white : Colors.text.dark}
                >
                  {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary.gold]}
              tintColor={Colors.primary.gold}
            />
          }
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  goBackButton: {
    marginTop: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.background.light,
  },
  statNumber: {
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondary.sage,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary.navy,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  propertyCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  propertyTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  propertyLocation: {
    marginBottom: Spacing.xs,
  },
  propertyPrice: {
    marginBottom: Spacing.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailValue: {
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: Colors.status.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    marginTop: Spacing.md,
  },
});