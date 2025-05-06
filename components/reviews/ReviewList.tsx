import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ThumbsUp, Flag, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StarRating from '@/components/reviews/StarRating';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Review, ReviewType } from '@/types/review';
import useReviewsStore from '@/store/reviews-store';
import useAuthStore from '@/store/auth-store';

interface ReviewListProps {
  type: ReviewType;
  targetId: string;
  limit?: number;
  showViewMore?: boolean;
  onViewMorePress?: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  type,
  targetId,
  limit,
  showViewMore = true,
  onViewMorePress
}) => {
  const { fetchReviews, markReviewHelpful, reportReview, isLoading } = useReviewsStore();
  const { user } = useAuthStore();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  
  useEffect(() => {
    loadReviews();
  }, [targetId, type]);
  
  const loadReviews = async () => {
    try {
      const fetchedReviews = await fetchReviews(type, targetId);
      setReviews(sortReviews(fetchedReviews, sortOption));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };
  
  const sortReviews = (reviewsToSort: Review[], option: string) => {
    const sorted = [...reviewsToSort];
    
    switch (option) {
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'highest':
        return sorted.sort((a, b) => b.rating.overall - a.rating.overall);
      case 'lowest':
        return sorted.sort((a, b) => a.rating.overall - b.rating.overall);
      case 'helpful':
        return sorted.sort((a, b) => b.helpful - a.helpful);
      default:
        return sorted;
    }
  };
  
  const handleSortChange = (option: 'recent' | 'highest' | 'lowest' | 'helpful') => {
    setSortOption(option);
    setReviews(sortReviews(reviews, option));
  };
  
  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };
  
  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to mark reviews as helpful',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => {} } // Navigate to login
        ]
      );
      return;
    }
    
    try {
      await markReviewHelpful(reviewId);
      // Update the local state to reflect the change
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };
  
  const handleReportReview = (reviewId: string) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to report reviews',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => {} } // Navigate to login
        ]
      );
      return;
    }
    
    Alert.alert(
      'Report Review',
      'Why are you reporting this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => submitReport(reviewId, 'inappropriate') },
        { text: 'Spam', onPress: () => submitReport(reviewId, 'spam') },
        { text: 'False Information', onPress: () => submitReport(reviewId, 'false_info') },
      ]
    );
  };
  
  const submitReport = async (reviewId: string, reason: string) => {
    try {
      await reportReview(reviewId, reason);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review this content.'
      );
      
      // Update the local state to reflect the change
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId
            ? { ...review, reported: true }
            : review
        )
      );
    } catch (error) {
      console.error('Failed to report review:', error);
    }
  };
  
  const renderReviewItem = ({ item }: { item: Review }) => {
    const isExpanded = expandedReviews.includes(item.id);
    const reviewDate = new Date(item.createdAt).toLocaleDateString();
    const commentLength = item.comment.length;
    const shouldTruncate = commentLength > 150 && !isExpanded;
    
    return (
      <Card variant="outlined" style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Typography variant="h4" color={Colors.common.white}>
                {item.user?.name?.charAt(0) || 'U'}
              </Typography>
            </View>
            
            <View>
              <Typography variant="body1" weight="600">
                {item.user?.name || 'Anonymous User'}
              </Typography>
              
              <Typography variant="caption" color={Colors.text.muted}>
                {reviewDate}
              </Typography>
            </View>
          </View>
          
          <StarRating rating={item.rating.overall} size="sm" disabled />
        </View>
        
        {item.title && (
          <Typography variant="body1" weight="600" style={styles.reviewTitle}>
            {item.title}
          </Typography>
        )}
        
        <View style={styles.reviewContent}>
          <Typography variant="body2" style={styles.reviewComment}>
            {shouldTruncate ? `${item.comment.substring(0, 150)}...` : item.comment}
          </Typography>
          
          {commentLength > 150 && (
            <TouchableOpacity
              onPress={() => toggleExpandReview(item.id)}
              style={styles.expandButton}
            >
              <Typography variant="caption" color={Colors.primary.gold}>
                {isExpanded ? 'Show less' : 'Read more'}
              </Typography>
              {isExpanded ? (
                <ChevronUp size={16} color={Colors.primary.gold} />
              ) : (
                <ChevronDown size={16} color={Colors.primary.gold} />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Additional ratings for properties */}
        {type === ReviewType.PROPERTY && item.rating.location && (
          <View style={styles.additionalRatings}>
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Location
              </Typography>
              <StarRating rating={item.rating.location} size="sm" disabled />
            </View>
            
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Value
              </Typography>
              <StarRating rating={item.rating.value || 0} size="sm" disabled />
            </View>
            
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Accuracy
              </Typography>
              <StarRating rating={item.rating.accuracy || 0} size="sm" disabled />
            </View>
          </View>
        )}
        
        {/* Additional ratings for realtors */}
        {type === ReviewType.REALTOR && item.rating.professionalism && (
          <View style={styles.additionalRatings}>
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Professionalism
              </Typography>
              <StarRating rating={item.rating.professionalism} size="sm" disabled />
            </View>
            
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Responsiveness
              </Typography>
              <StarRating rating={item.rating.responsiveness || 0} size="sm" disabled />
            </View>
            
            <View style={styles.ratingItem}>
              <Typography variant="caption" color={Colors.text.muted}>
                Knowledge
              </Typography>
              <StarRating rating={item.rating.knowledge || 0} size="sm" disabled />
            </View>
          </View>
        )}
        
        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkHelpful(item.id)}
            disabled={item.reported}
          >
            <ThumbsUp size={16} color={Colors.text.muted} />
            <Typography variant="caption" color={Colors.text.muted} style={styles.actionText}>
              Helpful ({item.helpful})
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReportReview(item.id)}
            disabled={item.reported}
          >
            <Flag size={16} color={item.reported ? Colors.status.error : Colors.text.muted} />
            <Typography
              variant="caption"
              color={item.reported ? Colors.status.error : Colors.text.muted}
              style={styles.actionText}
            >
              {item.reported ? 'Reported' : 'Report'}
            </Typography>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };
  
  const displayedReviews = limit ? reviews.slice(0, limit) : reviews;
  
  if (isLoading && reviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="body1">Loading reviews...</Typography>
      </View>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <Card variant="outlined" style={styles.emptyContainer}>
        <Typography variant="body1" align="center">
          No reviews yet. Be the first to leave a review!
        </Typography>
      </Card>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <Typography variant="body2" color={Colors.text.muted}>
          Sort by:
        </Typography>
        
        <View style={styles.sortOptions}>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'recent' && styles.sortOptionActive]}
            onPress={() => handleSortChange('recent')}
          >
            <Typography
              variant="caption"
              color={sortOption === 'recent' ? Colors.primary.gold : Colors.text.muted}
            >
              Most Recent
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'highest' && styles.sortOptionActive]}
            onPress={() => handleSortChange('highest')}
          >
            <Typography
              variant="caption"
              color={sortOption === 'highest' ? Colors.primary.gold : Colors.text.muted}
            >
              Highest Rated
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'lowest' && styles.sortOptionActive]}
            onPress={() => handleSortChange('lowest')}
          >
            <Typography
              variant="caption"
              color={sortOption === 'lowest' ? Colors.primary.gold : Colors.text.muted}
            >
              Lowest Rated
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'helpful' && styles.sortOptionActive]}
            onPress={() => handleSortChange('helpful')}
          >
            <Typography
              variant="caption"
              color={sortOption === 'helpful' ? Colors.primary.gold : Colors.text.muted}
            >
              Most Helpful
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={displayedReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewsList}
        scrollEnabled={false}
      />
      
      {showViewMore && reviews.length > (limit || 0) && onViewMorePress && (
        <Button
          title="View All Reviews"
          variant="outline"
          size="sm"
          onPress={onViewMorePress}
          style={styles.viewMoreButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: Spacing.sm,
  },
  sortOption: {
    marginRight: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  sortOptionActive: {
    backgroundColor: Colors.primary.goldLight || '#f8e9c0', // Fallback color if goldLight is not defined
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    padding: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  reviewTitle: {
    marginBottom: Spacing.xs,
  },
  reviewContent: {
    marginBottom: Spacing.sm,
  },
  reviewComment: {
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  additionalRatings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  ratingItem: {
    alignItems: 'flex-start',
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    marginLeft: 4,
  },
  viewMoreButton: {
    marginTop: Spacing.md,
  },
});