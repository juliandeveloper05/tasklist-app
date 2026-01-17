/**
 * AttachmentCard Component
 * TaskList App - Phase 2 Attachments
 * 
 * Individual attachment display with preview and actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';
import { getFileIcon, formatFileSize, isImageType } from '../constants/storage';

export default function AttachmentCard({
  attachment,
  onPress,
  onDelete,
  size = 'medium', // small | medium | large
  showActions = true,
}) {
  const { colors } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = isImageType(attachment.mimeType);
  const iconName = getFileIcon(attachment.mimeType);

  // Size configurations
  const sizeConfig = {
    small: { container: 80, icon: 24, fontSize: 10 },
    medium: { container: 100, icon: 32, fontSize: 12 },
    large: { container: 140, icon: 40, fontSize: 14 },
  };

  const config = sizeConfig[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(attachment);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar adjunto',
      `¿Eliminar "${attachment.filename}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete?.(attachment),
        },
      ]
    );
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleDelete();
  };

  // Truncate filename
  const truncateFilename = (name, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const baseName = name.substring(0, name.length - ext.length - 1);
    const truncated = baseName.substring(0, maxLength - ext.length - 3);
    return `${truncated}...${ext}`;
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            width: config.container,
            height: config.container + 40,
            backgroundColor: colors.glassLight,
            borderColor: colors.glassBorder,
          },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Preview area */}
        <View
          style={[
            styles.preview,
            {
              width: config.container - 16,
              height: config.container - 16,
              backgroundColor: colors.glassMedium,
            },
          ]}
        >
          {isImage && !imageError ? (
            <>
              <Image
                source={{ uri: attachment.localUri }}
                style={styles.image}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {!imageLoaded && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={colors.accentPurple} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={config.icon}
                color={colors.accentPurple}
              />
            </View>
          )}

          {/* Upload status indicator */}
          {attachment.uploadStatus === 'uploading' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
              <Ionicons name="cloud-upload" size={12} color={colors.white} />
            </View>
          )}

          {attachment.uploadStatus === 'uploaded' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
              <Ionicons name="cloud-done" size={12} color={colors.white} />
            </View>
          )}

          {/* Delete button */}
          {showActions && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={12} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* File info */}
        <View style={styles.info}>
          <Text
            style={[
              styles.filename,
              { color: colors.textPrimary, fontSize: config.fontSize },
            ]}
            numberOfLines={1}
          >
            {truncateFilename(attachment.filename)}
          </Text>
          <Text
            style={[
              styles.filesize,
              { color: colors.textSecondary, fontSize: config.fontSize - 2 },
            ]}
          >
            {formatFileSize(attachment.filesize)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
  },

  preview: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    marginTop: spacing.xs,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },

  filename: {
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  filesize: {
    marginTop: 2,
  },
});
