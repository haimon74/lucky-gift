import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius, FontSizes } from '../../constants/theme';
import type { Recipient } from '@lucky-gift/shared';

const MAX_RECIPIENTS = 5;

interface Step3ScreenProps {
  recipients: Recipient[];
  senderName: string;
  senderEmail: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  paymentsEnabled?: boolean;
  onUpdateRecipient: (id: string, changes: Partial<Omit<Recipient, 'id'>>) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (id: string) => void;
  onChangeSenderName: (v: string) => void;
  onChangeSenderEmail: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Step3Screen({
  recipients, senderName, senderEmail,
  isSubmitting = false, submitError = null, paymentsEnabled = false,
  onUpdateRecipient, onAddRecipient, onRemoveRecipient,
  onChangeSenderName, onChangeSenderEmail, onSubmit, onBack,
}: Step3ScreenProps) {
  const [errors, setErrors] = useState<Record<string, { name?: string; email?: string }>>({});
  const [senderErrors, setSenderErrors] = useState<{ name?: string; email?: string }>({});

  function validate() {
    const newErrors: Record<string, { name?: string; email?: string }> = {};
    const emailSet = new Set<string>();
    for (const r of recipients) {
      const e: { name?: string; email?: string } = {};
      if (!r.name.trim()) e.name = 'Name is required';
      if (!r.email.trim()) e.email = 'Email is required';
      else if (!validateEmail(r.email)) e.email = 'Invalid email';
      else if (emailSet.has(r.email.toLowerCase())) e.email = 'Duplicate email';
      emailSet.add(r.email.toLowerCase());
      if (Object.keys(e).length) newErrors[r.id] = e;
    }
    const se: { name?: string; email?: string } = {};
    if (!senderName.trim()) se.name = 'Your name is required';
    if (!senderEmail.trim()) se.email = 'Your email is required';
    else if (!validateEmail(senderEmail)) se.email = 'Invalid email';
    setErrors(newErrors);
    setSenderErrors(se);
    return Object.keys(newErrors).length === 0 && Object.keys(se).length === 0;
  }

  function handleSubmit() { if (validate()) onSubmit(); }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>🎁 Who Gets Lucky?</Text>

      {recipients.map((r, idx) => (
        <View key={r.id} style={styles.recipientCard}>
          <Text style={styles.recipientLabel}>Recipient {idx + 1}</Text>
          {recipients.length > 1 && (
            <TouchableOpacity onPress={() => onRemoveRecipient(r.id)} style={styles.removeBtn} accessibilityLabel={`Remove recipient ${idx + 1}`}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          )}
          <Input label="Name" value={r.name} onChangeText={(v) => onUpdateRecipient(r.id, { name: v })} error={errors[r.id]?.name} placeholder="Recipient's name" />
          <Input label="Email" value={r.email} onChangeText={(v) => onUpdateRecipient(r.id, { email: v })} error={errors[r.id]?.email} placeholder="recipient@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone (optional)" value={r.phone ?? ''} onChangeText={(v) => onUpdateRecipient(r.id, { phone: v })} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        </View>
      ))}

      {recipients.length < MAX_RECIPIENTS && (
        <Button variant="ghost" onPress={onAddRecipient} size="sm">+ Add Another Recipient</Button>
      )}

      <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>✉️ From</Text>
      <View style={styles.recipientCard}>
        <Input label="Your Name" value={senderName} onChangeText={onChangeSenderName} error={senderErrors.name} placeholder="Your name" />
        <Input label="Your Email" value={senderEmail} onChangeText={onChangeSenderEmail} error={senderErrors.email} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
      </View>

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <View style={styles.navRow}>
        <Button variant="ghost" onPress={onBack}>← Back</Button>
        <Button onPress={handleSubmit} loading={isSubmitting}>
          {paymentsEnabled ? '💳 Pay $10 & Send' : '🍀 Send Free!'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { padding: Spacing.md, gap: Spacing.md },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  recipientCard: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    position: 'relative',
  },
  recipientLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 1 },
  removeBtn: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#2a2a3e',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: Colors.textSecondary, fontSize: 18, fontWeight: '700' },
  errorText: { color: Colors.errorRed, fontSize: FontSizes.sm, textAlign: 'center' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, gap: Spacing.md },
});
