import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSizes } from '../constants/theme';

interface BadgeProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Badge({ label, selected = false, onPress }: BadgeProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.badge, selected ? styles.selected : styles.unselected]}>
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: 'rgba(201,162,39,0.15)',
    borderColor: Colors.goldPrimary,
  },
  unselected: {
    backgroundColor: Colors.backgroundElevated,
    borderColor: '#2a2a3e',
  },
  text: { fontSize: FontSizes.sm, fontWeight: '600' },
  selectedText: { color: Colors.goldPrimary },
  unselectedText: { color: Colors.textSecondary },
});
