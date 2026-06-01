'use client';

import { useState, useCallback } from 'react';
import type { WizardState } from '@lucky-gift/shared';

interface UseGiftSubmitOptions {
  onSuccess: () => void;
}

interface SubmitResult {
  giftId: string;
  recipientCount: number;
  emailsSent: number;
}

export function useGiftSubmit({ onSuccess }: UseGiftSubmitOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const submit = useCallback(
    async (state: WizardState) => {
      setIsLoading(true);
      setError(null);

      const payload = {
        gameId: state.gameId,
        occasionKey: state.occasionKey,
        message: state.message,
        senderName: state.senderName,
        senderEmail: state.senderEmail,
        recipients: state.recipients.map(({ id: _id, ...r }) => r),
      };

      try {
        const res = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.status === 201) {
          const data = await res.json().catch(() => ({})) as Partial<SubmitResult>;
          setResult({
            giftId: data.giftId ?? '',
            recipientCount: data.recipientCount ?? 0,
            emailsSent: data.emailsSent ?? 0,
          });
          setIsSuccess(true);
          onSuccess();
        } else {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
        }
      } catch {
        setError('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  return { submit, isLoading, error, isSuccess, result };
}
