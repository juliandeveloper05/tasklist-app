/**
 * LottieCheckbox - Animated Checkbox Component
 * Task List App 2026
 * 
 * A beautiful animated checkbox using Lottie
 */

import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function LottieCheckbox({ checked, onToggle, size = 28 }) {
  const { colors } = useTheme();
  const animationRef = useRef(null);
  const wasChecked = useRef(checked);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Only play animation when transitioning from unchecked to checked
    if (checked && !wasChecked.current && animationRef.current) {
      animationRef.current.play(0, 40);
      scale.value = withSpring(1.2, { damping: 10, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      });
    }
    wasChecked.current = checked;
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    onToggle();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.7}
      style={styles.touchable}
    >
      <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
        {checked ? (
          <LottieView
            ref={animationRef}
            source={require('../assets/animations/check-animation.json')}
            autoPlay={false}
            loop={false}
            style={[styles.animation, { width: size, height: size }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.uncheckedCircle, 
            { 
              width: size - 4, 
              height: size - 4, 
              borderColor: colors.textTertiary 
            }
          ]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    padding: 2,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    // Lottie animation fills container
  },
  uncheckedCircle: {
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});
