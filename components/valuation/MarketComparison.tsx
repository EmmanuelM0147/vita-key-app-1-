import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign, Ruler, Bed, Bath, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ComparableProperty } from '@/types/valuation';

interface MarketComparisonProps {
  comparableProperties: ComparableProperty[];
}

const MarketComparison: React.FC<MarketComparisonProps> = ({ comparableProperties }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  };
  
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comparable Properties</Text>
      <Text style={styles.subtitle}>
        Similar properties in your area that were used to determine your property's value
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.propertiesContainer}
      >
        {comparableProperties.map((property) => (
          <View key={property.id} style={styles.propertyCard}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: `${property.imageUrl}?w=400&h=250&fit=crop` }} 
                style={styles.propertyImage} 
              />
              <View style={styles.similarityBadge}>
                <Text style={styles.similarityText}>{property.similarity}% Match</Text>
              </View>
            </View>
            
            <View style={styles.propertyDetails}>
              <Text style={styles.propertyPrice}>{formatCurrency(property.price)}</Text>
              
              <View style={styles.addressContainer}>
                <MapPin size={16} color={Colors.primary.main} style={styles.icon} />
                <Text style={styles.propertyAddress} numberOfLines={1}>
                  {property.address}
                </Text>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Bed size={16} color={Colors.text.muted} />
                  <Text style={styles.statText}>{property.bedrooms}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Bath size={16} color={Colors.text.muted} />
                  <Text style={styles.statText}>{property.bathrooms}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ruler size={16} color={Colors.text.muted} />
                  <Text style={styles.statText}>{property.squareFeet} sqft</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Calendar size={14} color={Colors.text.muted} style={styles.infoIcon} />
                  <Text style={styles.infoText}>Built {property.yearBuilt}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <MapPin size={14} color={Colors.text.muted} style={styles.infoIcon} />
                  <Text style={styles.infoText}>{property.distanceInMiles} mi away</Text>
                </View>
              </View>
              
              {property.soldDate && (
                <View style={styles.soldDateContainer}>
                  <Text style={styles.soldDateText}>
                    Sold on {formatDate(property.soldDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 16,
  },
  propertiesContainer: {
    paddingRight: 16,
  },
  propertyCard: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: Colors.text.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  similarityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  propertyDetails: {
    padding: 16,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.main,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 6,
  },
  propertyAddress: {
    fontSize: 14,
    color: Colors.text.main,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.text.main,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  soldDateContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.main,
  },
  soldDateText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
});

export default MarketComparison;