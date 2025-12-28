/**
 * StatsWidget - Productivity Statistics
 * Task List App 2025
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInRight,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

export default function StatsWidget({ tasks = [] }) {
  const { colors } = useTheme();
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedToday = tasks.filter(t => t.completed).length;
  const pending = totalTasks - completedToday;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;
  
  // Get high priority pending
  const highPriorityPending = tasks.filter(t => !t.completed && t.priority === 'high').length;

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder }]}
      entering={FadeInRight.delay(200).springify()}
    >
      {/* Progress Ring */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressRing, { borderColor: colors.glassStrong }]}>
          <View style={[styles.progressFill, { 
            borderColor: colors.accentPurple,
            transform: [{ rotate: `${(completionRate * 3.6)}deg` }] 
          }]} />
          <View style={[styles.progressCenter, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.progressPercent, { color: colors.textPrimary }]}>{completionRate}%</Text>
          </View>
        </View>
      </View>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatItem 
          icon="checkmark-circle"
          value={completedToday}
          label="Completadas"
          color={colors.success}
          colors={colors}
          delay={100}
        />
        <StatItem 
          icon="time-outline"
          value={pending}
          label="Pendientes"
          color={colors.accentCyan}
          colors={colors}
          delay={200}
        />
        <StatItem 
          icon="alert-circle"
          value={highPriorityPending}
          label="Urgentes"
          color={colors.priorityHigh}
          colors={colors}
          delay={300}
        />
      </View>
    </Animated.View>
  );
}

function StatItem({ icon, value, label, color, colors, delay }) {
  return (
    <Animated.View 
      style={styles.statItem}
      entering={FadeInRight.delay(delay).springify()}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  progressContainer: {
    marginRight: spacing.lg,
  },
  
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  progressFill: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  
  progressCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  
  statLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});

