import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

interface CardProps extends ViewProps {
  goldBorder?: boolean;
}

export function Card({ goldBorder = false, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.card, goldBorder ? styles.goldBorder : styles.defaultBorder, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  defaultBorder: { borderColor: Colors.borderSubtle },
  goldBorder: { borderColor: Colors.borderGold },
});
