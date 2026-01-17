/**
 * AttachmentPicker Component
 * TaskList App - Phase 2 Attachments
 * 
 * Bottom sheet modal for selecting attachment source
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';

const AttachmentOption = ({ icon, title, subtitle, onPress, color, colors, disabled }) => (
  <TouchableOpacity
    style={[
      styles.option,
      { backgroundColor: colors.glassLight, borderColor: colors.glassBorder },
      disabled && styles.optionDisabled,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={[styles.optionIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.optionContent}>
      <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
  </TouchableOpacity>
);

export default function AttachmentPicker({ 
  visible, 
  onClose, 
  onPickImage, 
  onTakePhoto, 
  onPickDocument,
  isLoading = false,
}) {
  const { colors, isDarkMode } = useTheme();

  const handleOptionPress = async (handler) => {
    await handler();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <BlurView
            intensity={isDarkMode ? 40 : 60}
            tint={isDarkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Pressable>

      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.springify()}
        style={[
          styles.sheet,
          { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder },
        ]}
      >
        {/* Handle bar */}
        <View style={[styles.handleBar, { backgroundColor: colors.glassMedium }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Adjuntar archivo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Máximo 10MB por archivo
          </Text>
        </View>

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accentPurple} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Procesando archivo...
            </Text>
          </View>
        )}

        {/* Options */}
        {!isLoading && (
          <View style={styles.options}>
            {Platform.OS !== 'web' && (
              <AttachmentOption
                icon="camera"
                title="Tomar foto"
                subtitle="Usar la cámara del dispositivo"
                onPress={() => handleOptionPress(onTakePhoto)}
                color={colors.accentPink}
                colors={colors}
              />
            )}

            <AttachmentOption
              icon="image"
              title="Elegir de galería"
              subtitle="Seleccionar una imagen existente"
              onPress={() => handleOptionPress(onPickImage)}
              color={colors.accentPurple}
              colors={colors}
            />

            <AttachmentOption
              icon="document"
              title="Seleccionar documento"
              subtitle="PDF, Word, texto"
              onPress={() => handleOptionPress(onPickDocument)}
              color={colors.accentCyan}
              colors={colors}
            />
          </View>
        )}

        {/* Cancel button */}
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.glassMedium }]}
          onPress={onClose}
        >
          <Text style={[styles.cancelText, { color: colors.textPrimary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
  },

  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  header: {
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
  },

  options: {
    gap: spacing.sm,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  optionDisabled: {
    opacity: 0.5,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },

  optionSubtitle: {
    fontSize: typography.fontSize.sm,
  },

  cancelButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  loadingOverlay: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
  },
});
