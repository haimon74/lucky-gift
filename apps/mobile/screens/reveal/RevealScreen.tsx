import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { generateLotteryNumbers, getLotteryGame } from '@lucky-gift/shared';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, FontSizes } from '../../constants/theme';
import { useRevealData } from '../../hooks/useRevealData';

interface RevealScreenProps {
  giftId: string;
  token: string;
}

const BONUS_COLORS: Record<string, string> = {
  PWR: '#e74c3c',
  MML: '#f0c040',
  MFL: '#1abc9c',
};

const BONUS_LABELS: Record<string, string> = {
  PWR: 'Powerball',
  MML: 'Mega Ball',
  MFL: 'Millionaire Ball',
};

function NumberBall({ number, isBonus, gameId }: { number: number; isBonus?: boolean; gameId: string }) {
  const color = isBonus ? (BONUS_COLORS[gameId] ?? '#c9a227') : '#f5f5f0';
  const textColor = isBonus ? '#fff' : '#1a1a2e';
  return (
    <View style={[styles.ball, { backgroundColor: color }]}>
      <Text style={[styles.ballNumber, { color: textColor }]}>{number}</Text>
    </View>
  );
}

export function RevealScreen({ giftId, token }: RevealScreenProps) {
  const { state, reload } = useRevealData(giftId, token);
  const [isRevealed, setIsRevealed] = useState(false);
  const [numbers, setNumbers] = useState<{ main: number[]; bonus: number[] } | null>(null);

  if (state.status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.goldPrimary} size="large" />
        <Text style={styles.loadingText}>Opening your gift...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.emoji}>🔗</Text>
        <Text style={styles.errorText}>{state.message}</Text>
        <Button onPress={reload}>Try Again</Button>
      </View>
    );
  }

  const data = state.data as {
    gift: { id: string; gameId: string; occasionKey: string; message: string; senderName: string };
    recipient: { name: string; seedHash: string };
    game: { gameId: string; name: string; mainCount: number; mainMin: number; mainMax: number; bonusCount: number; bonusMin?: number; bonusMax?: number };
    template: { revealButtonText: string };
  };

  function handleReveal() {
    const game = getLotteryGame(data.game.gameId);
    if (!game) return;
    const nums = generateLotteryNumbers(data.recipient.seedHash, game);
    setNumbers(nums);
    setIsRevealed(true);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Message */}
      <View style={styles.messageCard}>
        <Text style={styles.message}>{data.gift.message}</Text>
        <Text style={styles.from}>from: <Text style={styles.senderName}>{data.gift.senderName}</Text></Text>
      </View>

      {!isRevealed ? (
        <Button onPress={handleReveal} size="lg">🎰 {data.template.revealButtonText}</Button>
      ) : (
        <View style={styles.numbersContainer}>
          <Text style={styles.numbersTitle}>✨ Your Lucky Numbers ✨</Text>
          <View style={styles.ballsRow}>
            {numbers?.main.map((n, i) => (
              <NumberBall key={`main-${i}`} number={n} isBonus={false} gameId={data.game.gameId} />
            ))}
          </View>
          {(numbers?.bonus.length ?? 0) > 0 && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusLabel}>{BONUS_LABELS[data.game.gameId] ?? 'Bonus'}</Text>
              <NumberBall number={numbers!.bonus[0]!} isBonus gameId={data.game.gameId} />
            </View>
          )}

          <TouchableOpacity style={styles.sendBackBtn}>
            <Text style={styles.sendBackText}>
              🍀 Send a lucky gift back to {data.gift.senderName}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { padding: Spacing.md, gap: Spacing.lg, alignItems: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.backgroundPrimary },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.base },
  errorText: { color: Colors.textPrimary, fontSize: FontSizes.lg, textAlign: 'center' },
  emoji: { fontSize: 48 },
  messageCard: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  message: { fontSize: FontSizes.lg, color: '#fff5e0', textAlign: 'center', fontStyle: 'italic', lineHeight: 28 },
  from: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  senderName: { color: Colors.goldLight },
  numbersContainer: { width: '100%', alignItems: 'center', gap: Spacing.md },
  numbersTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.goldLight },
  ballsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm },
  ball: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  ballNumber: { fontSize: FontSizes.lg, fontWeight: '700' },
  bonusContainer: { alignItems: 'center', gap: Spacing.xs },
  bonusLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 1 },
  sendBackBtn: { marginTop: Spacing.md },
  sendBackText: { color: Colors.goldPrimary, fontSize: FontSizes.sm, textDecorationLine: 'underline' },
});
