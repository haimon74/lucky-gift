'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WizardState, Recipient } from '@lucky-gift/shared';
import { OCCASIONS } from '@lucky-gift/shared';

const STORAGE_KEY = 'lucky_gift_wizard_state';

function getDefaultMessage(occasionKey: string | null): string {
  if (!occasionKey) return '';
  return OCCASIONS.find((o) => o.occasionKey === occasionKey)?.defaultMessage ?? '';
}

const INITIAL_STATE: WizardState = {
  step: 1,
  gameId: null,
  occasionKey: null,
  message: '',
  senderName: '',
  senderEmail: '',
  recipients: [{ id: crypto.randomUUID(), name: '', email: '', phone: '' }],
};

function loadFromStorage(): WizardState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

export function useWizardState() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  const save = useCallback((newState: WizardState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // ignore quota errors
      }
    }, 300);
  }, []);

  const update = useCallback(
    (updater: (prev: WizardState) => WizardState) => {
      setState((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save],
  );

  const setStep = useCallback((step: WizardState['step']) => update((s) => ({ ...s, step })), [update]);

  const setGame = useCallback(
    (gameId: string) => update((s) => ({ ...s, gameId })),
    [update],
  );

  const setOccasion = useCallback(
    (occasionKey: string) =>
      update((s) => ({
        ...s,
        occasionKey,
        message: s.message || getDefaultMessage(occasionKey),
      })),
    [update],
  );

  const setMessage = useCallback(
    (message: string) => update((s) => ({ ...s, message })),
    [update],
  );

  const setSenderName = useCallback(
    (senderName: string) => update((s) => ({ ...s, senderName })),
    [update],
  );

  const setSenderEmail = useCallback(
    (senderEmail: string) => update((s) => ({ ...s, senderEmail })),
    [update],
  );

  const addRecipient = useCallback(
    () =>
      update((s) => ({
        ...s,
        recipients: [
          ...s.recipients,
          { id: crypto.randomUUID(), name: '', email: '', phone: '' },
        ],
      })),
    [update],
  );

  const updateRecipient = useCallback(
    (id: string, changes: Partial<Omit<Recipient, 'id'>>) =>
      update((s) => ({
        ...s,
        recipients: s.recipients.map((r) => (r.id === id ? { ...r, ...changes } : r)),
      })),
    [update],
  );

  const removeRecipient = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        recipients: s.recipients.filter((r) => r.id !== id),
      })),
    [update],
  );

  const resetWizard = useCallback(() => {
    const fresh: WizardState = {
      ...INITIAL_STATE,
      recipients: [{ id: crypto.randomUUID(), name: '', email: '', phone: '' }],
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(fresh);
  }, []);

  return {
    state,
    setStep,
    setGame,
    setOccasion,
    setMessage,
    setSenderName,
    setSenderEmail,
    addRecipient,
    updateRecipient,
    removeRecipient,
    resetWizard,
  };
}
