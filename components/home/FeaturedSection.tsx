import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { Property } from '@/types/property';
import PropertyCard from '@/components/ui/PropertyCard';
import Colors from '@/constants/colors';

interface FeaturedSectionProps {
  title: string;
  properties: Property[];
  isLoading: boolean;
  onViewProperty: (property: Property) => void;
  showViewAll?: boolean;
  viewAllRoute?: string;
}

export default function FeaturedSection({
  title,
  properties,
  isLoading,
  onViewProperty,
  showViewAll = true,
  viewAllRoute = '/marketplace',
}: FeaturedSectionProps) {
  const router = useRouter();

  const handleViewAll = () => {
    if (viewAllRoute) {
      router.push(viewAllRoute);
    }
  };
  
  const handleChatWithAI = () => {
    router.push('/chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {properties.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No properties found</Text>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={handleChatWithAI}
          >
            <MessageSquare size={18} color={Colors.text.light} />
            <Text style={styles.chatButtonText}>Chat with AI Assistant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => onViewProperty(item)}
              style={styles.card}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    marginHorizontal: 4,
    width: 280,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background.muted,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.muted,
    marginBottom: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.light,
    marginLeft: 8,
  },
});