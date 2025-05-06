import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { Send, Mic, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSend, 
  isLoading, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim() === '' || isLoading) return;
    
    onSend(message.trim());
    setMessage('');
    Keyboard.dismiss();
  };

  const clearInput = () => {
    setMessage('');
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={Colors.text.muted}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          {message.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearInput}
              disabled={isLoading}
            >
              <X size={18} color={Colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (message.trim() === '' || isLoading) && styles.disabledButton
          ]} 
          onPress={handleSend}
          disabled={message.trim() === '' || isLoading}
        >
          <Send 
            size={20} 
            color={message.trim() === '' || isLoading ? Colors.text.muted : Colors.text.light} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background.light,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 10,
    color: Colors.text.dark,
  },
  clearButton: {
    padding: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.background.muted,
  },
});