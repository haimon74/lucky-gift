'use client';

/**
 * Generates a cheerful chime using Web Audio API.
 * No external audio files needed.
 */
export function useRevealSound() {
  function play() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      // C5 → E5 → G5 → C6 (MIDI 72, 76, 79, 84)
      const freqs = [523.25, 659.25, 783.99, 1046.5];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.1;
        const endTime = startTime + 0.18;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.start(startTime);
        osc.stop(endTime + 0.01);
      });
    } catch {
      // Web Audio API not available — fail silently
    }
  }

  return { play };
}
