import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { QuickReply } from '@/types/chat';
import Colors from '@/constants/colors';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelectReply: (reply: string) => void;
}

export default function QuickReplies({ replies, onSelectReply }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Suggested questions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {replies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            style={styles.replyButton}
            onPress={() => onSelectReply(reply.text)}
          >
            <Text style={styles.replyText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background.light,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.muted,
    marginLeft: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  replyButton: {
    backgroundColor: Colors.background.muted,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replyText: {
    fontSize: 14,
    color: Colors.text.dark,
  },
});