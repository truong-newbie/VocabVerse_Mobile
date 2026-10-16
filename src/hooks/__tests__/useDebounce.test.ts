import { act, create } from 'react-test-renderer';
import { useDebounce } from '@/hooks/useDebounce';

jest.useFakeTimers();

function runHook<T>(fn: () => T): { current: T; update: (next: () => void) => void; unmount: () => void } {
  let captured: T;
  function Probe(props: { tick: number }) {
    captured = fn();
    return null;
  }
  let tree: ReturnType<typeof create> | null = null;
  act(() => {
    tree = create(<Probe tick={0} />);
  });
  return {
    get current() {
      return captured;
    },
    update(next: () => void) {
      act(() => {
        next();
      });
    },
    unmount() {
      act(() => tree?.unmount());
    },
  };
}

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const hook = runHook(() => useDebounce('initial', 200));
    expect(hook.current).toBe('initial');
    hook.unmount();
  });

  it('updates value after the delay elapses', () => {
    let value = 'a';
    const hook = runHook(() => useDebounce(value, 200));
    expect(hook.current).toBe('a');
    value = 'b';
    hook.update(() => {});
    expect(hook.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(hook.current).toBe('b');
    hook.unmount();
  });
});
