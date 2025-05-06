import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  backgroundColor?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges,
  backgroundColor = Colors.background.primary,
}) => {
  // For web, we don't need SafeAreaView
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges || ['top', 'right', 'bottom', 'left']}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;