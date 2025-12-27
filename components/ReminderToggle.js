/**
 * ReminderToggle - Notification Toggle Button
 * Task List App 2026
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ReminderToggle({ 
  enabled, 
  onToggle, 
  disabled = false,
  label = "Recordarme" 
}) {
  const progress = useSharedValue(enabled ? 1 : 0);
  
  React.useEffect(() => {
    progress.value = withSpring(enabled ? 1 : 0, { damping: 15, stiffness: 120 });
  }, [enabled]);

  const handlePress = () => {
    if (disabled) return;
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    onToggle(!enabled);
  };

  const toggleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.glassMedium, colors.accentPurple + '40']
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.glassBorder, colors.accentPurple]
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(enabled ? 20 : 0, { damping: 15 }) }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.textTertiary, colors.accentPurple]
    ),
  }));

  return (
    <Pressable 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={handlePress}
    >
      <View style={styles.labelContainer}>
        <Ionicons 
          name={enabled ? "notifications" : "notifications-outline"} 
          size={20} 
          color={enabled ? colors.accentPurple : colors.textTertiary} 
        />
        <Text style={[
          styles.label,
          enabled && styles.labelActive,
        ]}>
          {label}
        </Text>
      </View>
      
      <Animated.View style={[styles.toggle, toggleStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  label: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  
  labelActive: {
    color: colors.accentPurple,
    fontWeight: typography.fontWeight.medium,
  },
  
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'center',
  },
  
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
