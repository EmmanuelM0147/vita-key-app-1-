import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Text,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { History, Plus } from 'lucide-react-native';
import { useChatStore } from '@/store/chat-store';
import { generateQuickReplies } from '@/services/ai-chatbot';
import { Message, QuickReply } from '@/types/chat';
import Colors from '@/constants/colors';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import QuickReplies from '@/components/chat/QuickReplies';
import { generateUniqueId } from '@/utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    sessions, 
    currentSessionId, 
    isLoading, 
    createSession, 
    setCurrentSession, 
    sendMessage 
  } = useChatStore();
  
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  
  // Create a new session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    } else if (!currentSessionId) {
      setCurrentSession(sessions[0].id);
    }
  }, [sessions, currentSessionId]);
  
  // Get current session messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  
  // Generate quick replies based on the last assistant message
  useEffect(() => {
    if (messages.length > 0) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find(msg => msg.role === 'assistant' && !msg.isLoading);
      
      if (lastAssistantMessage) {
        const replies = generateQuickReplies(lastAssistantMessage.content);
        
        setQuickReplies(
          replies.map(text => ({
            id: generateUniqueId(),
            text
          }))
        );
      }
    }
  }, [messages]);
  
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
  
  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };
  
  const handleNewChat = () => {
    createSession();
  };
  
  const handleViewHistory = () => {
    router.push('/chat/sessions');
  };
  
  if (!currentSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNewChat}
        >
          <Plus size={20} color={Colors.primary} />
          <Text style={styles.headerButtonText}>New Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleViewHistory}
        >
          <History size={20} color={Colors.primary} />
          <Text style={styles.headerButtonText}>History</Text>
        </TouchableOpacity>
      </View>
      
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
      
      <QuickReplies 
        replies={quickReplies}
        onSelectReply={handleQuickReply}
      />
      
      <ChatInput 
        onSend={handleSendMessage}
        isLoading={isLoading}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  messagesList: {
    paddingVertical: 16,
  },
});