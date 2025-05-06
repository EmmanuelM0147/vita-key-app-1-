import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Text
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChatStore } from '@/store/chat-store';
import { usePropertiesStore } from '@/store/properties-store';
import { generatePropertySummary } from '@/services/ai-chatbot';
import Colors from '@/constants/colors';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import PropertySuggestion from '@/components/chat/PropertySuggestion';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PropertyChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = React.useRef<FlatList>(null);
  
  const { 
    sessions, 
    currentSessionId, 
    isLoading, 
    createSession, 
    setCurrentSession, 
    sendMessage,
    setPropertyContext
  } = useChatStore();
  
  const { properties, getPropertyById } = usePropertiesStore();
  
  const property = getPropertyById(id);
  
  // Create a property-specific chat session if needed
  useEffect(() => {
    if (!property) return;
    
    // Check if we already have a session for this property
    const existingSession = sessions.find(s => 
      s.title.includes(property.title) || 
      (s.messages.length > 0 && s.messages[0].relatedPropertyId === id)
    );
    
    if (existingSession) {
      setCurrentSession(existingSession.id);
    } else {
      // Create a new session for this property
      const sessionTitle = `Chat about ${property.title}`;
      const propertyContext = {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyType: property.propertyType,
        price: property.price,
        location: typeof property.location === 'string' 
          ? property.location 
          : property.location?.city
      };
      
      createSession(sessionTitle, propertyContext);
      
      // Send an initial message about the property
      setTimeout(() => {
        sendMessage(`Tell me about this property: ${generatePropertySummary(property)}`);
      }, 500);
    }
    
    // Set property context
    setPropertyContext({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyType: property.propertyType,
      price: property.price,
      location: typeof property.location === 'string' 
        ? property.location 
        : property.location?.city
    });
  }, [property, id]);
  
  // Get current session messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }
  
  if (!currentSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PropertySuggestion property={property} />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ChatMessage 
            message={item} 
            isLastMessage={index === messages.length - 1} 
          />
        )}
        contentContainerStyle={styles.messagesList}
      />
      
      <ChatInput 
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask about this property..."
      />
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
  errorText: {
    fontSize: 16,
    color: Colors.text.dark,
  },
  messagesList: {
    paddingVertical: 16,
  },
});