/**
 * SaveIndicator - Save State Visual Indicator
 * Task List App 2026
 * 
 * Features:
 * - States: idle, saving, success, error
 * - Animated transitions between states
 * - Toast notification style
 * - Auto-hide on success
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  notification: (type) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  }
};

// Save states
export const SAVE_STATES = {
  IDLE: 'idle',
  SAVING: 'saving',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function SaveIndicator({ 
  state = SAVE_STATES.IDLE,
  errorMessage = 'Error al guardar',
  onRetry,
  autoHideDuration = 2000,
  onHide,
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  // Animate on state change
  useEffect(() => {
    if (state === SAVE_STATES.SUCCESS) {
      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      // Auto-hide after success
      if (onHide) {
        const timer = setTimeout(() => {
          onHide();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else if (state === SAVE_STATES.ERROR) {
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      scale.value = withSequence(
        withTiming(1.05, { duration: 50 }),
        withTiming(0.95, { duration: 50 }),
        withTiming(1.05, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
    }
  }, [state, onHide, autoHideDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Don't render if idle
  if (state === SAVE_STATES.IDLE) {
    return null;
  }

  const getConfig = () => {
    switch (state) {
      case SAVE_STATES.SAVING:
        return {
          icon: null,
          text: 'Guardando...',
          bgColor: colors.glassMedium,
          borderColor: colors.glassBorder,
          textColor: colors.textSecondary,
          showSpinner: true,
        };
      case SAVE_STATES.SUCCESS:
        return {
          icon: 'checkmark-circle',
          text: 'Guardado',
          bgColor: colors.success + '20',
          borderColor: colors.success + '40',
          textColor: colors.success,
          showSpinner: false,
        };
      case SAVE_STATES.ERROR:
        return {
          icon: 'alert-circle',
          text: errorMessage,
          bgColor: colors.error + '20',
          borderColor: colors.error + '40',
          textColor: colors.error,
          showSpinner: false,
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
        animatedStyle,
      ]}
      entering={FadeIn.springify()}
      exiting={FadeOut.duration(200)}
    >
      {config.showSpinner ? (
        <ActivityIndicator size="small" color={config.textColor} />
      ) : (
        <Ionicons name={config.icon} size={18} color={config.textColor} />
      )}
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.text}
      </Text>
      {state === SAVE_STATES.ERROR && onRetry && (
        <Animated.View
          entering={FadeIn.delay(200)}
        >
          <Text 
            style={[styles.retryText, { color: config.textColor }]}
            onPress={onRetry}
          >
            Reintentar
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
    alignSelf: 'center',
  },

  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  retryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
    marginLeft: spacing.xs,
  },
});
