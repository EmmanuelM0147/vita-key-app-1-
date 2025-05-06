import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  Dimensions, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const thumbnailsRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveIndex(currentIndex);
    
    // Scroll thumbnails to keep active one visible
    thumbnailsRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const scrollToImage = (index: number) => {
    mainScrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      scrollToImage(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      scrollToImage(activeIndex + 1);
    }
  };

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      onPress={() => scrollToImage(index)}
      style={[
        styles.thumbnail,
        activeIndex === index && styles.activeThumbnail,
      ]}
    >
      <Image
        source={{ uri: item }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={mainScrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.navButton, activeIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={activeIndex === 0}
        >
          <ChevronLeft size={24} color={Colors.common.white} />
        </TouchableOpacity>
        
        <View style={styles.paginationDots}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, activeIndex === images.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={activeIndex === images.length - 1}
        >
          <ChevronRight size={24} color={Colors.common.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.thumbnailsContainer}>
        <FlatList
          ref={thumbnailsRef}
          data={images}
          renderItem={renderThumbnail}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsList}
          onScrollToIndexFailed={() => {}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    position: 'relative',
  },
  image: {
    width,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.common.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  thumbnailsList: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: Colors.primary.gold,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
});

export default ImageGallery;