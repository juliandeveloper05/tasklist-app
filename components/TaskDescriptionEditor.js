/**
 * TaskDescriptionEditor - Multiline Description/Notes Editor
 * Task List App 2026
 * 
 * Features:
 * - Multiline TextInput with glassmorphism
 * - Character counter (max 500)
 * - Expand/collapse for long text
 * - Animated interactions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

const MAX_CHARACTERS = 500;

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
};

export default function TaskDescriptionEditor({ 
  value = '', 
  onChange,
  placeholder = 'Agregar notas o descripción...',
  editable = true,
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const focusScale = useSharedValue(1);

  const characterCount = value.length;
  const isNearLimit = characterCount > MAX_CHARACTERS * 0.8;
  const isAtLimit = characterCount >= MAX_CHARACTERS;

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.01, { damping: 15, stiffness: 300 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleChange = (text) => {
    if (text.length <= MAX_CHARACTERS) {
      onChange(text);
    } else {
      safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  // Determine if text is long enough to need expand/collapse
  const needsExpand = value.length > 150 && !isFocused;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.glassMedium, 
          borderColor: isFocused ? colors.accentPurple : colors.glassBorder 
        },
        containerAnimatedStyle,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name="document-text-outline" 
            size={16} 
            color={isFocused ? colors.accentPurple : colors.textTertiary} 
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Notas
          </Text>
        </View>
        
        {/* Character counter */}
        <Animated.View 
          style={[
            styles.counter,
            { backgroundColor: isAtLimit ? colors.error + '20' : colors.glassMedium }
          ]}
          entering={FadeIn.duration(200)}
        >
          <Text style={[
            styles.counterText, 
            { color: isAtLimit ? colors.error : isNearLimit ? colors.warning : colors.textTertiary }
          ]}>
            {characterCount}/{MAX_CHARACTERS}
          </Text>
        </Animated.View>
      </View>

      {/* Text Input */}
      <TextInput
        style={[
          styles.input,
          { color: colors.textPrimary },
          !isExpanded && needsExpand && styles.inputCollapsed,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline
        textAlignVertical="top"
        editable={editable}
        maxLength={MAX_CHARACTERS}
      />

      {/* Expand/Collapse button for long text */}
      {needsExpand && !isFocused && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Pressable 
            style={[styles.expandButton, { backgroundColor: colors.accentPurple + '15' }]}
            onPress={toggleExpand}
          >
            <Text style={[styles.expandText, { color: colors.accentPurple }]}>
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </Text>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={14} 
              color={colors.accentPurple} 
            />
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  counter: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },

  counterText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  input: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    minHeight: 80,
    maxHeight: 200,
  },

  inputCollapsed: {
    maxHeight: 60,
    overflow: 'hidden',
  },

  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },

  expandText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
