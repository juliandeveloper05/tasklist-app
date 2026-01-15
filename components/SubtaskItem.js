/**
 * SubtaskItem - Individual Subtask Component
 * Task List App 2026
 * 
 * Features:
 * - Animated checkbox with Lottie
 * - Glassmorphism design
 * - Delete button
 * - Inline editing with double tap
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
  FadeOutRight,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';
import LottieCheckbox from './LottieCheckbox';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
};

export default function SubtaskItem({ subtask, onToggle, onDelete, onUpdate }) {
  const { colors } = useTheme();
  const checkScale = useSharedValue(subtask.completed ? 1 : 0);
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subtask.title);
  const inputRef = useRef(null);
  const lastTapRef = useRef(0);

  const handleToggle = () => {
    checkScale.value = withSpring(subtask.completed ? 0 : 1, { 
      damping: 12, 
      stiffness: 200 
    });
    onToggle();
  };

  // Handle double tap to enter edit mode
  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap - enter edit mode
      enterEditMode();
    } else {
      // Single tap - toggle completion
      handleToggle();
    }
    
    lastTapRef.current = now;
  };

  const enterEditMode = () => {
    if (subtask.completed) return; // Don't allow editing completed subtasks
    
    setEditText(subtask.title);
    setIsEditing(true);
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    
    // Focus input after render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();
    
    if (trimmedText.length === 0) {
      // Revert to original if empty
      setEditText(subtask.title);
    } else if (trimmedText !== subtask.title && onUpdate) {
      // Save changes
      onUpdate({ title: trimmedText });
      safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(subtask.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSaveEdit();
    } else if (e.nativeEvent.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder }]}
      entering={FadeInRight.springify()}
      exiting={FadeOutRight.springify()}
    >
      {/* Checkbox with Lottie animation */}
      <View style={styles.checkbox}>
        <LottieCheckbox
          checked={subtask.completed}
          onToggle={handleToggle}
          size={22}
        />
      </View>

      {/* Title or Edit Input */}
      {isEditing ? (
        <Animated.View 
          style={styles.editContainer}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
        >
          <TextInput
            ref={inputRef}
            style={[styles.editInput, { color: colors.textPrimary, borderColor: colors.accentPurple }]}
            value={editText}
            onChangeText={setEditText}
            onBlur={handleSaveEdit}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSaveEdit}
            autoFocus
            maxLength={100}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: colors.textTertiary + '20' }]}
            onPress={handleCancelEdit}
          >
            <Ionicons name="close" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Pressable style={styles.titleContainer} onPress={handlePress}>
          <Text 
            style={[
              styles.title,
              { color: colors.textPrimary },
              subtask.completed && { textDecorationLine: 'line-through', color: colors.textTertiary }
            ]}
            numberOfLines={2}
          >
            {subtask.title}
          </Text>
          {!subtask.completed && (
            <Text style={[styles.editHint, { color: colors.textTertiary }]}>
              Doble tap para editar
            </Text>
          )}
        </Pressable>
      )}

      {/* Delete button */}
      {!isEditing && (
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },

  checkbox: {
    marginRight: spacing.md,
  },

  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },

  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },

  editHint: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
    opacity: 0,
  },

  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    gap: spacing.xs,
  },

  editInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },

  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
