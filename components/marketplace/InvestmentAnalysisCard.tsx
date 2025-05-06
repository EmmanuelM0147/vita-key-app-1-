import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertTriangle, DollarSign } from 'lucide-react-native';
import { InvestmentAnalysis, InvestmentPotential } from '@/services/ai-prediction';
import Colors from '@/constants/colors';

interface InvestmentAnalysisCardProps {
  analysis: InvestmentAnalysis;
  onViewDetails?: () => void;
}

const InvestmentAnalysisCard: React.FC<InvestmentAnalysisCardProps> = ({ 
  analysis, 
  onViewDetails 
}) => {
  // Helper function to get potential color
  const getPotentialColor = () => {
    switch (analysis.potential) {
      case InvestmentPotential.Excellent:
      case InvestmentPotential.VeryGood:
        return Colors.success.main;
      case InvestmentPotential.Good:
        return Colors.success.light;
      case InvestmentPotential.Fair:
        return Colors.warning.main;
      case InvestmentPotential.Poor:
        return Colors.error.main;
      default:
        return Colors.text.muted;
    }
  };
  
  // Helper function to get risk color
  const getRiskColor = () => {
    switch (analysis.riskLevel) {
      case 'Low':
        return Colors.success.main;
      case 'Medium':
        return Colors.warning.main;
      case 'High':
        return Colors.error.main;
      default:
        return Colors.text.muted;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <DollarSign size={20} color={Colors.primary.main} />
          <Text style={styles.title}>Investment Analysis</Text>
        </View>
        <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.potentialContainer}>
        <Text style={styles.potentialLabel}>Investment Potential:</Text>
        <Text style={[styles.potentialValue, { color: getPotentialColor() }]}>
          {analysis.potential}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.roiContainer}>
          <View style={styles.roiItem}>
            <Text style={styles.roiLabel}>1 Year ROI</Text>
            <Text style={styles.roiValue}>{analysis.roi1Year.toFixed(1)}%</Text>
          </View>
          <View style={styles.roiItem}>
            <Text style={styles.roiLabel}>3 Year ROI</Text>
            <Text style={styles.roiValue}>{analysis.roi3Year.toFixed(1)}%</Text>
          </View>
          <View style={styles.roiItem}>
            <Text style={styles.roiLabel}>5 Year ROI</Text>
            <Text style={styles.roiValue}>{analysis.roi5Year.toFixed(1)}%</Text>
          </View>
        </View>
        
        <View style={styles.riskContainer}>
          <Text style={styles.riskLabel}>Risk Level:</Text>
          <Text style={[styles.riskValue, { color: getRiskColor() }]}>
            {analysis.riskLevel}
          </Text>
        </View>
      </View>
      
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Key Insights:</Text>
        
        {analysis.strengths.length > 0 && (
          <View style={styles.insightItem}>
            <ArrowUpRight size={16} color={Colors.success.main} />
            <Text style={styles.insightText}>{analysis.strengths[0]}</Text>
          </View>
        )}
        
        {analysis.weaknesses.length > 0 && (
          <View style={styles.insightItem}>
            <ArrowDownRight size={16} color={Colors.error.main} />
            <Text style={styles.insightText}>{analysis.weaknesses[0]}</Text>
          </View>
        )}
        
        {analysis.opportunities.length > 0 && (
          <View style={styles.insightItem}>
            <TrendingUp size={16} color={Colors.primary.main} />
            <Text style={styles.insightText}>{analysis.opportunities[0]}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    marginLeft: 8,
  },
  detailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  potentialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  potentialLabel: {
    fontSize: 16,
    color: Colors.text.dark,
    fontWeight: '500',
  },
  potentialValue: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  content: {
    marginBottom: 16,
  },
  roiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roiItem: {
    alignItems: 'center',
    flex: 1,
  },
  roiLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success.main,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  riskLabel: {
    fontSize: 14,
    color: Colors.text.dark,
  },
  riskValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.dark,
    marginLeft: 8,
    flex: 1,
  },
});

export default InvestmentAnalysisCard;