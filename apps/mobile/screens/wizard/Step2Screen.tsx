import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { getOccasion } from '@lucky-gift/shared';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, FontSizes } from '../../constants/theme';

const MAX_CHARS = 500;

interface Step2ScreenProps {
  occasionKey: string | null;
  message: string;
  onChangeMessage: (v: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2Screen({ occasionKey, message, onChangeMessage, onContinue, onBack }: Step2ScreenProps) {
  const occasion = occasionKey ? getOccasion(occasionKey) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Occasion header */}
      <View style={styles.occasionCard}>
        <Text style={styles.emoji}>{occasion?.emoji ?? '🎁'}</Text>
        <Text style={styles.occasionName}>{occasion?.displayName ?? 'Lucky Gift'}</Text>
      </View>

      {/* Message editor */}
      <Text style={styles.label}>Your personal message</Text>
      <View style={styles.textareaContainer}>
        <TextInput
          style={styles.textarea}
          value={message}
          onChangeText={onChangeMessage}
          placeholder={occasion?.defaultMessage ?? 'Write your message here...'}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={MAX_CHARS}
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length}/{MAX_CHARS}</Text>
      </View>

      <View style={styles.navRow}>
        <Button variant="ghost" onPress={onBack} size="md">← Back</Button>
        <Button onPress={onContinue} size="md">Continue →</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { padding: Spacing.md, gap: Spacing.md },
  occasionCard: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  emoji: { fontSize: 64 },
  occasionName: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.goldLight },
  label: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  textareaContainer: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    padding: Spacing.md,
  },
  textarea: { color: Colors.textPrimary, fontSize: FontSizes.base, minHeight: 120 },
  charCount: { textAlign: 'right', fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md },
});
