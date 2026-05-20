import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WizardState, Recipient } from '@lucky-gift/shared';
import { OCCASIONS } from '@lucky-gift/shared';

const STORAGE_KEY = 'lucky_gift_wizard_state';

function getDefaultMessage(occasionKey: string | null): string {
  if (!occasionKey) return '';
  return OCCASIONS.find((o) => o.occasionKey === occasionKey)?.defaultMessage ?? '';
}

function makeRecipient(): Recipient {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, name: '', email: '', phone: '' };
}

const INITIAL_STATE: WizardState = {
  step: 1,
  gameId: null,
  occasionKey: null,
  message: '',
  senderName: '',
  senderEmail: '',
  recipients: [makeRecipient()],
};

export function useWizardState() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setState({ ...INITIAL_STATE, ...JSON.parse(raw) }); } catch { /* ignore */ }
      }
    });
  }, []);

  const save = useCallback((newState: WizardState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
    }, 300);
  }, []);

  const update = useCallback((updater: (prev: WizardState) => WizardState) => {
    setState((prev) => { const next = updater(prev); save(next); return next; });
  }, [save]);

  const setStep = useCallback((step: WizardState['step']) => update((s) => ({ ...s, step })), [update]);
  const setGame = useCallback((gameId: string) => update((s) => ({ ...s, gameId })), [update]);
  const setOccasion = useCallback((occasionKey: string) =>
    update((s) => ({ ...s, occasionKey, message: s.message || getDefaultMessage(occasionKey) })),
  [update]);
  const setMessage = useCallback((message: string) => update((s) => ({ ...s, message })), [update]);
  const setSenderName = useCallback((senderName: string) => update((s) => ({ ...s, senderName })), [update]);
  const setSenderEmail = useCallback((senderEmail: string) => update((s) => ({ ...s, senderEmail })), [update]);

  const addRecipient = useCallback(() =>
    update((s) => ({ ...s, recipients: [...s.recipients, makeRecipient()] })),
  [update]);

  const updateRecipient = useCallback((id: string, changes: Partial<Omit<Recipient, 'id'>>) =>
    update((s) => ({ ...s, recipients: s.recipients.map((r) => (r.id === id ? { ...r, ...changes } : r)) })),
  [update]);

  const removeRecipient = useCallback((id: string) =>
    update((s) => ({ ...s, recipients: s.recipients.filter((r) => r.id !== id) })),
  [update]);

  const resetWizard = useCallback(() => {
    const fresh: WizardState = { ...INITIAL_STATE, recipients: [makeRecipient()] };
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(fresh);
  }, []);

  return {
    state, setStep, setGame, setOccasion, setMessage, setSenderName, setSenderEmail,
    addRecipient, updateRecipient, removeRecipient, resetWizard,
  };
}
