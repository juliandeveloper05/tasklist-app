/**
 * ColorThemePicker - Custom Color Theme Selector
 * Task List App 2025
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, { 
  FadeInDown,
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme, colorThemes } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ColorThemeOption = ({ theme, isSelected, onSelect, delay = 0, colors }) => {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onSelect(theme.id);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedTouchable
        style={[
          styles.themeOption,
          animatedStyle,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.colorCircle,
            isSelected && styles.selectedCircle,
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          )}
        </LinearGradient>
        <Text style={[
          styles.themeName, 
          { color: isSelected ? theme.primary : colors.textSecondary }
        ]}>
          {theme.name}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default function ColorThemePicker({ style }) {
  const { colors, selectedColorTheme, setColorTheme } = useTheme();
  
  const themes = Object.values(colorThemes);

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {themes.map((theme, index) => (
          <ColorThemeOption
            key={theme.id}
            theme={theme}
            isSelected={selectedColorTheme === theme.id}
            onSelect={setColorTheme}
            delay={index * 50}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  
  themeOption: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  selectedCircle: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  themeName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});
