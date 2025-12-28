/**
 * Task Details Screen - Task List App 2026
 * View and Edit Task Details with Modern Glassmorphism
 */

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { TaskContext } from '../context/TaskContext';
import { colors, spacing, borderRadius, typography, categories, priorities } from '../constants/theme';
import DatePickerButton from '../components/DatePickerButton';
import ReminderToggle from '../components/ReminderToggle';

// Safe haptics wrapper for web compatibility
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
  notification: (type) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  }
};

export default function TaskDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params || {};
  const { tasks, updateTask, deleteTask, toggleCompleted } = useContext(TaskContext);
  
  // Find the task
  const task = tasks.find(t => t.id === taskId);
  
  // Local state for editing
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [enableReminder, setEnableReminder] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize state when task loads
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setSelectedCategory(task.category || 'personal');
      setSelectedPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setEnableReminder(task.enableReminder || false);
    }
  }, [task]);
  
  // Track changes
  useEffect(() => {
    if (task) {
      const changed = 
        title !== task.title ||
        selectedCategory !== task.category ||
        selectedPriority !== task.priority ||
        (dueDate?.toISOString() || null) !== task.dueDate ||
        enableReminder !== task.enableReminder;
      setHasChanges(changed);
    }
  }, [title, selectedCategory, selectedPriority, dueDate, enableReminder, task]);
  
  if (!task) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Tarea no encontrada</Text>
        <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = () => {
    if (!title.trim()) {
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    updateTask(taskId, {
      title: title.trim(),
      category: selectedCategory,
      priority: selectedPriority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      enableReminder: enableReminder && dueDate !== null,
    });
    
    safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleDelete = () => {
    const performDelete = () => {
      deleteTask(taskId);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Tarea',
        '¿Estás seguro de que quieres eliminar esta tarea?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const handleToggleComplete = () => {
    toggleCompleted(taskId);
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  // Format creation date
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter out 'all' category
  const taskCategories = Object.values(categories).filter(c => c.id !== 'all');
  const priority = priorities[task.priority] || priorities.medium;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeInUp.springify()}
      >
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalles</Text>
        <Pressable 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Completion Status */}
        <Animated.View
          entering={FadeInUp.delay(50).springify()}
        >
          <Pressable 
            style={[
              styles.statusCard,
              task.completed && styles.statusCardCompleted
            ]}
            onPress={handleToggleComplete}
          >
            <View style={[
              styles.checkCircle,
              task.completed && styles.checkCircleCompleted
            ]}>
              {task.completed && (
                <Ionicons name="checkmark" size={20} color={colors.white} />
              )}
            </View>
            <Text style={[
              styles.statusText,
              task.completed && styles.statusTextCompleted
            ]}>
              {task.completed ? 'Completada' : 'Pendiente'}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: task.completed ? colors.success + '20' : priority.color + '20' }
            ]}>
              <Ionicons 
                name={task.completed ? 'checkmark-circle' : priority.icon} 
                size={16} 
                color={task.completed ? colors.success : priority.color} 
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Task Title Input */}
        <Animated.View 
          style={styles.section}
          entering={FadeInUp.delay(100).springify()}
        >
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la tarea"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            multiline
            maxLength={200}
          />
        </Animated.View>

        {/* Creation Date Info */}
        <Animated.View 
          style={styles.section}
          entering={FadeInUp.delay(150).springify()}
        >
          <Text style={styles.label}>Creada</Text>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
            <Text style={styles.infoText}>{formatDate(task.createdAt)}</Text>
          </View>
        </Animated.View>

        {/* Category Selection */}
        <Animated.View 
          style={styles.section}
          entering={FadeInUp.delay(200).springify()}
        >
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.optionsGrid}>
            {taskCategories.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInRight.delay(200 + index * 50).springify()}
              >
                <Pressable
                  style={[
                    styles.optionCard,
                    selectedCategory === category.id && {
                      backgroundColor: category.color + '20',
                      borderColor: category.color,
                    }
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[
                    styles.optionIcon,
                    { backgroundColor: category.color + '30' }
                  ]}>
                    <Ionicons 
                      name={category.icon} 
                      size={20} 
                      color={category.color} 
                    />
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedCategory === category.id && { color: category.color }
                  ]}>
                    {category.name}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Due Date Selection */}
        <Animated.View 
          style={styles.section}
          entering={FadeInUp.delay(250).springify()}
        >
          <Text style={styles.label}>Fecha límite</Text>
          <DatePickerButton 
            value={dueDate}
            onChange={(date) => {
              setDueDate(date);
              if (date && !enableReminder) {
                setEnableReminder(true);
              }
            }}
            placeholder="Agregar fecha límite"
          />
          
          {/* Reminder Toggle */}
          {dueDate && (
            <Animated.View
              style={{ marginTop: spacing.md }}
              entering={FadeInUp.springify()}
            >
              <ReminderToggle 
                enabled={enableReminder}
                onToggle={setEnableReminder}
                label="Recordarme a las 9:00 AM"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Priority Selection */}
        <Animated.View 
          style={styles.section}
          entering={FadeInUp.delay(300).springify()}
        >
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {Object.values(priorities).map((priority, index) => (
              <Animated.View
                key={priority.id}
                style={styles.priorityItem}
                entering={FadeInRight.delay(300 + index * 50).springify()}
              >
                <Pressable
                  style={[
                    styles.priorityCard,
                    selectedPriority === priority.id && {
                      backgroundColor: priority.color + '20',
                      borderColor: priority.color,
                    }
                  ]}
                  onPress={() => {
                    setSelectedPriority(priority.id);
                    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons 
                    name={priority.icon} 
                    size={24} 
                    color={selectedPriority === priority.id ? priority.color : colors.textTertiary} 
                  />
                  <Text style={[
                    styles.priorityText,
                    selectedPriority === priority.id && { color: priority.color }
                  ]}>
                    {priority.name}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        
        {/* Spacer for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button - only show if changes */}
      {hasChanges && (
        <Animated.View 
          style={styles.footer}
          entering={FadeInUp.springify()}
        >
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              <Ionicons name="checkmark" size={24} color={colors.white} />
              <Text style={styles.saveText}>Guardar Cambios</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  backLink: {
    padding: spacing.md,
  },
  
  backLinkText: {
    fontSize: typography.fontSize.md,
    color: colors.accentPurple,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  section: {
    marginBottom: spacing.xl,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  
  statusCardCompleted: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
  },
  
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  
  statusText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  
  statusTextCompleted: {
    color: colors.success,
  },
  
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  input: {
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  optionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  priorityItem: {
    flex: 1,
  },
  
  priorityCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.glassMedium,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  
  priorityText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.bgPrimary,
  },
  
  saveButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  
  saveText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
