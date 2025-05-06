import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ReviewType } from '@/types/review';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  type: ReviewType;
  targetId: string;
  targetName: string;
  mode: 'view' | 'add';
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  type,
  targetId,
  targetName,
  mode
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h4">
              {mode === 'add' ? 'Write a Review' : 'Reviews'}
            </Typography>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {mode === 'add' ? (
              <ReviewForm
                type={type}
                targetId={targetId}
                targetName={targetName}
                onSuccess={onClose}
              />
            ) : (
              <>
                <ReviewSummary type={type} targetId={targetId} />
                <View style={styles.divider} />
                <ReviewList
                  type={type}
                  targetId={targetId}
                  showViewMore={false}
                />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.common.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.secondary,
    marginVertical: Spacing.md,
  },
});

export default ReviewModal;