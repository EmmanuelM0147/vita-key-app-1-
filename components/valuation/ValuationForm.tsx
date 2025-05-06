import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, MapPin, Home, Bed, Bath, Ruler, Calendar, Maximize, Check } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { PropertyDetails } from '@/types/valuation';
import { useAIAnalysisStore } from '@/store/ai-analysis-store';

const propertyTypes = [
  'Single Family Home',
  'Condo',
  'Townhouse',
  'Multi-Family',
  'Apartment',
  'Land'
];

const conditionOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const featureOptions = [
  'Pool',
  'Garage',
  'Fireplace',
  'Central AC',
  'Renovated Kitchen',
  'Renovated Bathroom',
  'Hardwood Floors',
  'Basement',
  'Waterfront',
  'View',
  'Smart Home',
  'Solar Panels'
];

interface ValuationFormProps {
  onValuationComplete?: (valuationId: string) => void;
}

const ValuationForm: React.FC<ValuationFormProps> = ({ onValuationComplete }) => {
  const router = useRouter();
  const { valuateProperty, isLoading } = useAIAnalysisStore();
  
  const [formData, setFormData] = useState<PropertyDetails>({
    address: '',
    neighborhood: '',
    propertyType: 'Single Family Home',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    yearBuilt: 2010,
    lotSize: 0.25,
    condition: 'good',
    features: []
  });
  
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  
  const handleInputChange = (field: keyof PropertyDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const toggleFeature = (feature: string) => {
    setFormData(prev => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };
  
  const handleSubmit = async () => {
    try {
      const valuation = await valuateProperty(formData);
      if (onValuationComplete) {
        onValuationComplete(valuation.id);
      } else {
        router.push(`/valuation/results?id=${valuation.id}`);
      }
    } catch (error) {
      console.error('Error generating valuation:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Property Valuation</Text>
      <Text style={styles.subtitle}>
        Get an instant AI-powered estimate of your property's value
      </Text>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.inputContainer}>
          <MapPin size={20} color={Colors.primary.main} style={styles.inputIcon} />
          <Input
            placeholder="Property Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            containerStyle={styles.input}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MapPin size={20} color={Colors.primary.main} style={styles.inputIcon} />
          <Input
            placeholder="Neighborhood"
            value={formData.neighborhood}
            onChangeText={(text) => handleInputChange('neighborhood', text)}
            containerStyle={styles.input}
          />
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        
        <View style={styles.dropdownContainer}>
          <Home size={20} color={Colors.primary.main} style={styles.inputIcon} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
          >
            <Text style={styles.dropdownText}>{formData.propertyType}</Text>
            <ChevronDown size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>
        
        {showPropertyTypeDropdown && (
          <View style={styles.dropdownMenu}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('propertyType', type);
                  setShowPropertyTypeDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  formData.propertyType === type && styles.dropdownItemTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Bed size={20} color={Colors.primary.main} style={styles.inputIcon} />
            <Input
              placeholder="Bedrooms"
              value={formData.bedrooms.toString()}
              onChangeText={(text) => handleInputChange('bedrooms', parseInt(text) || 0)}
              keyboardType="numeric"
              containerStyle={styles.input}
            />
          </View>
          
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Bath size={20} color={Colors.primary.main} style={styles.inputIcon} />
            <Input
              placeholder="Bathrooms"
              value={formData.bathrooms.toString()}
              onChangeText={(text) => handleInputChange('bathrooms', parseFloat(text) || 0)}
              keyboardType="numeric"
              containerStyle={styles.input}
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Ruler size={20} color={Colors.primary.main} style={styles.inputIcon} />
            <Input
              placeholder="Square Feet"
              value={formData.squareFeet.toString()}
              onChangeText={(text) => handleInputChange('squareFeet', parseInt(text) || 0)}
              keyboardType="numeric"
              containerStyle={styles.input}
            />
          </View>
          
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Calendar size={20} color={Colors.primary.main} style={styles.inputIcon} />
            <Input
              placeholder="Year Built"
              value={formData.yearBuilt.toString()}
              onChangeText={(text) => handleInputChange('yearBuilt', parseInt(text) || 0)}
              keyboardType="numeric"
              containerStyle={styles.input}
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Maximize size={20} color={Colors.primary.main} style={styles.inputIcon} />
          <Input
            placeholder="Lot Size (acres)"
            value={formData.lotSize.toString()}
            onChangeText={(text) => handleInputChange('lotSize', parseFloat(text) || 0)}
            keyboardType="numeric"
            containerStyle={styles.input}
          />
        </View>
        
        <View style={styles.dropdownContainer}>
          <Home size={20} color={Colors.primary.main} style={styles.inputIcon} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowConditionDropdown(!showConditionDropdown)}
          >
            <Text style={styles.dropdownText}>
              Condition: {conditionOptions.find(o => o.value === formData.condition)?.label}
            </Text>
            <ChevronDown size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>
        
        {showConditionDropdown && (
          <View style={styles.dropdownMenu}>
            {conditionOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('condition', option.value as any);
                  setShowConditionDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  formData.condition === option.value && styles.dropdownItemTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Property Features</Text>
        <Text style={styles.featureHint}>Select all that apply</Text>
        
        <View style={styles.featuresGrid}>
          {featureOptions.map((feature) => (
            <TouchableOpacity
              key={feature}
              style={[
                styles.featureItem,
                formData.features.includes(feature) && styles.featureItemSelected
              ]}
              onPress={() => toggleFeature(feature)}
            >
              {formData.features.includes(feature) && (
                <Check size={16} color={Colors.white} style={styles.checkIcon} />
              )}
              <Text style={[
                styles.featureText,
                formData.features.includes(feature) && styles.featureTextSelected
              ]}>
                {feature}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Calculating..." : "Get Property Valuation"}
          onPress={handleSubmit}
          disabled={isLoading || !formData.address || !formData.neighborhood}
          icon={isLoading ? () => <ActivityIndicator color={Colors.white} size="small" /> : undefined}
        />
      </View>
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This valuation is an estimate based on available data and market trends. 
          Actual property value may vary. For a more accurate valuation, 
          consult with a licensed real estate professional.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background.main,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.muted,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.main,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.main,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text.main,
  },
  dropdownMenu: {
    marginLeft: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.main,
    borderRadius: 8,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.text.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text.main,
  },
  dropdownItemTextSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  featureHint: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 16,
    marginTop: -8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  featureItemSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkIcon: {
    marginRight: 4,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.main,
  },
  featureTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  buttonContainer: {
    marginVertical: 24,
  },
  disclaimer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.text.muted,
    lineHeight: 20,
  },
});

export default ValuationForm;