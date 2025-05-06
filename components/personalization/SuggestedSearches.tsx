import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SuggestedSearchesProps {
  recentSearches: string[];
  suggestedSearches: string[];
  trendingSearches?: string[];
  onSearchPress: (query: string) => void;
}

export const SuggestedSearches: React.FC<SuggestedSearchesProps> = ({
  recentSearches,
  suggestedSearches,
  trendingSearches = [],
  onSearchPress,
}) => {
  // Filter out duplicates across all search types
  const uniqueRecentSearches = recentSearches.filter(
    search => !suggestedSearches.includes(search) && !trendingSearches.includes(search)
  ).slice(0, 3);
  
  const uniqueSuggestedSearches = suggestedSearches.filter(
    search => !trendingSearches.includes(search)
  ).slice(0, 3);
  
  const uniqueTrendingSearches = trendingSearches.slice(0, 3);
  
  if (
    uniqueRecentSearches.length === 0 &&
    uniqueSuggestedSearches.length === 0 &&
    uniqueTrendingSearches.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {uniqueRecentSearches.length > 0 && (
          <>
            {uniqueRecentSearches.map((search, index) => (
              <TouchableOpacity
                key={`recent-${index}`}
                style={styles.searchItem}
                onPress={() => onSearchPress(search)}
              >
                <Clock size={14} color={Colors.text.muted} />
                <Typography variant="body2" style={styles.searchText}>
                  {search}
                </Typography>
              </TouchableOpacity>
            ))}
          </>
        )}
        
        {uniqueSuggestedSearches.length > 0 && (
          <>
            {uniqueSuggestedSearches.map((search, index) => (
              <TouchableOpacity
                key={`suggested-${index}`}
                style={[styles.searchItem, styles.suggestedItem]}
                onPress={() => onSearchPress(search)}
              >
                <Search size={14} color={Colors.primary.main} />
                <Typography 
                  variant="body2" 
                  color={Colors.primary.main}
                  style={styles.searchText}
                >
                  {search}
                </Typography>
              </TouchableOpacity>
            ))}
          </>
        )}
        
        {uniqueTrendingSearches.length > 0 && (
          <>
            {uniqueTrendingSearches.map((search, index) => (
              <TouchableOpacity
                key={`trending-${index}`}
                style={[styles.searchItem, styles.trendingItem]}
                onPress={() => onSearchPress(search)}
              >
                <TrendingUp size={14} color={Colors.secondary.main} />
                <Typography 
                  variant="body2" 
                  color={Colors.secondary.main}
                  style={styles.searchText}
                >
                  {search}
                </Typography>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.xs,
  },
  suggestedItem: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[300],
  },
  trendingItem: {
    backgroundColor: Colors.secondary[100],
    borderColor: Colors.secondary[300],
  },
  searchText: {
    maxWidth: 150,
  },
});

export default SuggestedSearches;