import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Share, 
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePropertiesStore } from '@/store/properties-store';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import ImageGallery from '@/components/marketplace/ImageGallery';
import PropertyDetails from '@/components/marketplace/PropertyDetails';
import AmenityItem from '@/components/marketplace/AmenityItem';
import InquiryForm from '@/components/marketplace/InquiryForm';
import PricePredictionCard from '@/components/marketplace/PricePredictionCard';
import InvestmentAnalysisCard from '@/components/marketplace/InvestmentAnalysisCard';
import MarketTrendChart from '@/components/marketplace/MarketTrendChart';
import { PropertyAnalysis } from '@/services/ai-prediction';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPropertyById, toggleFavorite, isFavorite } = usePropertiesStore();
  const { analyzeProperty, propertyAnalyses } = useAIAnalysisStore();
  
  const property = getPropertyById(id);
  const [isPropertyFavorite, setIsPropertyFavorite] = useState(
    property ? isFavorite(property.id) : false
  );
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  useEffect(() => {
    if (property) {
      // Check if we already have an analysis for this property
      const existingAnalysis = propertyAnalyses[property.id];
      
      if (existingAnalysis) {
        setAnalysis(existingAnalysis);
      } else {
        // Generate a new analysis
        setIsAnalysisLoading(true);
        analyzeProperty(property.id)
          .then(newAnalysis => {
            setAnalysis(newAnalysis);
            setIsAnalysisLoading(false);
          })
          .catch(error => {
            console.error('Error analyzing property:', error);
            setIsAnalysisLoading(false);
          });
      }
    }
  }, [property, propertyAnalyses, analyzeProperty]);
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }
  
  const handleToggleFavorite = () => {
    toggleFavorite(property.id);
    setIsPropertyFavorite(!isPropertyFavorite);
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} - $${property.price.toLocaleString()}`,
        url: `https://yourdomain.com/properties/${property.id}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share this property');
    }
  };
  
  const handleInquiry = (message: string) => {
    // In a real app, this would send the inquiry to the backend
    Alert.alert(
      'Inquiry Sent',
      'Your message has been sent to the property owner. They will contact you soon.',
      [{ text: 'OK' }]
    );
  };
  
  const handleViewFullAnalysis = () => {
    setShowFullAnalysis(true);
  };
  
  const renderAnalysisSection = () => {
    if (isAnalysisLoading) {
      return (
        <View style={styles.analysisLoadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary.main} />
          <Text style={styles.analysisLoadingText}>Analyzing property data...</Text>
        </View>
      );
    }
    
    if (!analysis) {
      return null;
    }
    
    return (
      <View style={styles.analysisContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleBar} />
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>AI Property Analysis</Text>
            </View>
          </View>
        </View>
        
        <PricePredictionCard 
          prediction={analysis.pricePrediction} 
          onViewDetails={handleViewFullAnalysis}
        />
        
        {showFullAnalysis && (
          <>
            <InvestmentAnalysisCard 
              analysis={analysis.investmentAnalysis} 
              onViewDetails={handleViewFullAnalysis}
            />
            
            <MarketTrendChart marketTrend={analysis.marketTrend} />
          </>
        )}
        
        {!showFullAnalysis && (
          <TouchableOpacity 
            style={styles.viewMoreButton} 
            onPress={handleViewFullAnalysis}
          >
            <Text style={styles.viewMoreButtonText}>
              View Full Investment Analysis
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <ImageGallery images={property.images || []} />
        
        <PropertyDetails
          property={property}
          isFavorite={isPropertyFavorite}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
        />
        
        {renderAnalysisSection()}
        
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionTitleBar} />
                <View style={styles.sectionTitle}>
                  <Text style={styles.sectionTitleText}>Amenities</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.amenitiesList}>
              {property.amenities.map((amenity, index) => (
                <AmenityItem key={index} title={amenity} />
              ))}
            </View>
          </View>
        )}
        
        <InquiryForm onSubmit={handleInquiry} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  amenitiesContainer: {
    padding: 16,
    backgroundColor: Colors.background.light,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.primary.main,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    flex: 1,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  analysisContainer: {
    padding: 16,
    backgroundColor: Colors.background.light,
  },
  analysisLoadingContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.light,
  },
  analysisLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.muted,
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderRadius: 8,
    marginTop: 8,
  },
  viewMoreButtonText: {
    color: Colors.primary.main,
    fontWeight: '500',
    fontSize: 14,
  },
});