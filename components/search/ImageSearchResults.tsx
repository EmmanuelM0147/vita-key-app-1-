import React from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Property } from '@/types/property';

interface ImageSearchResultsProps {
  searchImage: string;
  results: Array<Property & { similarityScore: number; matchReasons: string[] }>;
  onClearResults: () => void;
}

export const ImageSearchResults: React.FC<ImageSearchResultsProps> = ({
  searchImage,
  results,
  onClearResults,
}) => {
  const router = useRouter();

  const handleViewProperty = (propertyId: string) => {
    router.push(`/marketplace/${propertyId}`);
  };

  const renderItem = ({ item }: { item: Property & { similarityScore: number; matchReasons: string[] } }) => {
    // Format match score as percentage
    const matchPercentage = Math.round(item.similarityScore * 100);
    
    // Format location string
    const locationString = typeof item.location === 'string'
      ? item.location
      : item.location?.city && item.location?.state
        ? `${item.location.city}, ${item.location.state}`
        : item.location?.address || 'Location not specified';

    return (
      <Card variant="elevated" style={styles.resultCard}>
        <View style={styles.resultContent}>
          <Image 
            source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
            style={styles.propertyImage}
          />
          
          <View style={styles.propertyInfo}>
            <View style={styles.matchScoreContainer}>
              <Typography variant="caption" color={Colors.common.white}>
                {matchPercentage}% Match
              </Typography>
            </View>
            
            <Typography variant="h5" numberOfLines={1} style={styles.propertyTitle}>
              {item.title}
            </Typography>
            
            <Typography variant="body2" color={Colors.text.muted} numberOfLines={1}>
              {locationString}
            </Typography>
            
            <Typography variant="body1" color={Colors.primary.main} style={styles.propertyPrice}>
              ${item.price.toLocaleString()}
            </Typography>
            
            <View style={styles.matchReasons}>
              {item.matchReasons.slice(0, 2).map((reason, index) => (
                <Typography key={index} variant="caption" color={Colors.text.muted} numberOfLines={1}>
                  • {reason}
                </Typography>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleViewProperty(item.id)}
            >
              <Typography variant="body2" color={Colors.primary[500]}>
                View Property
              </Typography>
              <ArrowRight size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchImageContainer}>
          <Image source={{ uri: searchImage }} style={styles.searchImage} />
        </View>
        
        <View style={styles.headerText}>
          <Typography variant="h5">Visual Search Results</Typography>
          <Typography variant="body2" color={Colors.text.muted}>
            {results.length} properties found
          </Typography>
        </View>
        
        <Button
          title="New Search"
          onPress={onClearResults}
          variant="outline"
          size="sm"
        />
      </View>
      
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography variant="body1" color={Colors.text.muted} align="center">
              No matching properties found. Try a different image.
            </Typography>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchImageContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  resultsList: {
    padding: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultContent: {
    flexDirection: 'row',
  },
  propertyImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  propertyInfo: {
    flex: 1,
    padding: Spacing.sm,
    position: 'relative',
  },
  matchScoreContainer: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.primary.main,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  propertyTitle: {
    marginTop: Spacing.xs,
    marginRight: 70, // Make room for match score
  },
  propertyPrice: {
    marginTop: Spacing.xs,
  },
  matchReasons: {
    marginTop: Spacing.xs,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
});

export default ImageSearchResults;