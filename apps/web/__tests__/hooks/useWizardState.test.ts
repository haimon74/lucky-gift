import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardState } from '@/hooks/useWizardState';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
    },
    writable: true,
  });
});

afterEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.clearAllTimers();
});

describe('useWizardState', () => {
  it('initializes with step 1, null gameId, null occasionKey', () => {
    const { result } = renderHook(() => useWizardState());
    expect(result.current.state.step).toBe(1);
    expect(result.current.state.gameId).toBeNull();
    expect(result.current.state.occasionKey).toBeNull();
  });

  it('setGame updates gameId', () => {
    const { result } = renderHook(() => useWizardState());
    act(() => result.current.setGame('PWR'));
    expect(result.current.state.gameId).toBe('PWR');
  });

  it('setOccasion updates occasionKey', () => {
    const { result } = renderHook(() => useWizardState());
    act(() => result.current.setOccasion('birthday'));
    expect(result.current.state.occasionKey).toBe('birthday');
  });

  it('setOccasion also sets default message when message is empty', () => {
    const { result } = renderHook(() => useWizardState());
    act(() => result.current.setOccasion('birthday'));
    expect(result.current.state.message.length).toBeGreaterThan(0);
  });

  it('resetWizard clears state back to initial', () => {
    const { result } = renderHook(() => useWizardState());
    act(() => result.current.setGame('PWR'));
    act(() => result.current.setOccasion('holiday'));
    act(() => result.current.resetWizard());
    expect(result.current.state.gameId).toBeNull();
    expect(result.current.state.occasionKey).toBeNull();
    expect(result.current.state.step).toBe(1);
  });

  it('addRecipient adds a new recipient', () => {
    const { result } = renderHook(() => useWizardState());
    const initialCount = result.current.state.recipients.length;
    act(() => result.current.addRecipient());
    expect(result.current.state.recipients).toHaveLength(initialCount + 1);
  });

  it('removeRecipient removes a recipient by id', () => {
    const { result } = renderHook(() => useWizardState());
    act(() => result.current.addRecipient());
    const idToRemove = result.current.state.recipients[1]!.id;
    act(() => result.current.removeRecipient(idToRemove));
    expect(result.current.state.recipients.find((r) => r.id === idToRemove)).toBeUndefined();
  });

  it('updateRecipient updates a specific recipient', () => {
    const { result } = renderHook(() => useWizardState());
    const id = result.current.state.recipients[0]!.id;
    act(() => result.current.updateRecipient(id, { name: 'Alice' }));
    expect(result.current.state.recipients[0]!.name).toBe('Alice');
  });
});
