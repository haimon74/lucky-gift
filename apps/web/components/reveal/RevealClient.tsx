'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@lucky-gift/ui';
import { Button } from '@lucky-gift/ui';
import { RevealCard } from './RevealCard';

interface RevealClientProps {
  giftId: string;
  token: string;
}

type RevealState =
  | { status: 'loading' }
  | { status: 'error'; message: string; canRetry: boolean }
  | { status: 'success'; data: unknown };

export function RevealClient({ giftId, token }: RevealClientProps) {
  const [state, setState] = useState<RevealState>({ status: 'loading' });

  async function load() {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/reveal/${giftId}?t=${encodeURIComponent(token)}`);
      if (res.status === 404 || res.status === 410) {
        setState({ status: 'error', message: 'This gift link is invalid or has expired.', canRetry: false });
        return;
      }
      if (!res.ok) {
        setState({ status: 'error', message: 'Unable to load your gift. Please try again.', canRetry: true });
        return;
      }
      const data = await res.json();
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Unable to load your gift. Please try again.', canRetry: true });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftId, token]);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner />
        <p style={{ color: '#a0a0b0' }}>Opening your gift...</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="text-5xl">{state.canRetry ? '😔' : '🔗'}</div>
        <p className="text-lg" style={{ color: '#f5f5f0' }}>
          {state.message}
        </p>
        {state.canRetry ? (
          <Button onClick={load}>Try Again</Button>
        ) : (
          <a href="/" className="text-sm underline" style={{ color: '#c9a227' }}>
            ← Back to Lucky Gift
          </a>
        )}
      </div>
    );
  }

  return <RevealCard data={state.data as Parameters<typeof RevealCard>[0]['data']} />;
}
