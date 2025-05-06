import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, BarChart3 } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MarketInsightProps {
  title: string;
  content: string;
  type?: 'trend' | 'stat';
}

export default function MarketInsight({ 
  title, 
  content, 
  type = 'trend' 
}: MarketInsightProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {type === 'trend' ? (
          <TrendingUp size={20} color={Colors.primary} />
        ) : (
          <BarChart3 size={20} color={Colors.primary} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.dark,
  },
});