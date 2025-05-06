import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Upload, Search, ImagePlus } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import imageRecognitionService from '@/services/image-recognition';
import { Property, PropertyFeature } from '@/types/property';

interface ImageSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (imageUri: string, features: PropertyFeature[]) => void;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (visible) {
      setImageUri(null);
      setAnalysisResult(null);
      setPermissionError(null);
    }
  }, [visible]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permission to access camera roll is required!');
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permission to access camera is required!');
        return;
      }

      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setImageUri(result.assets[0].uri);
          analyzeImage(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    } else {
      setPermissionError('Camera is not available on web');
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await imageRecognitionService.analyzePropertyImage(uri);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = () => {
    if (imageUri && analysisResult) {
      onSearch(imageUri, analysisResult.detectedFeatures || []);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">Visual Property Search</Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          </View>

          {permissionError ? (
            <View style={styles.errorContainer}>
              <Typography variant="body1" color={Colors.status.error}>
                {permissionError}
              </Typography>
              <Button 
                title="OK" 
                onPress={() => setPermissionError(null)} 
                style={styles.errorButton}
              />
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!imageUri ? (
                  <View style={styles.uploadContainer}>
                    <View style={styles.placeholderImage}>
                      <ImagePlus size={64} color={Colors.text.muted} />
                      <Typography 
                        variant="body1" 
                        color={Colors.text.muted}
                        style={styles.uploadText}
                      >
                        Upload or take a photo of a property to search for similar listings
                      </Typography>
                    </View>
                    
                    <View style={styles.uploadButtons}>
                      <Button
                        title="Choose from Gallery"
                        onPress={pickImage}
                        variant="outline"
                        leftIcon={<Upload size={18} color={Colors.primary[500]} />}
                        style={styles.uploadButton}
                      />
                      
                      {Platform.OS !== 'web' && (
                        <Button
                          title="Take a Photo"
                          onPress={takePhoto}
                          variant="outline"
                          leftIcon={<Camera size={18} color={Colors.primary[500]} />}
                          style={styles.uploadButton}
                        />
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    
                    <TouchableOpacity 
                      style={styles.changeImageButton}
                      onPress={() => {
                        setImageUri(null);
                        setAnalysisResult(null);
                      }}
                    >
                      <Typography variant="body2" color={Colors.primary[500]}>
                        Change Image
                      </Typography>
                    </TouchableOpacity>
                    
                    {isAnalyzing ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary[500]} />
                        <Typography variant="body2" style={styles.loadingText}>
                          Analyzing image...
                        </Typography>
                      </View>
                    ) : analysisResult ? (
                      <View style={styles.analysisContainer}>
                        <Typography variant="h5" style={styles.analysisTitle}>
                          Detected Features
                        </Typography>
                        
                        <View style={styles.featuresList}>
                          {analysisResult.propertyType && (
                            <View style={styles.featureItem}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Property Type:
                              </Typography>
                              <Typography variant="body1" style={styles.featureValue}>
                                {analysisResult.propertyType.charAt(0).toUpperCase() + 
                                  analysisResult.propertyType.slice(1)}
                              </Typography>
                            </View>
                          )}
                          
                          {analysisResult.estimatedBedrooms && (
                            <View style={styles.featureItem}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Bedrooms:
                              </Typography>
                              <Typography variant="body1" style={styles.featureValue}>
                                ~{analysisResult.estimatedBedrooms}
                              </Typography>
                            </View>
                          )}
                          
                          {analysisResult.estimatedBathrooms && (
                            <View style={styles.featureItem}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Bathrooms:
                              </Typography>
                              <Typography variant="body1" style={styles.featureValue}>
                                ~{analysisResult.estimatedBathrooms}
                              </Typography>
                            </View>
                          )}
                          
                          {analysisResult.architecturalStyle && (
                            <View style={styles.featureItem}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Style:
                              </Typography>
                              <Typography variant="body1" style={styles.featureValue}>
                                {analysisResult.architecturalStyle}
                              </Typography>
                            </View>
                          )}
                          
                          {analysisResult.condition && (
                            <View style={styles.featureItem}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Condition:
                              </Typography>
                              <Typography variant="body1" style={styles.featureValue}>
                                {analysisResult.condition.charAt(0).toUpperCase() + 
                                  analysisResult.condition.slice(1)}
                              </Typography>
                            </View>
                          )}
                          
                          {analysisResult.detectedFeatures && 
                           analysisResult.detectedFeatures.length > 0 && (
                            <View style={styles.detectedFeatures}>
                              <Typography variant="body2" style={styles.featureLabel}>
                                Other Features:
                              </Typography>
                              {analysisResult.detectedFeatures.map((feature: PropertyFeature, index: number) => (
                                <View key={index} style={styles.detectedFeature}>
                                  <Typography variant="body2">
                                    • {feature.name}
                                    {feature.description ? `: ${feature.description}` : ''}
                                  </Typography>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.actionButtons}>
                <Button
                  title="Cancel"
                  onPress={onClose}
                  variant="outline"
                  style={styles.actionButton}
                />
                
                <Button
                  title="Search Similar Properties"
                  onPress={handleSearch}
                  leftIcon={<Search size={18} color={Colors.common.white} />}
                  disabled={!imageUri || isAnalyzing || !analysisResult}
                  style={styles.actionButton}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollContent: {
    maxHeight: '70%',
  },
  uploadContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderStyle: 'dashed',
  },
  uploadText: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  uploadButtons: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  uploadButton: {
    marginBottom: Spacing.sm,
  },
  imagePreviewContainer: {
    padding: Spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  changeImageButton: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
  },
  analysisContainer: {
    marginTop: Spacing.lg,
  },
  analysisTitle: {
    marginBottom: Spacing.sm,
  },
  featuresList: {
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  featureLabel: {
    color: Colors.text.muted,
  },
  featureValue: {
    fontWeight: '500',
  },
  detectedFeatures: {
    marginTop: Spacing.sm,
  },
  detectedFeature: {
    marginTop: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  errorContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorButton: {
    marginTop: Spacing.md,
  },
});

export default ImageSearchModal;