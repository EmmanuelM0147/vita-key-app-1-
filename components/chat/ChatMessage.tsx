import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Message } from '@/types/chat';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
}

export default function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}>
        {message.isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={isUser ? Colors.text.light : Colors.text.dark} 
            style={styles.loader}
          />
        ) : (
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}>
            {message.content}
          </Text>
        )}
      </View>
      <Text style={styles.timestamp}>
        {formatTimestamp(message.timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  userBubble: {
    backgroundColor: Colors.primary,
  },
  assistantBubble: {
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.text.light,
  },
  assistantText: {
    color: Colors.text.dark,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
    marginHorizontal: 8,
  },
  loader: {
    padding: 10,
  },
});