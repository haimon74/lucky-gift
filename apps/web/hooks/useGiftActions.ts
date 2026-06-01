'use client';

import { useState, useCallback } from 'react';
import type { WizardState } from '@lucky-gift/shared';

interface SavedRecipient {
  name: string;
  email: string;
  revealUrl: string;
}

interface SaveResult {
  giftId: string;
  recipientCount: number;
  emailsSent: number;
  recipients: SavedRecipient[];
}

export interface ShareTarget {
  recipientName: string;
  revealUrl: string;
}

export function useGiftActions() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [sharingEmail, setSharingEmail] = useState<string | null>(null); // which recipient is being saved for share
  const [error, setError] = useState<string | null>(null);
  const [isEmailSuccess, setIsEmailSuccess] = useState(false);
  const [emailsSent, setEmailsSent] = useState<number | undefined>(undefined);

  // Persisted after first save so subsequent actions reuse the same gift record
  const [savedGiftId, setSavedGiftId] = useState<string | null>(null);
  const [revealUrls, setRevealUrls] = useState<Record<string, string>>({}); // email → revealUrl

  // Set by shareRecipient; consumed by SharePopup in the UI
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  /** Save gift to DB (first time only). Returns the save result or null on error. */
  const saveGift = useCallback(async (state: WizardState, sendEmail: boolean): Promise<SaveResult | null> => {
    const payload = {
      gameId: state.gameId,
      occasionKey: state.occasionKey,
      message: state.message,
      senderName: state.senderName,
      senderEmail: state.senderEmail,
      recipients: state.recipients.map(({ id: _id, ...r }) => r),
      sendEmail,
    };

    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 201) {
      const data = await res.json() as SaveResult;
      // Cache for future actions
      setSavedGiftId(data.giftId);
      const urlMap: Record<string, string> = {};
      for (const r of data.recipients) urlMap[r.email] = r.revealUrl;
      setRevealUrls(urlMap);
      return data;
    }

    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? 'Something went wrong. Please try again.');
  }, []);

  /**
   * "Send by email" action.
   * - If gift not yet saved → POST /api/gifts (sendEmail=true)
   * - If already saved → POST /api/gifts/:id/email (sends to all recipients)
   */
  const sendByEmail = useCallback(async (state: WizardState) => {
    setIsEmailLoading(true);
    setError(null);
    try {
      if (!savedGiftId) {
        const result = await saveGift(state, true);
        if (result) {
          setEmailsSent(result.emailsSent);
          setIsEmailSuccess(true);
        }
      } else {
        // Gift already saved — just (re)send emails; include senderEmail to prove ownership
        const res = await fetch(`/api/gifts/${savedGiftId}/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderEmail: state.senderEmail }),
        });
        const data = await res.json() as { emailsSent?: number; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Failed to send emails');
        setEmailsSent(data.emailsSent ?? 0);
        setIsEmailSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setIsEmailLoading(false);
    }
  }, [savedGiftId, saveGift]);

  /**
   * "Share" action for a specific recipient.
   * - If gift not yet saved → POST /api/gifts (sendEmail=false) to get the reveal URLs
   * - Opens SharePopup for that recipient's revealUrl
   */
  const shareRecipient = useCallback(async (state: WizardState, recipient: { name: string; email: string }) => {
    setSharingEmail(recipient.email);
    setError(null);
    try {
      let url = revealUrls[recipient.email];

      if (!url) {
        // First share click — save the gift without sending email
        const result = await saveGift(state, false);
        if (!result) return;
        url = result.recipients.find((r) => r.email === recipient.email)?.revealUrl ?? '';
      }

      if (url) {
        setShareTarget({ recipientName: recipient.name, revealUrl: url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setSharingEmail(null);
    }
  }, [revealUrls, saveGift]);

  const closeShare = useCallback(() => setShareTarget(null), []);

  const reset = useCallback(() => {
    setIsEmailLoading(false);
    setSharingEmail(null);
    setError(null);
    setIsEmailSuccess(false);
    setEmailsSent(undefined);
    setSavedGiftId(null);
    setRevealUrls({});
    setShareTarget(null);
  }, []);

  return {
    sendByEmail,
    shareRecipient,
    closeShare,
    reset,
    isEmailLoading,
    sharingEmail,
    error,
    isEmailSuccess,
    emailsSent,
    savedGiftId,
    shareTarget,
  };
}
