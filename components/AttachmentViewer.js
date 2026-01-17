/**
 * AttachmentViewer Component
 * TaskList App - Phase 2 Attachments
 * 
 * Fullscreen modal for viewing attachments with zoom/pan for images
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';
import { formatFileSize, isImageType } from '../constants/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AttachmentViewer({
  visible,
  attachment,
  attachments = [],
  onClose,
  onDelete,
}) {
  const { colors, isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Initialize index based on selected attachment
  React.useEffect(() => {
    if (visible && attachment && attachments.length > 0) {
      const index = attachments.findIndex((a) => a.id === attachment.id);
      if (index !== -1) {
        setCurrentIndex(index);
        scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
      }
    }
  }, [visible, attachment, attachments]);

  const currentAttachment = attachments[currentIndex] || attachment;

  if (!currentAttachment) {
    return null;
  }

  const isImage = isImageType(currentAttachment.mimeType);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentAttachment.localUri);
      } else {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'No se pudo compartir el archivo');
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar adjunto',
      `¿Eliminar "${currentAttachment.filename}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete?.(currentAttachment);
            onClose();
          },
        },
      ]
    );
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < attachments.length) {
      setCurrentIndex(newIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        {/* Background blur */}
        <BlurView
          intensity={isDarkMode ? 80 : 100}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(100)}
          style={[styles.header, { backgroundColor: colors.bgPrimary + 'CC' }]}
        >
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.glassMedium }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text
              style={[styles.filename, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {currentAttachment.filename}
            </Text>
            <Text style={[styles.filesize, { color: colors.textSecondary }]}>
              {formatFileSize(currentAttachment.filesize)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.glassMedium }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.error + '30' }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.scrollContent}
        >
          {(attachments.length > 0 ? attachments : [attachment]).map((att, index) => (
            <View key={att.id} style={styles.slide}>
              {isImageType(att.mimeType) ? (
                <ScrollView
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.imageScrollContent}
                >
                  <Image
                    source={{ uri: att.localUri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </ScrollView>
              ) : (
                <View style={styles.documentPreview}>
                  <View
                    style={[
                      styles.documentIcon,
                      { backgroundColor: colors.accentPurple + '20' },
                    ]}
                  >
                    <Ionicons
                      name="document-text"
                      size={64}
                      color={colors.accentPurple}
                    />
                  </View>
                  <Text style={[styles.documentName, { color: colors.textPrimary }]}>
                    {att.filename}
                  </Text>
                  <Text style={[styles.documentType, { color: colors.textSecondary }]}>
                    {att.mimeType.split('/').pop()?.toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.openButton,
                      { backgroundColor: colors.accentPurple },
                    ]}
                    onPress={handleShare}
                  >
                    <Ionicons name="open-outline" size={20} color={colors.white} />
                    <Text style={[styles.openButtonText, { color: colors.white }]}>
                      Abrir con otra app
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Page indicator */}
        {attachments.length > 1 && (
          <Animated.View
            entering={FadeIn.delay(200)}
            style={[styles.pagination, { backgroundColor: colors.bgPrimary + 'CC' }]}
          >
            {attachments.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? colors.accentPurple
                        : colors.glassMedium,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 10,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },

  filename: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    maxWidth: '80%',
  },

  filesize: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  scrollContent: {
    alignItems: 'center',
  },

  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: SCREEN_HEIGHT - 250,
  },

  documentPreview: {
    alignItems: 'center',
    padding: spacing.xl,
  },

  documentIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  documentName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  documentType: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xl,
  },

  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },

  openButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
