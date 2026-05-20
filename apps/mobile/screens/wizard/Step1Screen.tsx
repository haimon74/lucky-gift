import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LOTTERY_GAMES, OCCASIONS } from '@lucky-gift/shared';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, FontSizes } from '../../constants/theme';

interface Step1ScreenProps {
  gameId: string | null;
  occasionKey: string | null;
  onSelectGame: (id: string) => void;
  onSelectOccasion: (key: string) => void;
  onContinue: () => void;
}

export function Step1Screen({ gameId, occasionKey, onSelectGame, onSelectOccasion, onContinue }: Step1ScreenProps) {
  const canContinue = !!(gameId && occasionKey);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Game selection */}
      <Text style={styles.sectionLabel}>🎲 Choose a Lottery Game</Text>
      <View style={styles.gameGrid}>
        {LOTTERY_GAMES.map((game) => (
          <TouchableOpacity
            key={game.gameId}
            onPress={() => onSelectGame(game.gameId)}
            accessibilityRole="button"
            accessibilityState={{ selected: gameId === game.gameId }}
            style={[styles.gameCard, gameId === game.gameId ? styles.gameCardSelected : undefined]}
          >
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.gameDetail}>{game.mainCount} + {game.bonusCount} numbers</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Occasion selection */}
      <Text style={styles.sectionLabel}>🎉 What's the Occasion?</Text>
      <View style={styles.occasionRow}>
        {OCCASIONS.map((occ) => (
          <Badge
            key={occ.occasionKey}
            label={`${occ.emoji} ${occ.displayName}`}
            selected={occasionKey === occ.occasionKey}
            onPress={() => onSelectOccasion(occ.occasionKey)}
          />
        ))}
      </View>

      <View style={styles.continueRow}>
        <Button onPress={onContinue} disabled={!canContinue} size="lg">
          Continue →
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { padding: Spacing.md, gap: Spacing.md },
  sectionLabel: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  gameGrid: { gap: Spacing.sm },
  gameCard: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  gameCardSelected: {
    borderColor: Colors.goldPrimary,
    backgroundColor: 'rgba(201,162,39,0.1)',
  },
  gameName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textPrimary },
  gameDetail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  occasionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  continueRow: { alignItems: 'center', paddingVertical: Spacing.lg },
});
