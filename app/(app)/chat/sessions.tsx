import React from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Text,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useChatStore } from '@/store/chat-store';
import Colors from '@/constants/colors';
import ChatSessionItem from '@/components/chat/ChatSessionItem';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatSessionsScreen() {
  const router = useRouter();
  
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    setCurrentSession, 
    deleteSession 
  } = useChatStore();
  
  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    router.back();
  };
  
  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteSession(sessionId),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleNewChat = () => {
    const sessionId = createSession();
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Conversations</Text>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={handleNewChat}
        >
          <Plus size={20} color={Colors.text.light} />
          <Text style={styles.newButtonText}>New Chat</Text>
        </TouchableOpacity>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You don't have any conversations yet.
          </Text>
          <Text style={styles.emptySubtext}>
            Start a new chat to get property recommendations and advice.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatSessionItem 
              session={item}
              isActive={item.id === currentSessionId}
              onSelect={() => handleSelectSession(item.id)}
              onDelete={() => handleDeleteSession(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});