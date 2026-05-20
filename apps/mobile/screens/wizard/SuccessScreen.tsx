import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';
import { Colors, Spacing, FontSizes, Radius } from '../../constants/theme';
import type { Recipient } from '@lucky-gift/shared';

interface SuccessScreenProps {
  recipients: Recipient[];
  onReset: () => void;
}

export function SuccessScreen({ recipients, onReset }: SuccessScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Lucky Numbers Sent!</Text>
      <Text style={styles.subtitle}>
        Your gift has been sent to {recipients.length} lucky recipient{recipients.length !== 1 ? 's' : ''}!
      </Text>

      <View style={styles.recipientList}>
        {recipients.map((r) => (
          <View key={r.id} style={styles.recipientRow}>
            <Text style={styles.recipientEmoji}>🍀</Text>
            <Text style={styles.recipientName}>{r.name || r.email}</Text>
          </View>
        ))}
      </View>

      <Button onPress={onReset} size="lg">Send Another Gift</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  emoji: { fontSize: 80 },
  title: { fontSize: FontSizes['3xl'], fontWeight: '700', color: Colors.goldLight, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.lg, color: Colors.textSecondary, textAlign: 'center' },
  recipientList: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  recipientRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  recipientEmoji: { fontSize: 20 },
  recipientName: { fontSize: FontSizes.base, color: Colors.textPrimary },
});
