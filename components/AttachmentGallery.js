/**
 * AttachmentGallery Component
 * TaskList App - Phase 2 Attachments
 * 
 * Grid layout for displaying multiple attachments
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';
import AttachmentCard from './AttachmentCard';

export default function AttachmentGallery({
  attachments = [],
  onAttachmentPress,
  onAttachmentDelete,
  onAddPress,
  maxDisplay = 6,
  size = 'medium',
  editable = true,
}) {
  const { colors } = useTheme();

  const displayedAttachments = attachments.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, attachments.length - maxDisplay);

  if (attachments.length === 0 && !editable) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(100).springify()}
      style={[
        styles.container,
        { backgroundColor: colors.glassLight, borderColor: colors.glassBorder },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="attach" size={20} color={colors.accentPurple} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Adjuntos {attachments.length > 0 && `(${attachments.length})`}
          </Text>
        </View>

        {editable && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accentPurple + '20' }]}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.accentPurple} />
            <Text style={[styles.addButtonText, { color: colors.accentPurple }]}>
              Adjuntar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Attachments grid */}
      {attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {displayedAttachments.map((attachment, index) => (
            <View key={attachment.id} style={styles.cardWrapper}>
              <AttachmentCard
                attachment={attachment}
                onPress={onAttachmentPress}
                onDelete={onAttachmentDelete}
                size={size}
                showActions={editable}
              />
            </View>
          ))}

          {/* Show more indicator */}
          {hiddenCount > 0 && (
            <TouchableOpacity
              style={[
                styles.moreCard,
                {
                  backgroundColor: colors.glassMedium,
                  borderColor: colors.glassBorder,
                },
              ]}
              onPress={() => onAttachmentPress?.(displayedAttachments[0])}
              activeOpacity={0.7}
            >
              <Text style={[styles.moreCount, { color: colors.accentPurple }]}>
                +{hiddenCount}
              </Text>
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                más
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-upload-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay archivos adjuntos
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
            Toca "Adjuntar" para agregar imágenes o documentos
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },

  addButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  scrollContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },

  cardWrapper: {
    marginRight: spacing.xs,
  },

  moreCard: {
    width: 80,
    height: 120,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreCount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  moreText: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },

  emptyHint: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
