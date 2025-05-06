import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ValuationFactor {
  factor: string;
  impact: number; // -10 to 10
  description: string;
}

interface ValuationFactorsProps {
  factors: ValuationFactor[];
}

const ValuationFactors: React.FC<ValuationFactorsProps> = ({ factors }) => {
  const renderImpactBar = (impact: number) => {
    const isPositive = impact >= 0;
    const absImpact = Math.abs(impact);
    const width = `${absImpact * 10}%`;
    const color = isPositive ? Colors.success.main : Colors.error.main;
    
    return (
      <View style={styles.impactBarContainer}>
        {!isPositive && (
          <View style={[styles.impactBar, styles.negativeBar, { width }]}>
            <TrendingDown size={14} color={Colors.white} style={styles.impactIcon} />
          </View>
        )}
        <View style={styles.impactBarCenter} />
        {isPositive && (
          <View style={[styles.impactBar, styles.positiveBar, { width }]}>
            <TrendingUp size={14} color={Colors.white} style={styles.impactIcon} />
          </View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valuation Factors</Text>
      <Text style={styles.subtitle}>
        Key factors that influenced your property's estimated value
      </Text>
      
      {factors.map((factor, index) => (
        <View key={index} style={styles.factorItem}>
          <View style={styles.factorHeader}>
            <Text style={styles.factorName}>{factor.factor}</Text>
            <Text style={[
              styles.impactValue,
              factor.impact >= 0 ? styles.positiveImpact : styles.negativeImpact
            ]}>
              {factor.impact >= 0 ? '+' : ''}{factor.impact}
            </Text>
          </View>
          
          {renderImpactBar(factor.impact)}
          
          <Text style={styles.factorDescription}>{factor.description}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  factorItem: {
    marginBottom: 20,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.main,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveImpact: {
    color: Colors.success.main,
  },
  negativeImpact: {
    color: Colors.error.main,
  },
  impactBarContainer: {
    flexDirection: 'row',
    height: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  impactBarCenter: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border.main,
  },
  impactBar: {
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  positiveBar: {
    backgroundColor: Colors.success.light,
  },
  negativeBar: {
    backgroundColor: Colors.error.light,
    alignItems: 'flex-start',
  },
  impactIcon: {
    marginHorizontal: 4,
  },
  factorDescription: {
    fontSize: 14,
    color: Colors.text.muted,
    lineHeight: 20,
  },
});

export default ValuationFactors;