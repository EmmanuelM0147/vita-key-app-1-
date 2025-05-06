import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';

export interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Typography
              variant="body2"
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background.main,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  categoryText: {
    color: Colors.text.primary,
  },
  selectedCategoryText: {
    color: Colors.text.onPrimary,
  },
});

export default CategorySelector;