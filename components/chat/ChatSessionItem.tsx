import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { ChatSession } from '@/types/chat';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/helpers';

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function ChatSessionItem({ 
  session, 
  isActive, 
  onSelect, 
  onDelete 
}: ChatSessionItemProps) {
  // Get the last message that's not loading
  const lastMessage = [...session.messages]
    .reverse()
    .find(msg => !msg.isLoading);
  
  // Format the date
  const formattedDate = formatDate(session.lastUpdated);
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isActive && styles.activeContainer
      ]}
      onPress={onSelect}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {session.title}
        </Text>
        
        {lastMessage && (
          <Text style={styles.preview} numberOfLines={2}>
            {lastMessage.content}
          </Text>
        )}
        
        <Text style={styles.date}>
          {formattedDate}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Trash2 size={18} color={Colors.text.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeContainer: {
    backgroundColor: Colors.background.muted,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 16,
  },
});