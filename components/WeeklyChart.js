/**
 * WeeklyChart - Animated Bar Chart for 7 Days
 * Task List App 2026
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

export default function WeeklyChart({ data = [], dataKey = 'tasksCompleted', color }) {
  const { colors } = useTheme();
  const chartColor = color || colors.accentPurple;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0), 1);
  
  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: colors.glassMedium, borderColor: colors.glassBorder }]}
      entering={FadeInUp.delay(200).springify()}
    >
      <View style={styles.barsContainer}>
        {data.map((day, index) => (
          <BarItem
            key={day.date}
            value={day[dataKey] || 0}
            maxValue={maxValue}
            dayName={day.dayName}
            isToday={day.isToday}
            color={chartColor}
            colors={colors}
            delay={index * 50}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function BarItem({ value, maxValue, dayName, isToday, color, colors, delay }) {
  const barHeight = useSharedValue(0);
  const percentage = (value / maxValue) * 100;
  
  useEffect(() => {
    barHeight.value = withDelay(delay, withSpring(percentage, {
      damping: 15,
      stiffness: 100,
    }));
  }, [percentage, delay]);
  
  const animatedBarStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%`,
  }));
  
  return (
    <View style={styles.barItem}>
      <Text style={[styles.barValue, { color: colors.textSecondary }]}>
        {value > 0 ? value : ''}
      </Text>
      <View style={[styles.barTrack, { backgroundColor: colors.glassLight }]}>
        <Animated.View 
          style={[
            styles.barFill, 
            { backgroundColor: isToday ? color : color + 'AA' },
            animatedBarStyle
          ]} 
        />
      </View>
      <Text style={[
        styles.dayLabel, 
        { color: isToday ? color : colors.textTertiary },
        isToday && styles.dayLabelToday
      ]}>
        {dayName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: spacing.lg,
  },
  
  barItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  
  barValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    height: 16,
  },
  
  barTrack: {
    flex: 1,
    width: 24,
    borderRadius: borderRadius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  
  barFill: {
    width: '100%',
    borderRadius: borderRadius.md,
    minHeight: 4,
  },
  
  dayLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
  },
  
  dayLabelToday: {
    fontWeight: typography.fontWeight.bold,
  },
});
