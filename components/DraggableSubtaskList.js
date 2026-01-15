/**
 * DraggableSubtaskList - Reorderable Subtask List
 * Task List App 2026
 * 
 * Features:
 * - Drag and drop reordering
 * - Animated drag feedback
 * - Visual drop indicators
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';
import SubtaskItem from './SubtaskItem';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
};

const ITEM_HEIGHT = 58; // Approximate height of SubtaskItem

/**
 * Draggable wrapper for individual subtask
 */
function DraggableSubtask({
  subtask,
  index,
  onToggle,
  onDelete,
  onUpdate,
  onDragStart,
  onDragEnd,
  onDragMove,
  isDragging,
  dragIndex,
}) {
  const { colors } = useTheme();
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      runOnJS(onDragStart)(index);
      runOnJS(safeHaptics.impact)(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withSpring(1.03, { damping: 15 });
      zIndex.value = 100;
      opacity.value = 0.9;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      runOnJS(onDragMove)(index, event.translationY);
    })
    .onEnd(() => {
      runOnJS(onDragEnd)(index);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      opacity.value = 1;
    });

  const animatedStyle = useAnimatedStyle(() => {
    // If another item is being dragged, adjust position based on drag
    const shouldMoveUp = isDragging && dragIndex !== null && dragIndex < index;
    const shouldMoveDown = isDragging && dragIndex !== null && dragIndex > index;
    
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: zIndex.value,
      opacity: opacity.value,
      shadowColor: isDragging && dragIndex === index ? '#000' : 'transparent',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: isDragging && dragIndex === index ? 8 : 0,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.draggableItem, animatedStyle]}>
        <SubtaskItem
          subtask={subtask}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Main DraggableSubtaskList component
 */
export default function DraggableSubtaskList({
  subtasks,
  taskId,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  onReorderSubtasks,
}) {
  const { colors } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((index) => {
    setIsDragging(true);
    setDragIndex(index);
  }, []);

  const handleDragMove = useCallback((fromIndex, translationY) => {
    // Calculate which index we're hovering over
    const offset = Math.round(translationY / ITEM_HEIGHT);
    const newIndex = Math.max(0, Math.min(subtasks.length - 1, fromIndex + offset));
    
    if (newIndex !== dragOverIndex) {
      setDragOverIndex(newIndex);
    }
  }, [subtasks.length, dragOverIndex]);

  const handleDragEnd = useCallback((fromIndex) => {
    if (dragOverIndex !== null && dragOverIndex !== fromIndex && onReorderSubtasks) {
      onReorderSubtasks(taskId, fromIndex, dragOverIndex);
      safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDragging(false);
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragOverIndex, onReorderSubtasks, taskId]);

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {subtasks.map((subtask, index) => (
        <View key={subtask.id}>
          {/* Drop indicator above */}
          {isDragging && dragOverIndex === index && dragIndex !== index && dragIndex > index && (
            <View style={[styles.dropIndicator, { backgroundColor: colors.accentPurple }]} />
          )}
          
          <DraggableSubtask
            subtask={subtask}
            index={index}
            onToggle={() => onToggleSubtask(taskId, subtask.id)}
            onDelete={() => onDeleteSubtask(taskId, subtask.id)}
            onUpdate={onUpdateSubtask ? (updates) => onUpdateSubtask(taskId, subtask.id, updates) : undefined}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            isDragging={isDragging}
            dragIndex={dragIndex}
          />
          
          {/* Drop indicator below */}
          {isDragging && dragOverIndex === index && dragIndex !== index && dragIndex < index && (
            <View style={[styles.dropIndicator, { backgroundColor: colors.accentPurple }]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },

  draggableItem: {
    // Allow shadow to be visible
  },

  dropIndicator: {
    height: 2,
    borderRadius: 1,
    marginVertical: spacing.xs,
  },
});
