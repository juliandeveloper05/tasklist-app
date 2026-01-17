/**
 * CategoryFilter - Horizontal Category Chips
 * Task List App 2025
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography, categories } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CategoryFilter({ selected, onSelect }) {
  const { colors } = useTheme();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      nestedScrollEnabled={true}
      bounces={true}
      alwaysBounceHorizontal={true}
      style={styles.scrollView}
    >
      {Object.values(categories).map((category, index) => (
        <CategoryChip
          key={category.id}
          category={category}
          isSelected={selected === category.id}
          onPress={() => onSelect(category.id)}
          delay={index * 50}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

function CategoryChip({ category, isSelected, onPress, delay, colors }) {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
      <AnimatedPressable
        style={[
          styles.chip,
          { backgroundColor: colors.glassLight, borderColor: colors.glassBorder },
          isSelected && { 
            backgroundColor: category.color + '30',
            borderColor: category.color,
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Ionicons 
          name={category.icon} 
          size={16} 
          color={isSelected ? category.color : colors.textSecondary} 
        />
        <Text style={[
          styles.chipText,
          { color: colors.textSecondary },
          isSelected && { color: category.color }
        ]}>
          {category.name}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingEnd: spacing.xl,
    gap: spacing.sm,
    flexGrow: 0,
  },
  
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

