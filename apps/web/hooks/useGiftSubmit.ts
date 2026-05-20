'use client';

import { useState, useCallback } from 'react';
import type { WizardState } from '@lucky-gift/shared';

interface UseGiftSubmitOptions {
  onSuccess: () => void;
}

export function useGiftSubmit({ onSuccess }: UseGiftSubmitOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  return { submit, isLoading, error, isSuccess };
}
