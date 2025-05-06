import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MessageSquare, Share2, Heart, HeartOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Property } from '@/types/property';
import Colors from '@/constants/colors';

interface PropertyDetailsProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

export default function PropertyDetails({
  property,
  isFavorite,
  onToggleFavorite,
  onShare,
}: PropertyDetailsProps) {
  const router = useRouter();
  
  const handleChatAboutProperty = () => {
    router.push(`/chat/property/${property.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>${property.price.toLocaleString()}</Text>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.location}>
          {typeof property.location === 'string'
            ? property.location
            : `${property.location?.city}, ${property.location?.state}`}
        </Text>
      </View>

      <View style={styles.specs}>
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{property.bedrooms}</Text>
          <Text style={styles.specLabel}>Beds</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{property.bathrooms}</Text>
          <Text style={styles.specLabel}>Baths</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{property.area}</Text>
          <Text style={styles.specLabel}>Sq Ft</Text>
        </View>
      </View>

      <ScrollView style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>{property.description}</Text>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleChatAboutProperty}
        >
          <MessageSquare size={20} color={Colors.text.light} />
          <Text style={styles.chatButtonText}>Chat About Property</Text>
        </TouchableOpacity>
        
        <View style={styles.iconButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onToggleFavorite}
          >
            {isFavorite ? (
              <HeartOff size={20} color={Colors.text.dark} />
            ) : (
              <Heart size={20} color={Colors.text.dark} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onShare}
          >
            <Share2 size={20} color={Colors.text.dark} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  locationContainer: {
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    color: Colors.text.muted,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  specDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.dark,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  chatButtonText: {
    color: Colors.text.light,
    fontWeight: '600',
    marginLeft: 8,
  },
  iconButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});