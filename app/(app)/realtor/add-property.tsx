import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, MapPin, DollarSign, Home, BedDouble, Bath, Square, Plus, X, Check } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';
import { pickImage, uploadImage } from '@/services/image-upload';
import { PropertyFormData, PropertyStatus } from '@/types/property';

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  price: '',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  images: [],
  amenities: [],
};

const commonAmenities = [
  'Parking', 'Air Conditioning', 'Heating', 'Washer/Dryer', 
  'Gym', 'Pool', 'Elevator', 'Balcony', 'Terrace', 
  'Security System', 'Fireplace', 'Garden'
];

export default function AddProperty() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addProperty, isLoading: isSubmitting } = usePropertiesStore();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagePick = async () => {
    if (formData.images.length >= 10) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 10 images per property.');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await pickImage();
      if (result.success && result.uri) {
        const uploadResult = await uploadImage(result.uri);
        if (uploadResult.success && uploadResult.uri) {
          setFormData(prev => {
            // Only add the URI if it's defined
            const newImages = [...prev.images];
            if (uploadResult.uri) {
              newImages.push(uploadResult.uri);
            }
            return {
              ...prev,
              images: newImages
            };
          });
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const amenities = [...prev.amenities];
      const index = amenities.indexOf(amenity);
      
      if (index === -1) {
        amenities.push(amenity);
      } else {
        amenities.splice(index, 1);
      }
      
      return { ...prev, amenities };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const required = ['title', 'price', 'location', 'bedrooms', 'bathrooms', 'area'];
    
    required.forEach(field => {
      if (!formData[field as keyof PropertyFormData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (formData.bedrooms && isNaN(Number(formData.bedrooms))) {
      newErrors.bedrooms = 'Bedrooms must be a valid number';
    }
    
    if (formData.bathrooms && isNaN(Number(formData.bathrooms))) {
      newErrors.bathrooms = 'Bathrooms must be a valid number';
    }
    
    if (formData.area && isNaN(Number(formData.area))) {
      newErrors.area = 'Area must be a valid number';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const newProperty = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        agentId: user?.id || '',
        status: 'active' as PropertyStatus,
        createdAt: new Date().toISOString(),
      };
      
      await addProperty(newProperty);
      Alert.alert(
        'Success', 
        'Property added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add property. Please try again.');
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = user?.subscription?.status === 'active';
  const isBasicPlan = user?.subscription?.plan === 'basic';
  
  // Get property count for basic plan users
  const { properties } = usePropertiesStore();
  const userProperties = properties.filter(p => p.agentId === user?.id);
  const reachedBasicLimit = isBasicPlan && userProperties.length >= 10;

  if (!hasActiveSubscription) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Subscription Required
          </Typography>
          <Typography variant="body1" style={styles.subtitle}>
            You need an active subscription to add properties.
          </Typography>
          <Button 
            title="View Subscription Plans" 
            onPress={() => router.push('/realtor/subscription')}
            style={styles.subscriptionButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (reachedBasicLimit) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Listing Limit Reached
          </Typography>
          <Typography variant="body1" style={styles.subtitle}>
            You've reached the 10 property limit for the Basic plan.
          </Typography>
          <Button 
            title="Upgrade to Premium" 
            onPress={() => router.push('/realtor/subscription')}
            style={styles.subscriptionButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Add New Property
          </Typography>

          <Card variant="elevated" style={styles.formCard}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Basic Information
            </Typography>

            <Input
              label="Property Title"
              placeholder="Enter property title"
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              error={errors.title}
              leftIcon={<Home size={20} color={Colors.text.muted} />}
            />

            <Input
              label="Description"
              placeholder="Describe the property"
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />

            <Input
              label="Price ($)"
              placeholder="Enter price"
              value={formData.price}
              onChangeText={(text) => handleChange('price', text)}
              keyboardType="numeric"
              error={errors.price}
              leftIcon={<DollarSign size={20} color={Colors.text.muted} />}
            />

            <Input
              label="Location"
              placeholder="Enter property address"
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              error={errors.location}
              leftIcon={<MapPin size={20} color={Colors.text.muted} />}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Bedrooms"
                  placeholder="Number"
                  value={formData.bedrooms}
                  onChangeText={(text) => handleChange('bedrooms', text)}
                  keyboardType="numeric"
                  error={errors.bedrooms}
                  leftIcon={<BedDouble size={20} color={Colors.text.muted} />}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Bathrooms"
                  placeholder="Number"
                  value={formData.bathrooms}
                  onChangeText={(text) => handleChange('bathrooms', text)}
                  keyboardType="numeric"
                  error={errors.bathrooms}
                  leftIcon={<Bath size={20} color={Colors.text.muted} />}
                />
              </View>
            </View>

            <Input
              label="Area (sq ft)"
              placeholder="Enter area"
              value={formData.area}
              onChangeText={(text) => handleChange('area', text)}
              keyboardType="numeric"
              error={errors.area}
              leftIcon={<Square size={20} color={Colors.text.muted} />}
            />
          </Card>

          <Card variant="elevated" style={styles.formCard}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Property Images
            </Typography>
            
            <Typography variant="body2" color={Colors.text.muted} style={styles.imageHelp}>
              Upload up to 10 high-quality images of your property
            </Typography>

            {errors.images && (
              <Typography variant="body2" color={Colors.status.error} style={styles.errorText}>
                {errors.images}
              </Typography>
            )}

            <View style={styles.imagesContainer}>
              {formData.images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color={Colors.common.white} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  uploadingImage && styles.addImageButtonDisabled
                ]}
                onPress={handleImagePick}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={Colors.primary.main} />
                ) : (
                  <>
                    <Camera size={24} color={Colors.primary.main} />
                    <Typography
                      variant="body2"
                      color={Colors.primary.main}
                      style={styles.addImageText}
                    >
                      Add Image
                    </Typography>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          <Card variant="elevated" style={styles.formCard}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Amenities
            </Typography>
            
            <Typography variant="body2" color={Colors.text.muted} style={styles.amenitiesHelp}>
              Select all amenities that apply to this property
            </Typography>

            <View style={styles.amenitiesContainer}>
              {commonAmenities.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityItem,
                    formData.amenities.includes(amenity) && styles.amenitySelected
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <View style={[
                    styles.amenityCheckbox,
                    formData.amenities.includes(amenity) && styles.amenityCheckboxSelected
                  ]}>
                    {formData.amenities.includes(amenity) && (
                      <Check size={14} color={Colors.common.white} />
                    )}
                  </View>
                  <Typography
                    variant="body2"
                    color={
                      formData.amenities.includes(amenity)
                        ? Colors.primary.main
                        : Colors.text.dark
                    }
                  >
                    {amenity}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button
            title="Add Property"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    color: Colors.text.muted,
  },
  subscriptionButton: {
    marginTop: Spacing.lg,
  },
  formCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.common.white,
  },
  addImageButtonDisabled: {
    opacity: 0.5,
  },
  addImageText: {
    marginTop: Spacing.xs,
  },
  imageHelp: {
    marginBottom: Spacing.md,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  amenitiesHelp: {
    marginBottom: Spacing.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary.sage,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.common.white,
  },
  amenitySelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light,
  },
  amenityCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  amenityCheckboxSelected: {
    backgroundColor: Colors.primary.main,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  errorText: {
    marginBottom: Spacing.sm,
  },
});