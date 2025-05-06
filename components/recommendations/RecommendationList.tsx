import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import { Recommendation } from '@/types/recommendation';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface RecommendationListProps {
  title: string;
  subtitle?: string;
  recommendations: Recommendation[];
  isLoading: boolean;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  onExplainPress?: (recommendation: Recommendation) => void;
  horizontal?: boolean;
  compact?: boolean;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  title,
  subtitle,
  recommendations,
  isLoading,
  showSeeAll = true,
  onSeeAllPress,
  onExplainPress,
  horizontal = true,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Typography variant="h5">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color={Colors.text.muted}>
                {subtitle}
              </Typography>
            )}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Typography variant="body2" color={Colors.text.muted} style={styles.loadingText}>
            Finding the best matches for you...
          </Typography>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Typography variant="h5">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color={Colors.text.muted}>
                {subtitle}
              </Typography>
            )}
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Typography variant="body1" color={Colors.text.muted}>
            No recommendations available yet.
          </Typography>
          <Typography variant="body2" color={Colors.text.muted}>
            As you interact with more properties, we'll learn your preferences.
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Typography variant="h5">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color={Colors.text.muted}>
              {subtitle}
            </Typography>
          )}
        </View>
        
        {showSeeAll && onSeeAllPress && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
            <Typography variant="body2" color={Colors.primary.main}>
              See All
            </Typography>
            <ChevronRight size={16} color={Colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      {horizontal ? (
        <FlatList
          data={recommendations}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecommendationCard
              recommendation={item}
              onExplainPress={onExplainPress ? () => onExplainPress(item) : undefined}
              compact={compact}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalListContent}
        />
      ) : (
        <View style={styles.verticalList}>
          {recommendations.map((item) => (
            <RecommendationCard
              key={item.id}
              recommendation={item}
              onExplainPress={onExplainPress ? () => onExplainPress(item) : undefined}
              compact={compact}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalListContent: {
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
  },
  verticalList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
});

export default RecommendationList;