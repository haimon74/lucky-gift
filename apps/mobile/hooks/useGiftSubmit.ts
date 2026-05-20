import { useState, useCallback } from 'react';
import { submitGift } from '../utils/api';
import type { WizardState } from '@lucky-gift/shared';

interface UseGiftSubmitOptions {
  onSuccess: () => void;
}

export function useGiftSubmit({ onSuccess }: UseGiftSubmitOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submit = useCallback(async (state: WizardState) => {
    setIsLoading(true);
    setError(null);
    try {
      await submitGift({
        gameId: state.gameId!,
        occasionKey: state.occasionKey!,
        message: state.message,
        senderName: state.senderName,
        senderEmail: state.senderEmail,
        recipients: state.recipients.map(({ id: _id, ...r }) => r),
      });
      setIsSuccess(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return { submit, isLoading, error, isSuccess };
}
