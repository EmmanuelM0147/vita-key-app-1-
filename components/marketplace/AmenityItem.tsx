import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface AmenityItemProps {
  name: string;
}

export const AmenityItem: React.FC<AmenityItemProps> = ({ name }) => {
  return (
    <View style={styles.container}>
      <View style={styles.checkIcon}>
        <Check size={14} color={Colors.primary.gold} />
      </View>
      <Typography variant="body2" style={styles.name}>
        {name}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: Spacing.md,
  },
  checkIcon: {
    marginRight: Spacing.sm,
  },
  name: {
    flex: 1,
  },
});

export default AmenityItem;