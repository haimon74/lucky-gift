import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Radius, FontSizes } from '../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined, style]}
        placeholderTextColor={Colors.textMuted}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  input: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSizes.base,
  },
  inputError: { borderColor: Colors.errorRed },
  errorText: { fontSize: FontSizes.xs, color: Colors.errorRed },
});
