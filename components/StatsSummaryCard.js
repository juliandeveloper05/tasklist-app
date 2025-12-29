/**
 * StatsSummaryCard - Reusable Metric Card
 * Task List App 2026
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

export default function StatsSummaryCard({ 
  icon, 
  value, 
  label, 
  sublabel,
  color, 
  delay = 0,
  size = 'normal' // 'normal' or 'large'
}) {
  const { colors } = useTheme();
  const cardColor = color || colors.accentPurple;
  const isLarge = size === 'large';
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder },
        isLarge && styles.containerLarge
      ]}
      entering={FadeInUp.delay(delay).springify()}
    >
      <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
        <Ionicons name={icon} size={isLarge ? 28 : 22} color={cardColor} />
      </View>
      <View style={styles.content}>
        <Text style={[
          styles.value, 
          { color: colors.textPrimary },
          isLarge && styles.valueLarge
        ]}>
          {value}
        </Text>
        <Text style={[styles.label, { color: colors.textTertiary }]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.sublabel, { color: cardColor }]}>
            {sublabel}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  containerLarge: {
    padding: spacing.xl,
  },
  
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  value: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  
  valueLarge: {
    fontSize: typography.fontSize.xxxl,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  
  sublabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
});
