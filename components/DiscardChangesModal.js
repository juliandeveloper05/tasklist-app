/**
 * DiscardChangesModal - Confirmation Modal for Unsaved Changes
 * Task List App 2026
 * 
 * Features:
 * - Three options: Save, Discard, Cancel
 * - Glassmorphism design
 * - Animated entrance/exit with Reanimated
 * - Haptic feedback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
  notification: (type) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  }
};

export default function DiscardChangesModal({ 
  visible, 
  onSave, 
  onDiscard, 
  onCancel,
  isSaving = false,
}) {
  const { colors } = useTheme();

  const handleSave = () => {
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Medium);
    onSave();
  };

  const handleDiscard = () => {
    safeHaptics.notification(Haptics.NotificationFeedbackType.Warning);
    onDiscard();
  };

  const handleCancel = () => {
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
      >
        {/* Backdrop - simple overlay that works on all platforms */}
        <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        
        {/* Modal Content */}
        <Animated.View 
          style={[
            styles.modalContainer,
            { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder }
          ]}
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="warning" size={28} color={colors.warning} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Cambios sin guardar
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              ¿Qué deseas hacer con los cambios realizados?
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Save Button */}
            <Pressable 
              style={[styles.button, styles.saveButton, { backgroundColor: colors.success }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Ionicons 
                name={isSaving ? "hourglass-outline" : "checkmark"} 
                size={20} 
                color={colors.white} 
              />
              <Text style={[styles.buttonText, { color: colors.white }]}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Text>
            </Pressable>

            {/* Discard Button */}
            <Pressable 
              style={[styles.button, styles.discardButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
              onPress={handleDiscard}
              disabled={isSaving}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.buttonText, { color: colors.error }]}>
                Descartar
              </Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable 
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder }]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  modalContainer: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },

  buttonsContainer: {
    gap: spacing.md,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },

  saveButton: {
    // Primary action - solid background
  },

  discardButton: {
    borderWidth: 1,
  },

  cancelButton: {
    borderWidth: 1,
  },

  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
