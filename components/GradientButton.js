/**
 * Gradient Button Component
 * Bitrova - Premium gradient CTA
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export const GradientButton = ({ title, onPress, disabled, loading }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.85} 
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.touchable}
    >
      <LinearGradient
        colors={[colors.accentStart, colors.accentEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.accentStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
