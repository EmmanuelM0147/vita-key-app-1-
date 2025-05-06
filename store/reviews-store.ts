import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review, ReviewType, ReviewSummary, ReviewFormData } from '@/types/review';
import { mockApi } from '@/services/api';
import useAuthStore from './auth-store';

interface ReviewsState {
  reviews: Review[];
  userReviews: Record<string, Review[]>;
  propertyReviews: Record<string, Review[]>;
  realtorReviews: Record<string, Review[]>;
  reviewSummaries: Record<string, ReviewSummary>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReviews: (type: ReviewType, targetId: string) => Promise<Review[]>;
  fetchUserReviews: (userId: string) => Promise<Review[]>;
  fetchReviewSummary: (type: ReviewType, targetId: string) => Promise<ReviewSummary>;
  addReview: (reviewData: ReviewFormData) => Promise<Review>;
  updateReview: (reviewId: string, reviewData: Partial<ReviewFormData>) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  markReviewHelpful: (reviewId: string) => Promise<void>;
  reportReview: (reviewId: string, reason: string) => Promise<void>;
  hasUserReviewed: (userId: string, type: ReviewType, targetId: string) => boolean;
  clearError: () => void;
}

const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      userReviews: {},
      propertyReviews: {},
      realtorReviews: {},
      reviewSummaries: {},
      isLoading: false,
      error: null,

      fetchReviews: async (type: ReviewType, targetId: string) => {
        set({ isLoading: true, error: null });
        try {
          const reviews = await mockApi.reviews.getByTarget(type, targetId);
          
          if (type === ReviewType.PROPERTY) {
            set(state => ({
              propertyReviews: {
                ...state.propertyReviews,
                [targetId]: reviews
              }
            }));
          } else {
            set(state => ({
              realtorReviews: {
                ...state.realtorReviews,
                [targetId]: reviews
              }
            }));
          }
          
          set({ isLoading: false });
          return reviews;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch reviews' 
          });
          return [];
        }
      },

      fetchUserReviews: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const reviews = await mockApi.reviews.getByUser(userId);
          set(state => ({
            userReviews: {
              ...state.userReviews,
              [userId]: reviews
            }
          }));
          set({ isLoading: false });
          return reviews;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch user reviews' 
          });
          return [];
        }
      },

      fetchReviewSummary: async (type: ReviewType, targetId: string) => {
        set({ isLoading: true, error: null });
        try {
          const summary = await mockApi.reviews.getSummary(type, targetId);
          set(state => ({
            reviewSummaries: {
              ...state.reviewSummaries,
              [`${type}_${targetId}`]: summary
            }
          }));
          set({ isLoading: false });
          return summary;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch review summary' 
          });
          return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }
      },

      addReview: async (reviewData: ReviewFormData) => {
        set({ isLoading: true, error: null });
        try {
          const user = useAuthStore.getState().user;
          if (!user) {
            throw new Error('You must be logged in to leave a review');
          }
          
          // Check if user has already reviewed this target
          if (get().hasUserReviewed(user.id, reviewData.type, reviewData.targetId)) {
            throw new Error('You have already reviewed this item');
          }
          
          const review = await mockApi.reviews.create({
            ...reviewData,
            userId: user.id,
          });
          
          // Update the appropriate review collection
          if (reviewData.type === ReviewType.PROPERTY) {
            set(state => ({
              propertyReviews: {
                ...state.propertyReviews,
                [reviewData.targetId]: [
                  review,
                  ...(state.propertyReviews[reviewData.targetId] || [])
                ]
              }
            }));
          } else {
            set(state => ({
              realtorReviews: {
                ...state.realtorReviews,
                [reviewData.targetId]: [
                  review,
                  ...(state.realtorReviews[reviewData.targetId] || [])
                ]
              }
            }));
          }
          
          // Update user reviews
          set(state => ({
            userReviews: {
              ...state.userReviews,
              [user.id]: [
                review,
                ...(state.userReviews[user.id] || [])
              ]
            }
          }));
          
          // Invalidate the summary cache
          const summaryKey = `${reviewData.type}_${reviewData.targetId}`;
          const currentSummaries = { ...get().reviewSummaries };
          delete currentSummaries[summaryKey];
          set({ reviewSummaries: currentSummaries });
          
          set({ isLoading: false });
          return review;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add review' 
          });
          throw error;
        }
      },

      updateReview: async (reviewId: string, reviewData: Partial<ReviewFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const review = await mockApi.reviews.update(reviewId, reviewData);
          
          // Update all relevant collections
          set(state => {
            const updatedReviews = state.reviews.map(r => 
              r.id === reviewId ? review : r
            );
            
            // Update property reviews if needed
            const updatedPropertyReviews = { ...state.propertyReviews };
            if (review.type === ReviewType.PROPERTY) {
              const propertyId = review.targetId;
              if (updatedPropertyReviews[propertyId]) {
                updatedPropertyReviews[propertyId] = updatedPropertyReviews[propertyId].map(r => 
                  r.id === reviewId ? review : r
                );
              }
            }
            
            // Update realtor reviews if needed
            const updatedRealtorReviews = { ...state.realtorReviews };
            if (review.type === ReviewType.REALTOR) {
              const realtorId = review.targetId;
              if (updatedRealtorReviews[realtorId]) {
                updatedRealtorReviews[realtorId] = updatedRealtorReviews[realtorId].map(r => 
                  r.id === reviewId ? review : r
                );
              }
            }
            
            // Update user reviews
            const updatedUserReviews = { ...state.userReviews };
            const userId = review.userId;
            if (updatedUserReviews[userId]) {
              updatedUserReviews[userId] = updatedUserReviews[userId].map(r => 
                r.id === reviewId ? review : r
              );
            }
            
            // Invalidate the summary cache
            const summaryKey = `${review.type}_${review.targetId}`;
            const currentSummaries = { ...state.reviewSummaries };
            delete currentSummaries[summaryKey];
            
            return {
              reviews: updatedReviews,
              propertyReviews: updatedPropertyReviews,
              realtorReviews: updatedRealtorReviews,
              userReviews: updatedUserReviews,
              reviewSummaries: currentSummaries
            };
          });
          
          set({ isLoading: false });
          return review;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update review' 
          });
          throw error;
        }
      },

      deleteReview: async (reviewId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Find the review first to know which collections to update
          const reviewToDelete = get().reviews.find(r => r.id === reviewId);
          if (!reviewToDelete) {
            throw new Error('Review not found');
          }
          
          await mockApi.reviews.delete(reviewId);
          
          // Update all relevant collections
          set(state => {
            const updatedReviews = state.reviews.filter(r => r.id !== reviewId);
            
            // Update property reviews if needed
            const updatedPropertyReviews = { ...state.propertyReviews };
            if (reviewToDelete.type === ReviewType.PROPERTY) {
              const propertyId = reviewToDelete.targetId;
              if (updatedPropertyReviews[propertyId]) {
                updatedPropertyReviews[propertyId] = updatedPropertyReviews[propertyId].filter(r => 
                  r.id !== reviewId
                );
              }
            }
            
            // Update realtor reviews if needed
            const updatedRealtorReviews = { ...state.realtorReviews };
            if (reviewToDelete.type === ReviewType.REALTOR) {
              const realtorId = reviewToDelete.targetId;
              if (updatedRealtorReviews[realtorId]) {
                updatedRealtorReviews[realtorId] = updatedRealtorReviews[realtorId].filter(r => 
                  r.id !== reviewId
                );
              }
            }
            
            // Update user reviews
            const updatedUserReviews = { ...state.userReviews };
            const userId = reviewToDelete.userId;
            if (updatedUserReviews[userId]) {
              updatedUserReviews[userId] = updatedUserReviews[userId].filter(r => 
                r.id !== reviewId
              );
            }
            
            // Invalidate the summary cache
            const summaryKey = `${reviewToDelete.type}_${reviewToDelete.targetId}`;
            const currentSummaries = { ...state.reviewSummaries };
            delete currentSummaries[summaryKey];
            
            return {
              reviews: updatedReviews,
              propertyReviews: updatedPropertyReviews,
              realtorReviews: updatedRealtorReviews,
              userReviews: updatedUserReviews,
              reviewSummaries: currentSummaries
            };
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete review' 
          });
          throw error;
        }
      },

      markReviewHelpful: async (reviewId: string) => {
        set({ isLoading: true, error: null });
        try {
          await mockApi.reviews.markHelpful(reviewId);
          
          // Update the review in all collections
          set(state => {
            const updatedReviews = state.reviews.map(r => {
              if (r.id === reviewId) {
                return { ...r, helpful: r.helpful + 1 };
              }
              return r;
            });
            
            // Update property reviews
            const updatedPropertyReviews = { ...state.propertyReviews };
            Object.keys(updatedPropertyReviews).forEach(propertyId => {
              updatedPropertyReviews[propertyId] = updatedPropertyReviews[propertyId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, helpful: r.helpful + 1 };
                }
                return r;
              });
            });
            
            // Update realtor reviews
            const updatedRealtorReviews = { ...state.realtorReviews };
            Object.keys(updatedRealtorReviews).forEach(realtorId => {
              updatedRealtorReviews[realtorId] = updatedRealtorReviews[realtorId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, helpful: r.helpful + 1 };
                }
                return r;
              });
            });
            
            // Update user reviews
            const updatedUserReviews = { ...state.userReviews };
            Object.keys(updatedUserReviews).forEach(userId => {
              updatedUserReviews[userId] = updatedUserReviews[userId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, helpful: r.helpful + 1 };
                }
                return r;
              });
            });
            
            return {
              reviews: updatedReviews,
              propertyReviews: updatedPropertyReviews,
              realtorReviews: updatedRealtorReviews,
              userReviews: updatedUserReviews
            };
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to mark review as helpful' 
          });
        }
      },

      reportReview: async (reviewId: string, reason: string) => {
        set({ isLoading: true, error: null });
        try {
          await mockApi.reviews.report(reviewId, reason);
          
          // Mark the review as reported in all collections
          set(state => {
            const updatedReviews = state.reviews.map(r => {
              if (r.id === reviewId) {
                return { ...r, reported: true };
              }
              return r;
            });
            
            // Update property reviews
            const updatedPropertyReviews = { ...state.propertyReviews };
            Object.keys(updatedPropertyReviews).forEach(propertyId => {
              updatedPropertyReviews[propertyId] = updatedPropertyReviews[propertyId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, reported: true };
                }
                return r;
              });
            });
            
            // Update realtor reviews
            const updatedRealtorReviews = { ...state.realtorReviews };
            Object.keys(updatedRealtorReviews).forEach(realtorId => {
              updatedRealtorReviews[realtorId] = updatedRealtorReviews[realtorId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, reported: true };
                }
                return r;
              });
            });
            
            // Update user reviews
            const updatedUserReviews = { ...state.userReviews };
            Object.keys(updatedUserReviews).forEach(userId => {
              updatedUserReviews[userId] = updatedUserReviews[userId].map(r => {
                if (r.id === reviewId) {
                  return { ...r, reported: true };
                }
                return r;
              });
            });
            
            return {
              reviews: updatedReviews,
              propertyReviews: updatedPropertyReviews,
              realtorReviews: updatedRealtorReviews,
              userReviews: updatedUserReviews
            };
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to report review' 
          });
        }
      },

      hasUserReviewed: (userId: string, type: ReviewType, targetId: string) => {
        const userReviews = get().userReviews[userId] || [];
        return userReviews.some(review => 
          review.type === type && review.targetId === targetId
        );
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist user reviews to reduce storage size
        userReviews: state.userReviews
      }),
    }
  )
);

export default useReviewsStore;