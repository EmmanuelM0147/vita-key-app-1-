import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, AlertTriangle, Info, ArrowUpRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

type InsightType = 'trend' | 'alert' | 'info';

interface MarketInsightCardProps {
  title: string;
  description: string;
  type: InsightType;
  date: string;
  onPress?: () => void;
}

const MarketInsightCard: React.FC<MarketInsightCardProps> = ({
  title,
  description,
  type,
  date,
  onPress
}) => {
  const getIcon = () => {
    switch (type) {
      case 'trend':
        return <TrendingUp size={20} color={Colors.success.main} />;
      case 'alert':
        return <AlertTriangle size={20} color={Colors.warning.main} />;
      case 'info':
        return <Info size={20} color={Colors.primary.main} />;
      default:
        return <Info size={20} color={Colors.primary.main} />;
    }
  };
  
  const getCardStyle = () => {
    switch (type) {
      case 'trend':
        return [styles.container, { borderLeftColor: Colors.success.main }];
      case 'alert':
        return [styles.container, { borderLeftColor: Colors.warning.main }];
      case 'info':
        return [styles.container, { borderLeftColor: Colors.primary.main }];
      default:
        return styles.container;
    }
  };
  
  return (
    <TouchableOpacity style={getCardStyle()} onPress={onPress}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.date}>{date}</Text>
        
        {onPress && (
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Read more</Text>
            <ArrowUpRight size={14} color={Colors.primary.main} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.common.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginLeft: 12,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.text.main,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default MarketInsightCard;