import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { X, Camera, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import StarRating from '@/components/reviews/StarRating';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ReviewType, ReviewRating, ReviewFormData } from '@/types/review';
import useReviewsStore from '@/store/reviews-store';
import { imageUploadService } from '@/services/image-upload';

interface ReviewFormProps {
  type: ReviewType;
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  type,
  targetId,
  targetName,
  onSuccess,
  onCancel
}) => {
  const { addReview, isLoading, error, clearError } = useReviewsStore();
  
  // Form state
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [rating, setRating] = useState<ReviewRating>({
    overall: 0,
    // Property specific ratings
    location: type === ReviewType.PROPERTY ? 0 : undefined,
    value: type === ReviewType.PROPERTY ? 0 : undefined,
    accuracy: type === ReviewType.PROPERTY ? 0 : undefined,
    // Realtor specific ratings
    professionalism: type === ReviewType.REALTOR ? 0 : undefined,
    responsiveness: type === ReviewType.REALTOR ? 0 : undefined,
    knowledge: type === ReviewType.REALTOR ? 0 : undefined,
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle rating changes
  const handleRatingChange = (field: keyof ReviewRating, value: number) => {
    setRating(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle image upload
  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images per review.');
      return;
    }
    
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Show loading
        Alert.alert('Uploading', 'Please wait while we upload your image...');
        
        // Upload image
        const imageUrl = await imageUploadService.uploadImage(uri);
        
        // Add to images array
        setImages(prev => [...prev, imageUrl]);
        
        Alert.alert('Success', 'Image uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate overall rating
    if (rating.overall === 0) {
      newErrors.overall = 'Please provide an overall rating';
    }
    
    // Validate comment
    if (!comment.trim()) {
      newErrors.comment = 'Please provide a review comment';
    } else if (comment.length < 10) {
      newErrors.comment = 'Your review is too short. Please provide more details.';
    }
    
    // Check for profanity or abusive content
    const profanityList = ['badword1', 'badword2', 'badword3']; // Replace with actual profanity list
    const hasProfanity = profanityList.some(word => 
      comment.toLowerCase().includes(word) || (title && title.toLowerCase().includes(word))
    );
    
    if (hasProfanity) {
      newErrors.comment = 'Your review contains inappropriate language. Please revise.';
    }
    
    // Validate property-specific ratings
    if (type === ReviewType.PROPERTY) {
      if (!rating.location) newErrors.location = 'Please rate the location';
      if (!rating.value) newErrors.value = 'Please rate the value';
      if (!rating.accuracy) newErrors.accuracy = 'Please rate the accuracy';
    }
    
    // Validate realtor-specific ratings
    if (type === ReviewType.REALTOR) {
      if (!rating.professionalism) newErrors.professionalism = 'Please rate professionalism';
      if (!rating.responsiveness) newErrors.responsiveness = 'Please rate responsiveness';
      if (!rating.knowledge) newErrors.knowledge = 'Please rate knowledge';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const reviewData: ReviewFormData = {
        targetId,
        type,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined
      };
      
      await addReview(reviewData);
      
      Alert.alert(
        'Review Submitted',
        'Thank you for your review! It will be visible after moderation.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      // Reset form
      setTitle('');
      setComment('');
      setImages([]);
      setRating({
        overall: 0,
        location: type === ReviewType.PROPERTY ? 0 : undefined,
        value: type === ReviewType.PROPERTY ? 0 : undefined,
        accuracy: type === ReviewType.PROPERTY ? 0 : undefined,
        professionalism: type === ReviewType.REALTOR ? 0 : undefined,
        responsiveness: type === ReviewType.REALTOR ? 0 : undefined,
        knowledge: type === ReviewType.REALTOR ? 0 : undefined,
      });
      
    } catch (error) {
      // Error is already handled by the store
      console.error('Failed to submit review:', error);
    }
  };
  
  return (
    <Card variant="elevated" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h4">
            {type === ReviewType.PROPERTY ? 'Review Property' : 'Review Realtor'}
          </Typography>
          
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={20} color={Colors.text.dark} />
            </TouchableOpacity>
          )}
        </View>
        
        <Typography variant="body1" style={styles.targetName}>
          {targetName}
        </Typography>
        
        <View style={styles.ratingSection}>
          <Typography variant="body1" weight="600" style={styles.ratingLabel}>
            Overall Rating
          </Typography>
          
          <StarRating
            rating={rating.overall}
            onChange={(value) => handleRatingChange('overall', value)}
            size="lg"
          />
          
          {errors.overall && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.status.error} />
              <Typography variant="caption" color={Colors.status.error} style={styles.errorText}>
                {errors.overall}
              </Typography>
            </View>
          )}
        </View>
        
        {/* Property-specific ratings */}
        {type === ReviewType.PROPERTY && (
          <View style={styles.additionalRatings}>
            <Typography variant="body1" weight="600" style={styles.sectionTitle}>
              Rate Specific Aspects
            </Typography>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Location
              </Typography>
              <StarRating
                rating={rating.location || 0}
                onChange={(value) => handleRatingChange('location', value)}
                size="sm"
              />
              {errors.location && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.location}
                </Typography>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Value for Money
              </Typography>
              <StarRating
                rating={rating.value || 0}
                onChange={(value) => handleRatingChange('value', value)}
                size="sm"
              />
              {errors.value && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.value}
                </Typography>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Accuracy of Listing
              </Typography>
              <StarRating
                rating={rating.accuracy || 0}
                onChange={(value) => handleRatingChange('accuracy', value)}
                size="sm"
              />
              {errors.accuracy && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.accuracy}
                </Typography>
              )}
            </View>
          </View>
        )}
        
        {/* Realtor-specific ratings */}
        {type === ReviewType.REALTOR && (
          <View style={styles.additionalRatings}>
            <Typography variant="body1" weight="600" style={styles.sectionTitle}>
              Rate Specific Aspects
            </Typography>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Professionalism
              </Typography>
              <StarRating
                rating={rating.professionalism || 0}
                onChange={(value) => handleRatingChange('professionalism', value)}
                size="sm"
              />
              {errors.professionalism && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.professionalism}
                </Typography>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Responsiveness
              </Typography>
              <StarRating
                rating={rating.responsiveness || 0}
                onChange={(value) => handleRatingChange('responsiveness', value)}
                size="sm"
              />
              {errors.responsiveness && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.responsiveness}
                </Typography>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Typography variant="body2" style={styles.ratingAspect}>
                Knowledge
              </Typography>
              <StarRating
                rating={rating.knowledge || 0}
                onChange={(value) => handleRatingChange('knowledge', value)}
                size="sm"
              />
              {errors.knowledge && (
                <Typography variant="caption" color={Colors.status.error} style={styles.inlineError}>
                  {errors.knowledge}
                </Typography>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.formSection}>
          <Input
            label="Review Title (Optional)"
            value={title}
            onChangeText={setTitle}
            placeholder="Summarize your experience"
            maxLength={100}
          />
          
          <Input
            label="Your Review"
            value={comment}
            onChangeText={setComment}
            placeholder="Share details of your experience"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.commentInput}
            error={errors.comment}
          />
          
          <View style={styles.imagesSection}>
            <Typography variant="body2" weight="600" style={styles.imagesLabel}>
              Add Photos (Optional)
            </Typography>
            
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color={Colors.common.white} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                >
                  <Camera size={24} color={Colors.text.muted} />
                  <Typography variant="caption" color={Colors.text.muted}>
                    Add Photo
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.status.error} />
              <Typography variant="body2" color={Colors.status.error} style={styles.errorText}>
                {error}
              </Typography>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {onCancel && (
              <Button
                title="Cancel"
                variant="outline"
                onPress={onCancel}
                style={styles.cancelButton}
              />
            )}
            
            <Button
              title="Submit Review"
              variant="primary"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  targetName: {
    marginBottom: Spacing.md,
  },
  ratingSection: {
    marginBottom: Spacing.lg,
  },
  ratingLabel: {
    marginBottom: Spacing.xs,
  },
  additionalRatings: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingAspect: {
    width: 140,
    marginRight: Spacing.sm,
  },
  inlineError: {
    marginLeft: Spacing.sm,
  },
  formSection: {
    gap: Spacing.md,
  },
  commentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagesSection: {
    marginTop: Spacing.sm,
  },
  imagesLabel: {
    marginBottom: Spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.status.error,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.text.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2', // Light red background
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    marginLeft: Spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  cancelButton: {
    marginRight: Spacing.sm,
  },
  submitButton: {
    minWidth: 150,
  },
});