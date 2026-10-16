/**
 * useAudioPlayer is a thin wrapper around an audio backend. In
 * the unit test we treat it as a deterministic timer:
 *
 * - play() flips isPlaying to true after a 50ms simulated load
 * - the position advances on a 250ms interval
 * - when position reaches duration, the player resets and
 *   isPlaying becomes false
 *
 * This is enough to drive the AudioControls component tests and
 * gives us a stable contract for the timer-based behaviour.
 */
import { act, renderHook } from '@testing-library/react-native';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

describe('useAudioPlayer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('is initially paused at 0', () => {
    const { result } = renderHook(() => useAudioPlayer('https://x/y.mp3'));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.positionMs).toBe(0);
    expect(result.current.durationMs).toBe(30_000);
  });

  it('play() flips isPlaying after the simulated load delay', () => {
    const { result } = renderHook(() => useAudioPlayer('https://x/y.mp3'));
    act(() => result.current.play());
    expect(result.current.isLoading).toBe(true);
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.isPlaying).toBe(true);
  });

  it('pause() stops the timer', () => {
    const { result } = renderHook(() => useAudioPlayer('https://x/y.mp3'));
    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(50));
    act(() => result.current.pause());
    expect(result.current.isPlaying).toBe(false);
  });

  it('play() without a source sets an error', () => {
    const { result } = renderHook(() => useAudioPlayer(null));
    act(() => result.current.play());
    expect(result.current.error).toBe('No audio source provided');
  });

  it('seekTo clamps to the duration', () => {
    const { result } = renderHook(() => useAudioPlayer('https://x/y.mp3'));
    act(() => result.current.seekTo(99_999));
    expect(result.current.positionMs).toBe(30_000);
  });
});
