import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { Property } from '@/types/property';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';

interface PropertySuggestionProps {
  property: Property;
}

export default function PropertySuggestion({ property }: PropertySuggestionProps) {
  const router = useRouter();
  
  const handleViewProperty = () => {
    router.push(`/marketplace/${property.id}`);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Property Suggestion</Text>
      
      <View style={styles.card}>
        {property.images && property.images.length > 0 && (
          <Image 
            source={{ uri: property.images[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.details}>
          <Text style={styles.title}>{property.title}</Text>
          
          <Text style={styles.price}>
            ${property.price.toLocaleString()}
          </Text>
          
          <View style={styles.specs}>
            <Text style={styles.spec}>{property.bedrooms} beds</Text>
            <Text style={styles.spec}>{property.bathrooms} baths</Text>
            {property.area && <Text style={styles.spec}>{property.area} sq ft</Text>}
          </View>
          
          <Text style={styles.location}>
            {typeof property.location === 'string' 
              ? property.location 
              : property.location?.city}
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleViewProperty}
          >
            <Text style={styles.buttonText}>View Property</Text>
            <ExternalLink size={16} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.muted,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 150,
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  specs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  spec: {
    fontSize: 14,
    color: Colors.text.dark,
    marginRight: 12,
  },
  location: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.light,
  },
});