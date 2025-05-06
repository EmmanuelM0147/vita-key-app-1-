import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, Image, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, LogOut, User, Heart, Home, MessageSquare, Shield, HelpCircle, Edit, MapPin, DollarSign, Building, Clock, ChevronRight, Bell, CreditCard, Star, Brain, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import usePropertiesStore from '@/store/properties-store';
import useTransactionsStore from '@/store/transactions-store';
import useReviewsStore from '@/store/reviews-store';
import usePersonalizationStore from '@/store/personalization-store';
import { PropertyCard } from '@/components/ui/PropertyCard';
import Input from '@/components/ui/Input';
import { mockApi } from '@/services/api';
import { UserPreferences } from '@/types/user';
import { imageUploadService } from '@/services/image-upload';
import { NotificationPreferences } from '@/services/notification';
import TransactionCard from '@/components/payments/TransactionCard';
import StarRating from '@/components/reviews/StarRating';
import ReviewModal from '@/components/reviews/ReviewModal';
import { ReviewType } from '@/types/review';

// Tab enum for profile sections
enum ProfileTab {
  PROFILE = 'profile',
  SAVED = 'saved',
  PREFERENCES = 'preferences',
  INQUIRIES = 'inquiries',
  NOTIFICATIONS = 'notifications',
  TRANSACTIONS = 'transactions',
  REVIEWS = 'reviews',
  PERSONALIZATION = 'personalization',
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser, updateNotificationPreferences, isLoading } = useAuthStore();
  const { properties, favorites, toggleFavorite } = usePropertiesStore();
  const { transactions, fetchTransactions } = useTransactionsStore();
  const { fetchUserReviews } = useReviewsStore();
  const {
    recentSearches,
    featuredCategories,
    highlightedAmenities,
    clearPersonalizationData,
    fetchPersonalizedUIAdaptations,
  } = usePersonalizationStore();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.PROFILE);
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || {
      location: '',
      priceRange: { min: 0, max: 1000000 },
      propertyTypes: [],
      bedrooms: 0,
      bathrooms: 0,
    }
  );
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    user?.notificationPreferences || {
      newListings: true,
      inquiries: true,
      priceChanges: true,
      inquiryResponses: true,
      viewingScheduled: true,
      system: true,
      pushEnabled: true,
    }
  );
  
  // Personalization preferences state
  const [personalizationPreferences, setPersonalizationPreferences] = useState({
    trackSearchHistory: true,
    trackPropertyViews: true,
    trackFilters: true,
    useAIRecommendations: true,
    adaptHomeScreen: true,
    adaptSearchResults: true,
  });
  
  // Reviews state
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{
    type: ReviewType;
    targetId: string;
    targetName: string;
  } | null>(null);
  
  // Get saved properties
  const savedProperties = properties.filter(property => 
    favorites.includes(property.id)
  );
  
  // Get user inquiries
  const userInquiries = user?.inquiries || [];
  
  // Get user transactions
  const userTransactions = transactions.slice(0, 3); // Show only the 3 most recent transactions
  
  useEffect(() => {
    if (user) {
      fetchTransactions(user.id);
      loadUserReviews();
      fetchPersonalizedUIAdaptations();
    }
  }, [user]);
  
  const loadUserReviews = async () => {
    if (!user) return;
    
    try {
      const reviews = await fetchUserReviews(user.id);
      setUserReviews(reviews);
    } catch (error) {
      console.error('Failed to load user reviews:', error);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.push('/(auth)');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
      updateUser({
        name,
        email,
        phone,
      })
        .then(() => {
          setIsEditing(false);
          Alert.alert('Success', 'Profile updated successfully');
        })
        .catch(error => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        });
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };
  
  const handleSavePreferences = () => {
    updateUser({
      preferences,
    })
      .then(() => {
        Alert.alert('Success', 'Preferences updated successfully');
      })
      .catch(error => {
        Alert.alert('Error', error.message || 'Failed to update preferences');
      });
  };
  
  const handleToggleNotificationPreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      // Update local state
      setNotificationPreferences(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Update in store
      await updateNotificationPreferences({ [key]: value });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences');
      console.error('Error updating notification preferences:', error);
      
      // Revert the change if it failed
      setNotificationPreferences(user?.notificationPreferences || {
        newListings: true,
        inquiries: true,
        priceChanges: true,
        inquiryResponses: true,
        viewingScheduled: true,
        system: true,
        pushEnabled: true,
      });
    }
  };
  
  const handleTogglePersonalizationPreference = (key: keyof typeof personalizationPreferences, value: boolean) => {
    setPersonalizationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleClearPersonalizationData = () => {
    Alert.alert(
      'Clear Personalization Data',
      'This will reset all your personalization data, including search history and property views. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          onPress: async () => {
            await clearPersonalizationData();
            Alert.alert('Success', 'Your personalization data has been cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handlePickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload an image.');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Show loading
        Alert.alert('Uploading', 'Please wait while we upload your image...');
        
        // Upload image
        const imageUrl = await imageUploadService.uploadImage(uri);
        
        // Update user avatar
        await updateUser({ avatar: imageUrl });
        
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };
  
  const handleRemoveSavedProperty = (propertyId: string) => {
    Alert.alert(
      'Remove Property',
      'Are you sure you want to remove this property from your saved list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => toggleFavorite(propertyId),
          style: 'destructive',
        },
      ]
    );
  };
  
  const handlePropertyTypeToggle = (type: string) => {
    setPreferences(prev => {
      const currentTypes = prev.propertyTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
        
      return {
        ...prev,
        propertyTypes: newTypes,
      };
    });
  };
  
  const handleInquiryDetails = (inquiryId: string) => {
    // In a real app, navigate to inquiry details
    Alert.alert('Inquiry Details', `Viewing details for inquiry ${inquiryId}`);
  };
  
  const handleOpenReviewModal = (type: ReviewType, targetId: string, targetName: string) => {
    setSelectedReview({ type, targetId, targetName });
    setReviewModalVisible(true);
  };

  const menuItems = [
    {
      icon: <Home size={22} color={Colors.text.dark} />,
      title: 'My Properties',
      onPress: () => router.push('/realtor'),
      showIf: user?.role === 'realtor',
    },
    {
      icon: <Heart size={22} color={Colors.text.dark} />,
      title: 'Favorites',
      onPress: () => setActiveTab(ProfileTab.SAVED),
      showIf: true,
    },
    {
      icon: <MapPin size={22} color={Colors.text.dark} />,
      title: 'Preferences',
      onPress: () => setActiveTab(ProfileTab.PREFERENCES),
      showIf: true,
    },
    {
      icon: <MessageSquare size={22} color={Colors.text.dark} />,
      title: 'My Inquiries',
      onPress: () => setActiveTab(ProfileTab.INQUIRIES),
      showIf: true,
    },
    {
      icon: <Star size={22} color={Colors.text.dark} />,
      title: 'My Reviews',
      onPress: () => setActiveTab(ProfileTab.REVIEWS),
      showIf: true,
    },
    {
      icon: <Brain size={22} color={Colors.text.dark} />,
      title: 'Personalization',
      onPress: () => setActiveTab(ProfileTab.PERSONALIZATION),
      showIf: true,
    },
    {
      icon: <CreditCard size={22} color={Colors.text.dark} />,
      title: 'Payment History',
      onPress: () => setActiveTab(ProfileTab.TRANSACTIONS),
      showIf: true,
    },
    {
      icon: <Bell size={22} color={Colors.text.dark} />,
      title: 'Notification Settings',
      onPress: () => setActiveTab(ProfileTab.NOTIFICATIONS),
      showIf: true,
    },
    {
      icon: <Settings size={22} color={Colors.text.dark} />,
      title: 'Settings',
      onPress: () => Alert.alert('Settings', 'This feature is not implemented yet.'),
      showIf: true,
    },
    {
      icon: <HelpCircle size={22} color={Colors.text.dark} />,
      title: 'Help & Support',
      onPress: () => Alert.alert('Help & Support', 'This feature is not implemented yet.'),
      showIf: true,
    },
  ].filter(item => item.showIf);

  // Render profile information section
  const renderProfileInfo = () => (
    <Card variant="elevated" style={styles.profileCard}>
      {isEditing ? (
        <View style={styles.editForm}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>
      ) : (
        <View style={styles.profileInfo}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={Colors.common.white} />
              </View>
            )}
            
            <View style={styles.editIconContainer}>
              <Edit size={14} color={Colors.common.white} />
            </View>
            
            {user?.role === 'realtor' && (
              <View style={styles.badge}>
                <Shield size={14} color={Colors.common.white} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <Typography variant="h4">
              {user?.name || 'Guest User'}
            </Typography>
            
            <Typography variant="body2" color={Colors.text.muted}>
              {user?.email || 'guest@example.com'}
            </Typography>
            
            {user?.phone && (
              <Typography variant="body2" color={Colors.text.muted}>
                {user.phone}
              </Typography>
            )}
            
            {user?.role === 'realtor' && (
              <View style={styles.realtorBadge}>
                <Typography variant="caption" color={Colors.common.white}>
                  Realtor
                </Typography>
              </View>
            )}
          </View>
        </View>
      )}
      
      <Button
        title={isEditing ? "Save Profile" : "Edit Profile"}
        onPress={handleEditProfile}
        variant={isEditing ? "primary" : "outline"}
        size="sm"
        style={styles.editButton}
        loading={isLoading}
      />
    </Card>
  );
  
  // Render saved properties section
  const renderSavedProperties = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Saved Properties
      </Typography>
      
      {savedProperties.length === 0 ? (
        <Card variant="outlined" style={styles.emptyStateCard}>
          <Typography variant="body1" align="center" color={Colors.text.muted}>
            You haven't saved any properties yet.
          </Typography>
          <Button
            title="Browse Properties"
            onPress={() => router.push('/marketplace')}
            variant="primary"
            size="sm"
            style={styles.emptyStateButton}
          />
        </Card>
      ) : (
        <View style={styles.savedPropertiesContainer}>
          {savedProperties.map(property => (
            <View key={property.id} style={styles.savedPropertyCard}>
              <PropertyCard
                property={property}
                onPress={() => router.push(`/marketplace/${property.id}`)}
                isFavorite={true}
                onFavoritePress={() => handleRemoveSavedProperty(property.id)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
  
  // Render preferences section
  const renderPreferences = () => {
    const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Land', 'Commercial'];
    
    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h4" style={styles.sectionTitle}>
          Your Preferences
        </Typography>
        
        <Card variant="elevated" style={styles.preferencesCard}>
          <Input
            label="Preferred Location"
            value={preferences.location}
            onChangeText={(text) => setPreferences({...preferences, location: text})}
            placeholder="Enter city, neighborhood, or zip code"
            leftIcon={<MapPin size={18} color={Colors.text.muted} />}
          />
          
          <View style={styles.priceRangeContainer}>
            <Typography variant="body2" style={styles.preferencesLabel}>
              Price Range
            </Typography>
            
            <View style={styles.priceInputsContainer}>
              <View style={styles.priceInputWrapper}>
                <Input
                  value={preferences.priceRange.min.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    setPreferences({
                      ...preferences, 
                      priceRange: {...preferences.priceRange, min: value}
                    });
                  }}
                  placeholder="Min"
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={18} color={Colors.text.muted} />}
                />
              </View>
              
              <Typography variant="body2" style={styles.priceSeparator}>
                to
              </Typography>
              
              <View style={styles.priceInputWrapper}>
                <Input
                  value={preferences.priceRange.max.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    setPreferences({
                      ...preferences, 
                      priceRange: {...preferences.priceRange, max: value}
                    });
                  }}
                  placeholder="Max"
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={18} color={Colors.text.muted} />}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.bedroomsContainer}>
            <Typography variant="body2" style={styles.preferencesLabel}>
              Bedrooms
            </Typography>
            
            <View style={styles.bedroomsButtonsContainer}>
              {[0, 1, 2, 3, 4, '5+'].map((num) => (
                <TouchableOpacity
                  key={`bed-${num}`}
                  style={[
                    styles.bedroomButton,
                    preferences.bedrooms === (typeof num === 'string' ? 5 : num) && styles.bedroomButtonActive
                  ]}
                  onPress={() => setPreferences({
                    ...preferences,
                    bedrooms: typeof num === 'string' ? 5 : num
                  })}
                >
                  <Typography 
                    variant="body2" 
                    color={preferences.bedrooms === (typeof num === 'string' ? 5 : num) ? 
                      Colors.common.white : Colors.text.dark}
                  >
                    {num}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.bathroomsContainer}>
            <Typography variant="body2" style={styles.preferencesLabel}>
              Bathrooms
            </Typography>
            
            <View style={styles.bedroomsButtonsContainer}>
              {[0, 1, 2, 3, 4, '5+'].map((num) => (
                <TouchableOpacity
                  key={`bath-${num}`}
                  style={[
                    styles.bedroomButton,
                    preferences.bathrooms === (typeof num === 'string' ? 5 : num) && styles.bedroomButtonActive
                  ]}
                  onPress={() => setPreferences({
                    ...preferences,
                    bathrooms: typeof num === 'string' ? 5 : num
                  })}
                >
                  <Typography 
                    variant="body2" 
                    color={preferences.bathrooms === (typeof num === 'string' ? 5 : num) ? 
                      Colors.common.white : Colors.text.dark}
                  >
                    {num}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.propertyTypesContainer}>
            <Typography variant="body2" style={styles.preferencesLabel}>
              Property Types
            </Typography>
            
            <View style={styles.propertyTypesButtonsContainer}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={`type-${type}`}
                  style={[
                    styles.propertyTypeButton,
                    preferences.propertyTypes?.includes(type) && styles.propertyTypeButtonActive
                  ]}
                  onPress={() => handlePropertyTypeToggle(type)}
                >
                  <Typography 
                    variant="body2" 
                    color={preferences.propertyTypes?.includes(type) ? 
                      Colors.common.white : Colors.text.dark}
                  >
                    {type}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Button
            title="Save Preferences"
            onPress={handleSavePreferences}
            variant="primary"
            size="md"
            style={styles.savePreferencesButton}
            loading={isLoading}
          />
        </Card>
      </View>
    );
  };
  
  // Render notification preferences section
  const renderNotificationPreferences = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Notification Settings
      </Typography>
      
      <Card variant="elevated" style={styles.notificationCard}>
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1" weight="600">
              Push Notifications
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Enable or disable all push notifications
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.pushEnabled}
            onValueChange={(value) => handleToggleNotificationPreference('pushEnabled', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <Divider style={styles.notificationDivider} />
        
        <Typography variant="body1" weight="600" style={styles.notificationCategoryTitle}>
          Notification Types
        </Typography>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              New Listings
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified about new properties that match your preferences
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.newListings}
            onValueChange={(value) => handleToggleNotificationPreference('newListings', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Price Changes
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified when prices change on your saved properties
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.priceChanges}
            onValueChange={(value) => handleToggleNotificationPreference('priceChanges', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Inquiries
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified about new inquiries on your properties
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.inquiries}
            onValueChange={(value) => handleToggleNotificationPreference('inquiries', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Inquiry Responses
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified when someone responds to your inquiries
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.inquiryResponses}
            onValueChange={(value) => handleToggleNotificationPreference('inquiryResponses', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Viewing Scheduled
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified when a viewing is scheduled
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.viewingScheduled}
            onValueChange={(value) => handleToggleNotificationPreference('viewingScheduled', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              System Notifications
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Get notified about important system updates
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.system}
            onValueChange={(value) => handleToggleNotificationPreference('system', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
            disabled={!notificationPreferences.pushEnabled}
          />
        </View>
        
        <Button
          title="View All Notifications"
          onPress={() => router.push('/notifications')}
          variant="outline"
          size="md"
          style={styles.viewNotificationsButton}
        />
      </Card>
    </View>
  );
  
  // Render personalization preferences section
  const renderPersonalizationPreferences = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        AI Personalization
      </Typography>
      
      <Card variant="elevated" style={styles.notificationCard}>
        <View style={styles.personalizationHeader}>
          <Brain size={24} color={Colors.primary.main} />
          <Typography variant="body1" style={styles.personalizationHeaderText}>
            Control how we use AI to personalize your experience
          </Typography>
        </View>
        
        <Divider style={styles.notificationDivider} />
        
        <Typography variant="body1" weight="600" style={styles.notificationCategoryTitle}>
          Data Collection
        </Typography>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Track Search History
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Remember your searches to provide better recommendations
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.trackSearchHistory}
            onValueChange={(value) => handleTogglePersonalizationPreference('trackSearchHistory', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Track Property Views
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Remember which properties you've viewed to improve recommendations
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.trackPropertyViews}
            onValueChange={(value) => handleTogglePersonalizationPreference('trackPropertyViews', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Track Filter Preferences
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Remember your filter preferences to personalize search results
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.trackFilters}
            onValueChange={(value) => handleTogglePersonalizationPreference('trackFilters', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <Divider style={styles.notificationDivider} />
        
        <Typography variant="body1" weight="600" style={styles.notificationCategoryTitle}>
          AI Features
        </Typography>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              AI Recommendations
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Use AI to recommend properties based on your preferences
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.useAIRecommendations}
            onValueChange={(value) => handleTogglePersonalizationPreference('useAIRecommendations', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Adapt Home Screen
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Personalize the home screen based on your interests
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.adaptHomeScreen}
            onValueChange={(value) => handleTogglePersonalizationPreference('adaptHomeScreen', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <View style={styles.notificationSetting}>
          <View style={styles.notificationSettingInfo}>
            <Typography variant="body1">
              Adapt Search Results
            </Typography>
            <Typography variant="body2" color={Colors.text.muted}>
              Personalize search results based on your preferences
            </Typography>
          </View>
          <Switch
            value={personalizationPreferences.adaptSearchResults}
            onValueChange={(value) => handleTogglePersonalizationPreference('adaptSearchResults', value)}
            trackColor={{ false: Colors.text.muted, true: Colors.primary[500] }}
            thumbColor={Colors.common.white}
          />
        </View>
        
        <Divider style={styles.notificationDivider} />
        
        <Typography variant="body1" weight="600" style={styles.notificationCategoryTitle}>
          Your Personalization Data
        </Typography>
        
        {recentSearches.length > 0 && (
          <View style={styles.dataSection}>
            <Typography variant="body2" weight="600">
              Recent Searches
            </Typography>
            <View style={styles.dataChips}>
              {recentSearches.slice(0, 5).map((search, index) => (
                <View key={`search-${index}`} style={styles.dataChip}>
                  <Typography variant="caption" color={Colors.text.muted}>
                    {search}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {featuredCategories.length > 0 && (
          <View style={styles.dataSection}>
            <Typography variant="body2" weight="600">
              Preferred Categories
            </Typography>
            <View style={styles.dataChips}>
              {featuredCategories.map((category, index) => (
                <View key={`category-${index}`} style={styles.dataChip}>
                  <Typography variant="caption" color={Colors.text.muted}>
                    {category}
                </Typography>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {highlightedAmenities.length > 0 && (
          <View style={styles.dataSection}>
            <Typography variant="body2" weight="600">
              Preferred Amenities
            </Typography>
            <View style={styles.dataChips}>
              {highlightedAmenities.map((amenity, index) => (
                <View key={`amenity-${index}`} style={styles.dataChip}>
                  <Typography variant="caption" color={Colors.text.muted}>
                    {amenity}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.clearDataButton}
          onPress={handleClearPersonalizationData}
        >
          <Trash2 size={16} color={Colors.status.error} />
          <Typography variant="body2" color={Colors.status.error} style={styles.clearDataText}>
            Clear All Personalization Data
          </Typography>
        </TouchableOpacity>
      </Card>
    </View>
  );
  
  // Render inquiries section
  const renderInquiries = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Your Inquiries
      </Typography>
      
      {userInquiries.length === 0 ? (
        <Card variant="outlined" style={styles.emptyStateCard}>
          <Typography variant="body1" align="center" color={Colors.text.muted}>
            You haven't made any inquiries yet.
          </Typography>
          <Button
            title="Browse Properties"
            onPress={() => router.push('/marketplace')}
            variant="primary"
            size="sm"
            style={styles.emptyStateButton}
          />
        </Card>
      ) : (
        <View style={styles.inquiriesContainer}>
          {userInquiries.map(inquiry => (
            <TouchableOpacity
              key={inquiry.id}
              style={styles.inquiryCard}
              onPress={() => handleInquiryDetails(inquiry.id)}
            >
              <View style={styles.inquiryHeader}>
                <Typography variant="body1" weight="600">
                  {inquiry.propertyTitle}
                </Typography>
                <View style={[
                  styles.inquiryStatus,
                  { backgroundColor: inquiry.status === 'pending' 
                    ? Colors.status.warning 
                    : inquiry.status === 'responded' 
                      ? Colors.status.success 
                      : Colors.status.error 
                  }
                ]}>
                  <Typography variant="caption" color={Colors.common.white}>
                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                  </Typography>
                </View>
              </View>
              
              <View style={styles.inquiryDetails}>
                <View style={styles.inquiryDetail}>
                  <Clock size={16} color={Colors.text.muted} />
                  <Typography variant="body2" color={Colors.text.muted} style={styles.inquiryDetailText}>
                    {new Date(inquiry.date).toLocaleDateString()}
                  </Typography>
                </View>
                
                <View style={styles.inquiryDetail}>
                  <Building size={16} color={Colors.text.muted} />
                  <Typography variant="body2" color={Colors.text.muted} style={styles.inquiryDetailText}>
                    {inquiry.propertyType}
                  </Typography>
                </View>
              </View>
              
              <Typography variant="body2" numberOfLines={2} style={styles.inquiryMessage}>
                {inquiry.message}
              </Typography>
              
              <View style={styles.inquiryFooter}>
                <ChevronRight size={18} color={Colors.primary[500]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
  
  // Render transactions section
  const renderTransactions = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Recent Transactions
      </Typography>
      
      {userTransactions.length === 0 ? (
        <Card variant="outlined" style={styles.emptyStateCard}>
          <Typography variant="body1" align="center" color={Colors.text.muted}>
            You haven't made any payments yet.
          </Typography>
          <Button
            title="Browse Properties"
            onPress={() => router.push('/marketplace')}
            variant="primary"
            size="sm"
            style={styles.emptyStateButton}
          />
        </Card>
      ) : (
        <View style={styles.transactionsContainer}>
          {userTransactions.map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onPress={() => router.push(`/payments/${transaction.id}`)}
            />
          ))}
          
          <Button
            title="View All Transactions"
            variant="outline"
            onPress={() => router.push('/payments')}
            rightIcon={<ChevronRight size={18} color={Colors.primary[500]} />}
            style={styles.viewAllButton}
          />
        </View>
      )}
    </View>
  );
  
  // Render reviews section
  const renderReviews = () => (
    <View style={styles.sectionContainer}>
      <Typography variant="h4" style={styles.sectionTitle}>
        Your Reviews
      </Typography>
      
      {userReviews.length === 0 ? (
        <Card variant="outlined" style={styles.emptyStateCard}>
          <Typography variant="body1" align="center" color={Colors.text.muted}>
            You haven't written any reviews yet.
          </Typography>
          <Button
            title="Browse Properties"
            onPress={() => router.push('/marketplace')}
            variant="primary"
            size="sm"
            style={styles.emptyStateButton}
          />
        </Card>
      ) : (
        <View style={styles.reviewsContainer}>
          {userReviews.map(review => (
            <TouchableOpacity
              key={review.id}
              style={styles.reviewCard}
              onPress={() => handleOpenReviewModal(
                review.type,
                review.targetId,
                review.type === ReviewType.PROPERTY ? 
                  properties.find(p => p.id === review.targetId)?.title || 'Property' :
                  'Realtor'
              )}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewType}>
                  {review.type === ReviewType.PROPERTY ? (
                    <Home size={16} color={Colors.primary[500]} />
                  ) : (
                    <User size={16} color={Colors.primary[500]} />
                  )}
                  <Typography variant="caption" color={Colors.text.muted} style={styles.reviewTypeText}>
                    {review.type === ReviewType.PROPERTY ? 'Property Review' : 'Realtor Review'}
                  </Typography>
                </View>
                <StarRating rating={review.rating.overall} size="sm" disabled />
              </View>
              
              <Typography variant="body1" weight="600" style={styles.reviewTitle}>
                {review.title || (review.type === ReviewType.PROPERTY ? 
                  properties.find(p => p.id === review.targetId)?.title || 'Property' :
                  'Realtor Review'
                )}
              </Typography>
              
              <Typography variant="body2" numberOfLines={2} style={styles.reviewComment}>
                {review.comment}
              </Typography>
              
              <View style={styles.reviewFooter}>
                <Typography variant="caption" color={Colors.text.muted}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                
                <View style={styles.reviewStatus}>
                  <Typography variant="caption" color={
                    review.status === 'approved' ? Colors.status.success :
                    review.status === 'pending' ? Colors.status.warning :
                    Colors.status.error
                  }>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case ProfileTab.SAVED:
        return renderSavedProperties();
      case ProfileTab.PREFERENCES:
        return renderPreferences();
      case ProfileTab.INQUIRIES:
        return renderInquiries();
      case ProfileTab.NOTIFICATIONS:
        return renderNotificationPreferences();
      case ProfileTab.TRANSACTIONS:
        return renderTransactions();
      case ProfileTab.REVIEWS:
        return renderReviews();
      case ProfileTab.PERSONALIZATION:
        return renderPersonalizationPreferences();
      case ProfileTab.PROFILE:
      default:
        return (
          <>
            {renderProfileInfo()}
            
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIcon}>{item.icon}</View>
                    <Typography variant="body1" style={styles.menuTitle}>
                      {item.title}
                    </Typography>
                    <ChevronRight size={20} color={Colors.text.muted} />
                  </TouchableOpacity>
                  
                  {index < menuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              {activeTab === ProfileTab.PROFILE ? 'Profile' : 
               activeTab === ProfileTab.SAVED ? 'Saved Properties' :
               activeTab === ProfileTab.PREFERENCES ? 'Preferences' : 
               activeTab === ProfileTab.NOTIFICATIONS ? 'Notifications' : 
               activeTab === ProfileTab.TRANSACTIONS ? 'Transactions' : 
               activeTab === ProfileTab.REVIEWS ? 'My Reviews' : 
               activeTab === ProfileTab.PERSONALIZATION ? 'AI Personalization' : 'Inquiries'}
            </Typography>
            
            {activeTab !== ProfileTab.PROFILE ? (
              <TouchableOpacity
                onPress={() => setActiveTab(ProfileTab.PROFILE)}
                style={styles.backButton}
              >
                <Typography variant="body2" color={Colors.primary[500]}>
                  Back to Profile
                </Typography>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <LogOut size={22} color={Colors.text.dark} />
              </TouchableOpacity>
            )}
          </View>
          
          {renderTabContent()}
          
          {!user && (
            <View style={styles.loginPrompt}>
              <Typography variant="body1" align="center" style={styles.loginText}>
                Sign in to access all features
              </Typography>
              
              <Button
                title="Sign In"
                onPress={() => router.push('/(auth)/login')}
                variant="primary"
                size="md"
                style={styles.loginButton}
              />
            </View>
          )}
          
          {/* Review Modal */}
          {selectedReview && (
            <ReviewModal
              visible={reviewModalVisible}
              onClose={() => setReviewModalVisible(false)}
              type={selectedReview.type}
              targetId={selectedReview.targetId}
              targetName={selectedReview.targetName}
              mode="view"
            />
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  logoutButton: {
    padding: Spacing.xs,
  },
  backButton: {
    padding: Spacing.xs,
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.common.white,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: Colors.secondary[500],
    borderRadius: BorderRadius.full,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.common.white,
  },
  userInfo: {
    flex: 1,
  },
  realtorBadge: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  editButton: {
    alignSelf: 'flex-end',
  },
  menuContainer: {
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuIcon: {
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
  },
  loginPrompt: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  loginText: {
    marginBottom: Spacing.md,
  },
  loginButton: {
    minWidth: 200,
  },
  editForm: {
    marginBottom: Spacing.md,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  savedPropertiesContainer: {
    gap: Spacing.md,
  },
  savedPropertyCard: {
    marginBottom: Spacing.md,
  },
  emptyStateCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButton: {
    marginTop: Spacing.md,
  },
  preferencesCard: {
    padding: Spacing.lg,
  },
  preferencesLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  priceRangeContainer: {
    marginBottom: Spacing.md,
  },
  priceInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceSeparator: {
    marginHorizontal: Spacing.xs,
  },
  bedroomsContainer: {
    marginBottom: Spacing.md,
  },
  bathroomsContainer: {
    marginBottom: Spacing.md,
  },
  bedroomsButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bedroomButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    minWidth: 40,
    alignItems: 'center',
  },
  bedroomButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  propertyTypesContainer: {
    marginBottom: Spacing.lg,
  },
  propertyTypesButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  propertyTypeButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  propertyTypeButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  savePreferencesButton: {
    marginTop: Spacing.md,
  },
  inquiriesContainer: {
    gap: Spacing.md,
  },
  inquiryCard: {
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inquiryStatus: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  inquiryDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  inquiryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inquiryDetailText: {
    marginLeft: 4,
  },
  inquiryMessage: {
    marginBottom: Spacing.sm,
  },
  inquiryFooter: {
    alignItems: 'flex-end',
  },
  notificationCard: {
    padding: Spacing.lg,
  },
  notificationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  notificationSettingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  notificationDivider: {
    marginVertical: Spacing.md,
  },
  notificationCategoryTitle: {
    marginBottom: Spacing.sm,
  },
  viewNotificationsButton: {
    marginTop: Spacing.lg,
  },
  transactionsContainer: {
    gap: Spacing.md,
  },
  viewAllButton: {
    marginTop: Spacing.md,
  },
  reviewsContainer: {
    gap: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  reviewType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewTypeText: {
    marginLeft: 4,
  },
  reviewTitle: {
    marginBottom: Spacing.xs,
  },
  reviewComment: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStatus: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  personalizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  personalizationHeaderText: {
    flex: 1,
    lineHeight: 20,
  },
  dataSection: {
    marginBottom: Spacing.md,
  },
  dataChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dataChip: {
    backgroundColor: Colors.background.light,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.status.error,
    borderRadius: BorderRadius.md,
    borderStyle: 'dashed',
  },
  clearDataText: {
    marginLeft: Spacing.xs,
  },
});