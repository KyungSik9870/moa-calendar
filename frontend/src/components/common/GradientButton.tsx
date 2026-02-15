import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENTS, COLORS, RADIUS} from '../../constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GradientButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: GradientButtonProps) {
  if (variant === 'danger') {
    return (
      <TouchableOpacity
        style={[styles.button, {backgroundColor: COLORS.danger}, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}>
      <LinearGradient
        colors={[...GRADIENTS.primary.colors]}
        start={GRADIENTS.primary.start}
        end={GRADIENTS.primary.end}
        style={styles.button}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
