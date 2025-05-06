import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X, Camera, SlidersHorizontal } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  onImageSearchPress?: () => void;
  placeholder?: string;
  containerStyle?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  onSearch,
  onFilterPress,
  onImageSearchPress,
  placeholder = 'Search properties...',
  containerStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  
  // Sync internal state with external value prop
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onChangeText) {
      onChangeText('');
    }
  };

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
        
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
        />
        
        {searchQuery ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.actionButtons}>
        {onImageSearchPress && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onImageSearchPress}
            accessibilityLabel="Search by image"
          >
            <Camera size={20} color={Colors.text.dark} />
          </TouchableOpacity>
        )}
        
        {onFilterPress && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onFilterPress}
            accessibilityLabel="Filter search results"
          >
            <SlidersHorizontal size={20} color={Colors.text.dark} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.dark,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

export default SearchBar;