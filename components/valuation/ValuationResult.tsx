import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Info, DollarSign, Home, MapPin, Calendar, Ruler, Bed, Bath } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ValuationResult as ValuationResultType } from '@/types/valuation';
import MarketComparison from './MarketComparison';
import ValuationFactors from './ValuationFactors';

interface ValuationResultProps {
  valuation: ValuationResultType;
  onBack?: () => void;
}

const ValuationResult: React.FC<ValuationResultProps> = ({ valuation, onBack }) => {
  const router = useRouter();
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  const renderConfidenceIndicator = (confidence: number) => {
    let color = Colors.success.main;
    let label = 'High';
    
    if (confidence < 75) {
      color = Colors.warning.main;
      label = 'Medium';
    } else if (confidence < 60) {
      color = Colors.error.main;
      label = 'Low';
    }
    
    return (
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence: {label}</Text>
        <View style={styles.confidenceBarContainer}>
          <View style={[styles.confidenceBar, { width: `${confidence}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.confidenceValue}>{confidence}%</Text>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={20} color={Colors.text.main} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.title}>Property Valuation</Text>
        <Text style={styles.address}>{valuation.propertyDetails.address}</Text>
        <Text style={styles.neighborhood}>{valuation.propertyDetails.neighborhood}</Text>
      </View>
      
      <View style={styles.valuationCard}>
        <Text style={styles.estimatedValueLabel}>Estimated Value</Text>
        <Text style={styles.estimatedValue}>{formatCurrency(valuation.estimatedValue)}</Text>
        <Text style={styles.valueRange}>
          Range: {formatCurrency(valuation.valueRange.min)} - {formatCurrency(valuation.valueRange.max)}
        </Text>
        
        {renderConfidenceIndicator(valuation.confidence)}
        
        <View style={styles.marketTrendsContainer}>
          <View style={styles.trendItem}>
            <View style={styles.trendIconContainer}>
              <TrendingUp size={20} color={Colors.success.main} />
            </View>
            <View>
              <Text style={styles.trendLabel}>Neighborhood Growth</Text>
              <Text style={styles.trendValue}>+{valuation.marketTrends.neighborhoodGrowth}%</Text>
            </View>
          </View>
          
          <View style={styles.trendItem}>
            <View style={styles.trendIconContainer}>
              <DollarSign size={20} color={Colors.primary.main} />
            </View>
            <View>
              <Text style={styles.trendLabel}>Price per Sq Ft</Text>
              <Text style={styles.trendValue}>${valuation.marketTrends.pricePerSqFt}</Text>
            </View>
          </View>
          
          <View style={styles.trendItem}>
            <View style={styles.trendIconContainer}>
              <TrendingUp size={20} color={Colors.success.main} />
            </View>
            <View>
              <Text style={styles.trendLabel}>City Growth</Text>
              <Text style={styles.trendValue}>+{valuation.marketTrends.cityGrowth}%</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.propertyDetailsCard}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Home size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.propertyType}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Bed size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Bedrooms</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.bedrooms}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Bath size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Bathrooms</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.bathrooms}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ruler size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Square Feet</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.squareFeet}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Calendar size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Year Built</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.yearBuilt}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={18} color={Colors.primary.main} />
            <Text style={styles.detailLabel}>Lot Size</Text>
            <Text style={styles.detailValue}>{valuation.propertyDetails.lotSize} acres</Text>
          </View>
        </View>
        
        {valuation.propertyDetails.features.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.featuresList}>
              {valuation.propertyDetails.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      
      <ValuationFactors factors={valuation.valuationFactors} />
      
      <MarketComparison comparableProperties={valuation.comparableProperties} />
      
      <View style={styles.disclaimer}>
        <Info size={16} color={Colors.text.muted} style={styles.disclaimerIcon} />
        <Text style={styles.disclaimerText}>
          This valuation is an estimate based on available data and market trends. 
          Actual property value may vary. For a more accurate valuation, 
          consult with a licensed real estate professional.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.main,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.main,
    marginBottom: 8,
  },
  address: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.main,
  },
  neighborhood: {
    fontSize: 16,
    color: Colors.text.muted,
  },
  valuationCard: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.text.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  estimatedValueLabel: {
    fontSize: 16,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  estimatedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.main,
  },
  valueRange: {
    fontSize: 16,
    color: Colors.text.muted,
    marginBottom: 16,
  },
  confidenceContainer: {
    marginVertical: 16,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.main,
    marginBottom: 8,
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    marginBottom: 4,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'right',
  },
  marketTrendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  trendLabel: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.main,
  },
  propertyDetailsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.text.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.main,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.main,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.main,
    marginBottom: 12,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  featureTag: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.main,
  },
  disclaimer: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    marginBottom: 32,
  },
  disclaimerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.muted,
    lineHeight: 20,
  },
});

export default ValuationResult;