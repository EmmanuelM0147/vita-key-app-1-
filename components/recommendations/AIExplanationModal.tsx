import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, Brain, Home, MapPin, DollarSign, Lightbulb, Star, BarChart } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { RecommendationExplanation } from '@/types/recommendation';

interface AIExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  explanation: RecommendationExplanation | null;
  isLoading?: boolean;
  onViewProperty?: () => void;
}

const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  visible,
  onClose,
  propertyId,
  propertyTitle,
  explanation,
  isLoading = false,
  onViewProperty,
}) => {
  const renderFactorIcon = (title: string) => {
    if (title.toLowerCase().includes('location')) {
      return <MapPin size={20} color={Colors.primary.main} />;
    } else if (title.toLowerCase().includes('price') || title.toLowerCase().includes('value')) {
      return <DollarSign size={20} color={Colors.primary.main} />;
    } else if (title.toLowerCase().includes('feature') || title.toLowerCase().includes('amenity')) {
      return <Home size={20} color={Colors.primary.main} />;
    } else if (title.toLowerCase().includes('match') || title.toLowerCase().includes('preference')) {
      return <Star size={20} color={Colors.primary.main} />;
    } else if (title.toLowerCase().includes('trend') || title.toLowerCase().includes('popular')) {
      return <BarChart size={20} color={Colors.primary.main} />;
    } else {
      return <Lightbulb size={20} color={Colors.primary.main} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return Colors.status.success;
    if (score >= 3) return Colors.status.warning;
    return Colors.status.error;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Brain size={24} color={Colors.primary.main} />
              <Typography variant="h4" style={styles.modalTitle}>
                AI Recommendation
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.main} />
              <Typography variant="body1" style={styles.loadingText}>
                Analyzing property match...
              </Typography>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContent}>
                <Typography variant="body1" weight="600" style={styles.propertyTitle}>
                  {propertyTitle}
                </Typography>
                
                {explanation ? (
                  <>
                    <Card variant="outlined" style={styles.summaryCard}>
                      <Typography variant="body1" style={styles.summaryText}>
                        {explanation.summary}
                      </Typography>
                    </Card>
                    
                    <Typography variant="h5" style={styles.sectionTitle}>
                      Key Factors
                    </Typography>
                    
                    {explanation.factors.map((factor, index) => (
                      <View key={index} style={styles.factorCard}>
                        <View style={styles.factorHeader}>
                          <View style={styles.factorIconContainer}>
                            {renderFactorIcon(factor.title)}
                          </View>
                          <Typography variant="body1" weight="600" style={styles.factorTitle}>
                            {factor.title}
                          </Typography>
                          <View style={[
                            styles.scoreContainer,
                            { backgroundColor: getScoreColor(factor.score) }
                          ]}>
                            <Typography variant="caption" color={Colors.common.white}>
                              {factor.score.toFixed(1)}/5
                            </Typography>
                          </View>
                        </View>
                        
                        <Typography variant="body2" style={styles.factorDescription}>
                          {factor.description}
                        </Typography>
                      </View>
                    ))}
                    
                    <Typography variant="h5" style={styles.sectionTitle}>
                      Conclusion
                    </Typography>
                    
                    <Card variant="outlined" style={styles.conclusionCard}>
                      <Typography variant="body1" style={styles.conclusionText}>
                        {explanation.conclusion}
                      </Typography>
                    </Card>
                    
                    <Typography variant="caption" color={Colors.text.muted} style={styles.disclaimer}>
                      This recommendation is generated by AI based on your preferences and property data. 
                      It is meant to assist your decision-making process, but we encourage you to visit 
                      the property and consult with a real estate professional before making any final decisions.
                    </Typography>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Typography variant="body1" color={Colors.text.muted}>
                      No explanation data available for this property.
                    </Typography>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button
                  title="Close"
                  variant="outline"
                  onPress={onClose}
                  style={styles.closeModalButton}
                />
                {onViewProperty && (
                  <Button
                    title="View Property"
                    variant="primary"
                    onPress={() => {
                      onClose();
                      onViewProperty();
                    }}
                  />
                )}
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
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  propertyTitle: {
    marginBottom: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryText: {
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  factorCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.main,
    borderRadius: BorderRadius.md,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  factorIconContainer: {
    marginRight: Spacing.xs,
  },
  factorTitle: {
    flex: 1,
  },
  scoreContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  factorDescription: {
    lineHeight: 20,
  },
  conclusionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  conclusionText: {
    lineHeight: 22,
  },
  disclaimer: {
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.main,
  },
  closeModalButton: {
    marginRight: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.muted,
  },
  noDataContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIExplanationModal;