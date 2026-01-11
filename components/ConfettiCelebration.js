/**
 * ConfettiCelebration - Celebration Animation Component
 * Task List App 2026
 * 
 * Shows a confetti animation when all tasks are completed
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function ConfettiCelebration({ visible, onComplete }) {
  const animationRef = useRef(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      // Auto-hide after animation completes
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 1800); // Animation duration + a bit extra
      
      return () => clearTimeout(timeout);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none',
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        speed={1}
        style={styles.animation}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  animation: {
    width: width,
    height: height,
  },
});
