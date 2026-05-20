import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSizes } from '../constants/theme';

export interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ children, onPress, variant = 'gold', size = 'md', loading = false, disabled = false, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeStyles = {
    sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, fontSize: FontSizes.sm },
    md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4, fontSize: FontSizes.base },
    lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, fontSize: FontSizes.lg },
  }[size];

  if (variant === 'gold') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.8} style={[{ opacity: isDisabled ? 0.5 : 1 }, style]}>
        <LinearGradient
          colors={[Colors.goldGradientStart, Colors.goldGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical }]}
        >
          {loading ? (
            <ActivityIndicator color="#1a0a00" size="small" />
          ) : (
            <Text style={[styles.goldText, { fontSize: sizeStyles.fontSize }]}>{children}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.danger,
        { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical, opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? Colors.goldPrimary : '#fff'} size="small" />
      ) : (
        <Text style={[styles.text, variant === 'ghost' ? styles.ghostText : styles.dangerText, { fontSize: sizeStyles.fontSize }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ghost: {
    borderWidth: 1,
    borderColor: Colors.borderGold,
    backgroundColor: 'transparent',
  },
  danger: { backgroundColor: '#dc2626' },
  text: { fontWeight: '600' },
  goldText: { color: '#1a0a00', fontWeight: '700' },
  ghostText: { color: Colors.goldPrimary },
  dangerText: { color: '#fff' },
});
