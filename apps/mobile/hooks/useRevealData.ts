import { useState, useEffect } from 'react';
import { fetchReveal } from '../utils/api';

type RevealState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: unknown };

export function useRevealData(giftId: string, token: string) {
  const [state, setState] = useState<RevealState>({ status: 'loading' });

  async function load() {
    setState({ status: 'loading' });
    try {
      const data = await fetchReveal(giftId, token);
      setState({ status: 'success', data });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load gift' });
    }
  }

  useEffect(() => { load(); }, [giftId, token]);

  return { state, reload: load };
}
