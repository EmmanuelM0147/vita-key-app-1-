import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react-native';
import { PricePrediction, PredictionConfidence } from '@/services/ai-prediction';
import Colors from '@/constants/colors';

interface PricePredictionCardProps {
  prediction: PricePrediction;
  onViewDetails?: () => void;
}

const PricePredictionCard: React.FC<PricePredictionCardProps> = ({ 
  prediction, 
  onViewDetails 
}) => {
  // Helper function to get confidence icon and color
  const getConfidenceDetails = () => {
    switch (prediction.confidence) {
      case PredictionConfidence.VeryHigh:
      case PredictionConfidence.High:
        return { 
          icon: <CheckCircle size={16} color={Colors.success.main} />,
          color: Colors.success.main
        };
      case PredictionConfidence.Moderate:
        return { 
          icon: <HelpCircle size={16} color={Colors.warning.main} />,
          color: Colors.warning.main
        };
      case PredictionConfidence.Low:
      case PredictionConfidence.VeryLow:
        return { 
          icon: <AlertTriangle size={16} color={Colors.error.main} />,
          color: Colors.error.main
        };
      default:
        return { 
          icon: <HelpCircle size={16} color={Colors.text.muted} />,
          color: Colors.text.muted
        };
    }
  };
  
  const confidenceDetails = getConfidenceDetails();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TrendingUp size={20} color={Colors.primary.main} />
          <Text style={styles.title}>AI Price Prediction</Text>
        </View>
        <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.predictionRow}>
          <Text style={styles.timeframe}>Current</Text>
          <Text style={styles.price}>${prediction.currentPrice.toLocaleString()}</Text>
          <Text style={styles.empty}></Text>
        </View>
        
        <View style={styles.predictionRow}>
          <Text style={styles.timeframe}>1 Year</Text>
          <Text style={styles.price}>${Math.round(prediction.predictedPrice1Year).toLocaleString()}</Text>
          <Text style={styles.growth}>+{prediction.growthRate1Year.toFixed(1)}%</Text>
        </View>
        
        <View style={styles.predictionRow}>
          <Text style={styles.timeframe}>3 Years</Text>
          <Text style={styles.price}>${Math.round(prediction.predictedPrice3Year).toLocaleString()}</Text>
          <Text style={styles.growth}>+{prediction.growthRate3Year.toFixed(1)}%</Text>
        </View>
        
        <View style={styles.predictionRow}>
          <Text style={styles.timeframe}>5 Years</Text>
          <Text style={styles.price}>${Math.round(prediction.predictedPrice5Year).toLocaleString()}</Text>
          <Text style={styles.growth}>+{prediction.growthRate5Year.toFixed(1)}%</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.confidenceContainer}>
          {confidenceDetails.icon}
          <Text style={[styles.confidenceText, { color: confidenceDetails.color }]}>
            {prediction.confidence} Confidence
          </Text>
        </View>
        <Text style={styles.disclaimer}>Based on historical data and market trends</Text>
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
  content: {
    marginBottom: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  timeframe: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.muted,
  },
  price: {
    flex: 2,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    textAlign: 'right',
  },
  growth: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.success.main,
    textAlign: 'right',
  },
  empty: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
});

export default PricePredictionCard;