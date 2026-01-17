/**
 * Input Field Component
 * Bitrova - Glass input with icon support
 */

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const InputField = ({ 
  placeholder, 
  value,
  onChangeText,
  secureTextEntry,
  icon,
  rightIcon,
  onRightIconPress,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  onFocus,
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color={colors.textTertiary} 
          style={styles.leftIcon} 
        />
      )}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={onFocus}
        style={[styles.input, icon && styles.inputWithIcon, rightIcon && styles.inputWithRightIcon]}
      />
      {rightIcon && (
        <TouchableOpacity 
          onPress={onRightIconPress}
          style={styles.rightIconButton}
        >
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={colors.textTertiary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.glassInput,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 16,
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    padding: 16,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  rightIconButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});
