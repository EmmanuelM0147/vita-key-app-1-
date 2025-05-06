import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Home, Bed, Bath, SquareCode, DollarSign, Camera, Plus } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';
import { Property } from '@/types/property';

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!title || !address || !city || !price || !propertyType) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new property object
      const newProperty: Omit<Property, 'id'> = {
        title,
        address,
        city,
        price: parseFloat(price),
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseInt(area) || 0,
        description,
        type: propertyType,
        images: [],
        features: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        realtorId: user?.id || '',
        yearBuilt: new Date().getFullYear(),
        propertyType: propertyType,
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitting(false);
      
      Alert.alert(
        'Success',
        'Your property has been submitted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and navigate back
              setTitle('');
              setAddress('');
              setCity('');
              setPrice('');
              setBedrooms('');
              setBathrooms('');
              setArea('');
              setDescription('');
              setPropertyType('');
              router.push('/');
            },
          },
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit property. Please try again.');
      console.error('Error submitting property:', error);
    }
  };

  const handleAddPhotos = () => {
    Alert.alert('Add Photos', 'This feature is not implemented yet.');
  };

  // Check if user is a realtor
  if (user?.role !== 'realtor') {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <View style={styles.notRealtorContainer}>
            <Typography variant="h3" align="center" style={styles.notRealtorTitle}>
              Realtor Account Required
            </Typography>
            <Typography variant="body1" color={Colors.text.muted} align="center" style={styles.notRealtorText}>
              You need a realtor account to list properties. Please create a realtor account or contact support for assistance.
            </Typography>
            <Button
              title="Go to Profile"
              onPress={() => router.push('/profile')}
              variant="primary"
              size="lg"
              style={styles.notRealtorButton}
            />
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              List a Property
            </Typography>
            <Typography variant="body1" color={Colors.text.muted}>
              Fill in the details to list your property
            </Typography>
          </View>
          
          <Card variant="outlined" style={styles.formCard}>
            <Input
              label="Property Title *"
              placeholder="e.g. Modern Apartment in Downtown"
              value={title}
              onChangeText={setTitle}
              leftIcon={<Home size={20} color={Colors.text.muted} />}
            />
            
            <Input
              label="Address *"
              placeholder="Street address"
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={20} color={Colors.text.muted} />}
            />
            
            <Input
              label="City *"
              placeholder="City name"
              value={city}
              onChangeText={setCity}
              leftIcon={<MapPin size={20} color={Colors.text.muted} />}
            />
            
            <Input
              label="Property Type *"
              placeholder="e.g. Apartment, House, Condo"
              value={propertyType}
              onChangeText={setPropertyType}
              leftIcon={<Home size={20} color={Colors.text.muted} />}
            />
            
            <Input
              label="Price *"
              placeholder="Property price"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              leftIcon={<DollarSign size={20} color={Colors.text.muted} />}
            />
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Bedrooms"
                  placeholder="Number"
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  leftIcon={<Bed size={20} color={Colors.text.muted} />}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Input
                  label="Bathrooms"
                  placeholder="Number"
                  keyboardType="numeric"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  leftIcon={<Bath size={20} color={Colors.text.muted} />}
                />
              </View>
            </View>
            
            <Input
              label="Area (sq ft)"
              placeholder="Property area"
              keyboardType="numeric"
              value={area}
              onChangeText={setArea}
              leftIcon={<SquareCode size={20} color={Colors.text.muted} />}
            />
            
            <Input
              label="Description"
              placeholder="Describe your property"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              inputStyle={styles.textArea}
            />
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleAddPhotos}
            >
              <View style={styles.photoButtonContent}>
                <Camera size={24} color={Colors.primary.gold} />
                <Typography variant="body1" color={Colors.primary.gold} style={styles.photoButtonText}>
                  Add Photos
                </Typography>
                <Plus size={20} color={Colors.primary.gold} />
              </View>
            </TouchableOpacity>
          </Card>
          
          <View style={styles.footer}>
            <Button
              title="Submit Property"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            />
          </View>
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
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.sm,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: Colors.primary.gold,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  photoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    marginHorizontal: Spacing.sm,
  },
  footer: {
    marginBottom: Spacing.xxl,
  },
  notRealtorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notRealtorTitle: {
    marginBottom: Spacing.md,
  },
  notRealtorText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  notRealtorButton: {
    minWidth: 200,
  },
});