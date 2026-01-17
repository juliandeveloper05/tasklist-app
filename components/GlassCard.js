/**
 * Glass Card Component
 * Bitrova - Glassmorphism with purple glow
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const GlassCard = ({ children, style, glowEffect = false }) => {
  return (
    <View style={[styles.card, glowEffect && styles.cardGlow, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassDark,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardGlow: {
    shadowColor: colors.accentStart,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
