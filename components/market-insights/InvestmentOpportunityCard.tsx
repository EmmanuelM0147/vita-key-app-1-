import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Property } from '@/types/property';
import { TrendingUp, DollarSign, Home, MapPin, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { predictPropertyValue } from '@/services/market-analysis';

interface InvestmentOpportunityCardProps {
  property: Property;
  onPress: () => void;
}

const InvestmentOpportunityCard: React.FC<InvestmentOpportunityCardProps> = ({ 
  property, 
  onPress 
}) => {
  // Calculate investment metrics
  const prediction = predictPropertyValue(property, 5);
  const roi = ((prediction.futureValue - property.price) / property.price) * 100;
  
  // Format address
  const formatAddress = () => {
    if (typeof property.location === 'string') {
      return property.location;
    } else if (property.location) {
      return [
        property.location.address,
        property.location.city,
        property.location.state
      ].filter(Boolean).join(', ');
    }
    return 'Location not available';
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: property.images?.[0] || 'https://via.placeholder.com/300x200' }} 
          style={styles.image}
        />
        <View style={styles.badge}>
          <TrendingUp size={14} color={Colors.common.white} />
          <Text style={styles.badgeText}>Investment Pick</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.price}>${property.price.toLocaleString()}</Text>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        
        <View style={styles.addressContainer}>
          <MapPin size={14} color={Colors.text.muted} />
          <Text style={styles.address} numberOfLines={1}>{formatAddress()}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Home size={14} color={Colors.text.muted} />
            <Text style={styles.detailText}>
              {property.bedrooms} bd | {property.bathrooms} ba | {property.area} sqft
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Calendar size={14} color={Colors.text.muted} />
            <Text style={styles.detailText}>
              {property.details?.yearBuilt ? `Built ${property.details.yearBuilt}` : 'Year not available'}
            </Text>
          </View>
        </View>
        
        <View style={styles.investmentMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{prediction.growthRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Annual Growth</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>${Math.round(prediction.futureValue / 1000)}K</Text>
            <Text style={styles.metricLabel}>5-Year Value</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{roi.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>5-Year ROI</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primary.main,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.common.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 4,
    flex: 1,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.main,
    marginLeft: 6,
  },
  investmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    padding: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success.main,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.muted,
  },
});

export default InvestmentOpportunityCard;