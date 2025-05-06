import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  onSubmit: (message: string) => Promise<void>;
  onCancel: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  propertyId,
  propertyTitle,
  onSubmit,
  onCancel,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(message);
      setMessage('');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError('Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Typography variant="h4" style={styles.title}>
              Send Inquiry
            </Typography>
            
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          </View>
          
          <Typography variant="body1" style={styles.propertyTitle}>
            {propertyTitle}
          </Typography>
          
          <View style={styles.form}>
            <Input
              label="Your Message"
              value={message}
              onChangeText={setMessage}
              placeholder="I'm interested in this property and would like to schedule a viewing..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={styles.messageInput}
              error={error}
            />
            
            <View style={styles.actions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onCancel}
                style={styles.cancelButton}
              />
              
              <Button
                title="Send Inquiry"
                variant="primary"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.common.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  propertyTitle: {
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  messageInput: {
    height: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default InquiryForm;