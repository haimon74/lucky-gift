import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGiftSubmit } from '@/hooks/useGiftSubmit';
import type { WizardState } from '@lucky-gift/shared';

const WIZARD_STATE: WizardState = {
  step: 3,
  gameId: 'PWR',
  occasionKey: 'birthday',
  message: 'Happy Birthday!',
  senderName: 'Alice',
  senderEmail: 'alice@example.com',
  recipients: [{ id: 'r1', name: 'Bob', email: 'bob@example.com', phone: '' }],
};

describe('useGiftSubmit', () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls POST /api/gifts with correct payload', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ status: 201, json: async () => ({ id: 'g1' }) });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useGiftSubmit({ onSuccess }));
    await act(() => result.current.submit(WIZARD_STATE));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/gifts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.gameId).toBe('PWR');
    expect(body.senderName).toBe('Alice');
    expect(body.recipients[0].email).toBe('bob@example.com');
    // id should be stripped from recipients
    expect(body.recipients[0].id).toBeUndefined();
  });

  it('sets isSuccess true on 201 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ status: 201, json: async () => ({}) }));
    const { result } = renderHook(() => useGiftSubmit({ onSuccess }));
    await act(() => result.current.submit(WIZARD_STATE));
    expect(result.current.isSuccess).toBe(true);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('sets error on non-201 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      status: 400,
      json: async () => ({ error: 'Validation failed' }),
    }));
    const { result } = renderHook(() => useGiftSubmit({ onSuccess }));
    await act(() => result.current.submit(WIZARD_STATE));
    expect(result.current.error).toBe('Validation failed');
    expect(result.current.isSuccess).toBe(false);
  });

  it('sets error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network Error')));
    const { result } = renderHook(() => useGiftSubmit({ onSuccess }));
    await act(() => result.current.submit(WIZARD_STATE));
    expect(result.current.error).toMatch(/network error/i);
  });

  it('isLoading is false after successful fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ status: 201, json: async () => ({}) }));
    const { result } = renderHook(() => useGiftSubmit({ onSuccess }));
    await act(() => result.current.submit(WIZARD_STATE));
    expect(result.current.isLoading).toBe(false);
  });
});
