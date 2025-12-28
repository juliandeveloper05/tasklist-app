/**
 * SearchBar Component
 * Task List App 2026
 * Premium search bar with glassmorphism design
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar tareas...' }) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? colors.accentPurple : colors.textTertiary} 
        style={styles.searchIcon}
      />
      
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.accentPurple}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <AnimatedTouchable
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.textTertiary} 
          />
        </AnimatedTouchable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassMedium,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },

  containerFocused: {
    borderColor: colors.accentPurple,
    backgroundColor: colors.glassStrong,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },

  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
