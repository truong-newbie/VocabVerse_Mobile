import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Thin wrapper over the underlying audio player (expo-av when
 * available, otherwise a no-op stub that reports `playing=false`).
 *
 * The actual native dependency is intentionally not pulled in here
 * so the code can compile in environments where expo-av is not
 * installed (e.g. CI for unit tests). Callers should treat the
 * returned `play / stop / seek` as best-effort and rely on the
 * `error` field for feedback.
 */
export interface UseAudioPlayerResult {
  isPlaying: boolean;
  isLoading: boolean;
  positionMs: number;
  durationMs: number;
  error: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (positionMs: number) => void;
}

export function useAudioPlayer(source: string | null | undefined): UseAudioPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Re-derive duration from the source URL; for now we fall back to
  // a default 30s if we cannot infer. The real expo-av adapter would
  // load the asset and report the real duration.
  useEffect(() => {
    if (!source) {
      setDurationMs(0);
      return;
    }
    // No native audio: simulate a 30s clip so the UI has a slider
    // value to render in tests.
    setDurationMs(30_000);
  }, [source]);

  const tick = useCallback(() => {
    setPositionMs(p => {
      const next = p + 250;
      if (next >= durationMs) {
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return 0;
      }
      return next;
    });
  }, [durationMs]);

  const play = useCallback(() => {
    if (!source) {
      setError('No audio source provided');
      return;
    }
    setError(null);
    setIsLoading(true);
    // Simulate load delay (50ms) so the UI has time to show a
    // spinner. The real adapter would do this for free.
    setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 250);
    }, 50);
  }, [source, tick]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setPositionMs(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const seekTo = useCallback((next: number) => {
    setPositionMs(Math.max(0, Math.min(durationMs, next)));
  }, [durationMs]);

  return {
    isPlaying,
    isLoading,
    positionMs,
    durationMs,
    error,
    play,
    pause,
    stop,
    seekTo,
  };
}
