import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Filter, Sparkles, TrendingUp, Home, Bell, BellOff } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import RecommendationList from '@/components/recommendations/RecommendationList';
import AIExplanationModal from '@/components/recommendations/AIExplanationModal';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import useRecommendationsStore from '@/store/recommendations-store';
import { Recommendation } from '@/types/recommendation';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    personalizedRecommendations, 
    trendingRecommendations,
    newListingRecommendations,
    settings,
    isLoadingPersonalized,
    isLoadingTrending,
    isLoadingNewListings,
    isLoadingExplanation,
    currentExplanation,
    fetchPersonalizedRecommendations,
    fetchTrendingProperties,
    fetchNewListingRecommendations,
    fetchRecommendationExplanation,
    markRecommendationAsViewed,
    trackRecommendationInteraction,
    updateSettings,
    clearExplanation
  } = useRecommendationsStore();
  
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load recommendations if user is logged in
    if (user) {
      loadRecommendations();
    }
  }, [user]);
  
  const loadRecommendations = async () => {
    if (!user) return;
    
    if (settings.enablePersonalized) {
      fetchPersonalizedRecommendations(user.id);
    }
    
    if (settings.enableTrending) {
      fetchTrendingProperties();
    }
    
    fetchNewListingRecommendations(user.id);
  };
  
  const handleRecommendationExplanation = async (recommendation: Recommendation) => {
    if (!user) return;
    
    setSelectedRecommendation(recommendation);
    setShowExplanationModal(true);
    
    try {
      await fetchRecommendationExplanation(user.id, recommendation.property.id);
      await markRecommendationAsViewed(recommendation.id);
      await trackRecommendationInteraction(recommendation.id, 'view');
    } catch (error) {
      console.error('Error fetching explanation:', error);
    }
  };
  
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };
  
  const handleViewProperty = () => {
    if (selectedRecommendation) {
      router.push(`/marketplace/${selectedRecommendation.property.id}`);
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Brain size={24} color={Colors.primary.main} />
          <Typography variant="h4" style={styles.headerTitle}>
            AI Recommendations
          </Typography>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Filter size={20} color={Colors.text.dark} />
        </TouchableOpacity>
      </View>
      
      {showSettings && (
        <View style={styles.settingsContainer}>
          <Typography variant="h5" style={styles.settingsTitle}>
            Recommendation Settings
          </Typography>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Sparkles size={16} color={Colors.primary.main} />
              <Typography variant="body2">Personalized Recommendations</Typography>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                settings.enablePersonalized && styles.toggleActive
              ]}
              onPress={() => handleSettingChange('enablePersonalized', !settings.enablePersonalized)}
            >
              <View style={[
                styles.toggleCircle,
                settings.enablePersonalized && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Home size={16} color={Colors.primary.main} />
              <Typography variant="body2">Similar Properties</Typography>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                settings.enableSimilarProperties && styles.toggleActive
              ]}
              onPress={() => handleSettingChange('enableSimilarProperties', !settings.enableSimilarProperties)}
            >
              <View style={[
                styles.toggleCircle,
                settings.enableSimilarProperties && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <TrendingUp size={16} color={Colors.primary.main} />
              <Typography variant="body2">Trending Properties</Typography>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                settings.enableTrending && styles.toggleActive
              ]}
              onPress={() => handleSettingChange('enableTrending', !settings.enableTrending)}
            >
              <View style={[
                styles.toggleCircle,
                settings.enableTrending && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              {settings.notifyOnNewMatches ? (
                <Bell size={16} color={Colors.primary.main} />
              ) : (
                <BellOff size={16} color={Colors.text.muted} />
              )}
              <Typography variant="body2">Notify on New Matches</Typography>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                settings.notifyOnNewMatches && styles.toggleActive
              ]}
              onPress={() => handleSettingChange('notifyOnNewMatches', !settings.notifyOnNewMatches)}
            >
              <View style={[
                styles.toggleCircle,
                settings.notifyOnNewMatches && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <Typography variant="body2">Minimum Match Score</Typography>
            <View style={styles.scoreSelector}>
              {[0.5, 0.6, 0.7, 0.8, 0.9].map(score => (
                <TouchableOpacity
                  key={score}
                  style={[
                    styles.scoreOption,
                    settings.minMatchScore === score && styles.scoreOptionActive
                  ]}
                  onPress={() => handleSettingChange('minMatchScore', score)}
                >
                  <Typography 
                    variant="caption" 
                    color={settings.minMatchScore === score ? Colors.common.white : Colors.text.dark}
                  >
                    {Math.round(score * 100)}%
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Typography variant="body2" color={Colors.common.white}>
              Refresh Recommendations
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.introSection}>
            <Typography variant="body1" color={Colors.text.muted} style={styles.introText}>
              Our AI analyzes your preferences and behavior to recommend properties that match your needs.
              The more you interact with properties, the better our recommendations will become.
            </Typography>
          </View>
          
          {user && settings.enablePersonalized && (
            <RecommendationList
              title="Personalized for You"
              subtitle="Based on your preferences and behavior"
              recommendations={personalizedRecommendations}
              isLoading={isLoadingPersonalized}
              showSeeAll={false}
              onExplainPress={handleRecommendationExplanation}
              horizontal={true}
              compact={false}
            />
          )}
          
          <RecommendationList
            title="New Listings You Might Like"
            subtitle="Fresh on the market and matching your preferences"
            recommendations={newListingRecommendations}
            isLoading={isLoadingNewListings}
            showSeeAll={false}
            onExplainPress={handleRecommendationExplanation}
            horizontal={true}
            compact={false}
          />
          
          {settings.enableTrending && (
            <RecommendationList
              title="Trending Properties"
              subtitle="Popular in your area"
              recommendations={trendingRecommendations}
              isLoading={isLoadingTrending}
              showSeeAll={false}
              onExplainPress={handleRecommendationExplanation}
              horizontal={true}
              compact={false}
            />
          )}
          
          {personalizedRecommendations.length > 0 && (
            <View style={styles.allRecommendationsSection}>
              <Typography variant="h5" style={styles.sectionTitle}>
                All Recommendations
              </Typography>
              <RecommendationList
                title=""
                recommendations={[
                  ...personalizedRecommendations,
                  ...newListingRecommendations,
                  ...trendingRecommendations
                ].filter((rec, index, self) => 
                  index === self.findIndex(r => r.property.id === rec.property.id)
                )}
                isLoading={isLoadingPersonalized || isLoadingTrending || isLoadingNewListings}
                showSeeAll={false}
                onExplainPress={handleRecommendationExplanation}
                horizontal={false}
                compact={true}
              />
            </View>
          )}
        </View>
      </ScrollView>
      
      <AIExplanationModal
        visible={showExplanationModal}
        onClose={() => {
          setShowExplanationModal(false);
          clearExplanation();
        }}
        propertyId={selectedRecommendation?.property.id || ""}
        propertyTitle={selectedRecommendation?.property.title || ""}
        explanation={currentExplanation}
        isLoading={isLoadingExplanation}
        onViewProperty={handleViewProperty}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: Spacing.xs,
  },
  introSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  introText: {
    lineHeight: 22,
  },
  settingsContainer: {
    backgroundColor: Colors.background.light,
    padding: Spacing.lg,
    margin: Spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsTitle: {
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[200],
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary.main,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.common.white,
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  scoreSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  scoreOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  scoreOptionActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  refreshButton: {
    backgroundColor: Colors.primary.main,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  allRecommendationsSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
});