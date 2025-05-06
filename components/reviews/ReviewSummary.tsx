import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '@/components/ui/Typography';
import StarRating from '@/components/reviews/StarRating';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ReviewType, ReviewSummary as ReviewSummaryType } from '@/types/review';
import useReviewsStore from '@/store/reviews-store';

interface ReviewSummaryProps {
  type: ReviewType;
  targetId: string;
  compact?: boolean;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  type,
  targetId,
  compact = false
}) => {
  const { fetchReviewSummary, isLoading } = useReviewsStore();
  const [summary, setSummary] = useState<ReviewSummaryType | null>(null);
  
  useEffect(() => {
    loadSummary();
  }, [targetId, type]);
  
  const loadSummary = async () => {
    try {
      const data = await fetchReviewSummary(type, targetId);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load review summary:', error);
    }
  };
  
  if (isLoading && !summary) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <Typography variant="body2">Loading ratings...</Typography>
      </View>
    );
  }
  
  if (!summary) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <Typography variant="body2">No ratings yet</Typography>
      </View>
    );
  }
  
  // Compact version (for cards, lists, etc.)
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <StarRating rating={summary.averageRating} size="sm" disabled />
        <Typography variant="caption" color={Colors.text.muted} style={styles.reviewCount}>
          ({summary.totalReviews})
        </Typography>
      </View>
    );
  }
  
  // Full version (for detail pages)
  return (
    <View style={styles.container}>
      <View style={styles.overallRating}>
        <Typography variant="h2" style={styles.ratingNumber}>
          {summary.averageRating.toFixed(1)}
        </Typography>
        
        <View style={styles.ratingDetails}>
          <StarRating rating={summary.averageRating} size="md" disabled />
          <Typography variant="body2" color={Colors.text.muted}>
            {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </Typography>
        </View>
      </View>
      
      <View style={styles.ratingDistribution}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.distributionRow}>
            <Typography variant="body2" style={styles.starLabel}>
              {star}
            </Typography>
            
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(summary.ratingDistribution[star as keyof typeof summary.ratingDistribution] / summary.totalReviews) * 100}%`,
                  },
                ]}
              />
            </View>
            
            <Typography variant="body2" style={styles.distributionCount}>
              {summary.ratingDistribution[star as keyof typeof summary.ratingDistribution]}
            </Typography>
          </View>
        ))}
      </View>
      
      {/* Property-specific ratings */}
      {type === ReviewType.PROPERTY && summary.locationRating && (
        <View style={styles.specificRatings}>
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Location</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.locationRating} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {summary.locationRating.toFixed(1)}
              </Typography>
            </View>
          </View>
          
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Value</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.valueRating || 0} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {(summary.valueRating || 0).toFixed(1)}
              </Typography>
            </View>
          </View>
          
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Accuracy</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.accuracyRating || 0} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {(summary.accuracyRating || 0).toFixed(1)}
              </Typography>
            </View>
          </View>
        </View>
      )}
      
      {/* Realtor-specific ratings */}
      {type === ReviewType.REALTOR && summary.professionalismRating && (
        <View style={styles.specificRatings}>
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Professionalism</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.professionalismRating} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {summary.professionalismRating.toFixed(1)}
              </Typography>
            </View>
          </View>
          
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Responsiveness</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.responsivenessRating || 0} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {(summary.responsivenessRating || 0).toFixed(1)}
              </Typography>
            </View>
          </View>
          
          <View style={styles.specificRatingItem}>
            <Typography variant="body2">Knowledge</Typography>
            <View style={styles.specificRatingValue}>
              <StarRating rating={summary.knowledgeRating || 0} size="sm" disabled />
              <Typography variant="body2" style={styles.ratingValue}>
                {(summary.knowledgeRating || 0).toFixed(1)}
              </Typography>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 4,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingNumber: {
    marginRight: Spacing.md,
  },
  ratingDetails: {
    flex: 1,
  },
  ratingDistribution: {
    marginBottom: Spacing.md,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starLabel: {
    width: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary.gold,
    borderRadius: BorderRadius.full,
  },
  distributionCount: {
    width: 30,
    textAlign: 'right',
  },
  specificRatings: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
    paddingTop: Spacing.md,
  },
  specificRatingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  specificRatingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
});

export default ReviewSummary;