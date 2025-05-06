import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const THUMB_SIZE = 24;

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  values: [number, number];
  onValuesChange: (values: [number, number]) => void;
}

// Simple fallback for web
const WebRangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  values,
  onValuesChange,
}) => {
  const handleMinChange = (e: any) => {
    const newMin = parseInt(e.target.value);
    onValuesChange([newMin, values[1]]);
  };

  const handleMaxChange = (e: any) => {
    const newMax = parseInt(e.target.value);
    onValuesChange([values[0], newMax]);
  };

  return (
    <View style={styles.webContainer}>
      <Text style={styles.webLabel}>Min: ${values[0].toLocaleString()}</Text>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={values[0]}
        onChange={handleMinChange}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <Text style={styles.webLabel}>Max: ${values[1].toLocaleString()}</Text>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={values[1]}
        onChange={handleMaxChange}
        style={{ width: '100%' }}
      />
    </View>
  );
};

// Simple implementation for mobile without Reanimated for compatibility
const SimpleMobileSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  values,
  onValuesChange,
}) => {
  const [localValues, setLocalValues] = useState<[number, number]>(values);
  
  const getPositionFromValue = (value: number) => {
    return ((value - min) / (max - min)) * SLIDER_WIDTH;
  };
  
  const getValueFromPosition = (position: number) => {
    const rawValue = (position / SLIDER_WIDTH) * (max - min) + min;
    // Snap to step
    return Math.round(rawValue / step) * step;
  };
  
  const minPosition = getPositionFromValue(localValues[0]);
  const maxPosition = getPositionFromValue(localValues[1]);
  
  const handleMinButtonPress = (direction: 'decrease' | 'increase') => {
    const change = direction === 'decrease' ? -step : step;
    const newValue = Math.max(min, Math.min(localValues[0] + change, localValues[1] - step));
    const newValues: [number, number] = [newValue, localValues[1]];
    setLocalValues(newValues);
    onValuesChange(newValues);
  };
  
  const handleMaxButtonPress = (direction: 'decrease' | 'increase') => {
    const change = direction === 'decrease' ? -step : step;
    const newValue = Math.min(max, Math.max(localValues[1] + change, localValues[0] + step));
    const newValues: [number, number] = [localValues[0], newValue];
    setLocalValues(newValues);
    onValuesChange(newValues);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.controlRow}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => handleMinButtonPress('decrease')}
          disabled={localValues[0] <= min}
        >
          <Text style={styles.controlButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.valueText}>${localValues[0].toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => handleMinButtonPress('increase')}
          disabled={localValues[0] >= localValues[1] - step}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.track}>
        <View 
          style={[
            styles.range, 
            { 
              left: minPosition + THUMB_SIZE / 2, 
              width: maxPosition - minPosition 
            }
          ]} 
        />
        <View 
          style={[
            styles.thumb, 
            { left: minPosition }
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
        <View 
          style={[
            styles.thumb, 
            { left: maxPosition }
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>
      
      <View style={styles.controlRow}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => handleMaxButtonPress('decrease')}
          disabled={localValues[1] <= localValues[0] + step}
        >
          <Text style={styles.controlButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.valueText}>${localValues[1].toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => handleMaxButtonPress('increase')}
          disabled={localValues[1] >= max}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Native implementation with Reanimated - only used when not on web and when gesture handler is available
const NativeRangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  values,
  onValuesChange,
}) => {
  const [localValues, setLocalValues] = useState<[number, number]>(values);
  
  const minThumbX = useSharedValue(((values[0] - min) / (max - min)) * SLIDER_WIDTH);
  const maxThumbX = useSharedValue(((values[1] - min) / (max - min)) * SLIDER_WIDTH);

  const updateValues = (newMinX: number, newMaxX: number) => {
    const newMinValue = Math.round((newMinX / SLIDER_WIDTH) * (max - min) + min);
    const newMaxValue = Math.round((newMaxX / SLIDER_WIDTH) * (max - min) + min);
    
    // Ensure values are within bounds and min <= max
    const clampedMinValue = Math.max(min, Math.min(newMinValue, newMaxValue - step));
    const clampedMaxValue = Math.min(max, Math.max(newMaxValue, clampedMinValue + step));
    
    // Snap to step
    const snappedMinValue = Math.round((clampedMinValue - min) / step) * step + min;
    const snappedMaxValue = Math.round((clampedMaxValue - min) / step) * step + min;
    
    setLocalValues([snappedMinValue, snappedMaxValue]);
    onValuesChange([snappedMinValue, snappedMaxValue]);
  };

  const minThumbGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = minThumbX.value;
    },
    onActive: (event, ctx) => {
      const newX = Math.max(0, Math.min(maxThumbX.value - THUMB_SIZE, ctx.startX + event.translationX));
      minThumbX.value = newX;
      runOnJS(updateValues)(newX, maxThumbX.value);
    },
  });

  const maxThumbGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = maxThumbX.value;
    },
    onActive: (event, ctx) => {
      const newX = Math.min(SLIDER_WIDTH, Math.max(minThumbX.value + THUMB_SIZE, ctx.startX + event.translationX));
      maxThumbX.value = newX;
      runOnJS(updateValues)(minThumbX.value, newX);
    },
  });

  const minThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: minThumbX.value }],
    };
  });

  const maxThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: maxThumbX.value }],
    };
  });

  const rangeStyle = useAnimatedStyle(() => {
    return {
      left: minThumbX.value + THUMB_SIZE / 2,
      width: maxThumbX.value - minThumbX.value,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.track} />
      
      <Animated.View style={[styles.range, rangeStyle]} />
      
      <PanGestureHandler onGestureEvent={minThumbGestureHandler}>
        <Animated.View style={[styles.thumb, minThumbStyle]}>
          <View style={styles.thumbInner} />
        </Animated.View>
      </PanGestureHandler>
      
      <PanGestureHandler onGestureEvent={maxThumbGestureHandler}>
        <Animated.View style={[styles.thumb, maxThumbStyle]}>
          <View style={styles.thumbInner} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export const RangeSlider: React.FC<RangeSliderProps> = (props) => {
  // Use a simpler implementation for web
  if (Platform.OS === 'web') {
    return <WebRangeSlider {...props} />;
  }
  
  // Use a simple implementation for mobile to avoid gesture handler issues
  return <SimpleMobileSlider {...props} />;
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: SLIDER_WIDTH,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  track: {
    height: 4,
    backgroundColor: Colors.secondary.sage,
    borderRadius: 2,
    marginVertical: 20,
  },
  range: {
    height: 4,
    backgroundColor: Colors.primary.gold,
    borderRadius: 2,
    position: 'absolute',
    top: 38,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.common.white,
    position: 'absolute',
    top: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.gold,
  },
  thumbInner: {
    width: THUMB_SIZE / 2,
    height: THUMB_SIZE / 2,
    borderRadius: THUMB_SIZE / 4,
    backgroundColor: Colors.primary.gold,
  },
  webContainer: {
    padding: 10,
  },
  webLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  controlButtonText: {
    color: Colors.common.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'center',
  },
});

export default RangeSlider;