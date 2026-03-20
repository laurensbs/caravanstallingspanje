import { useEffect, useRef, useCallback } from 'react';

/**
 * Sets up an interval that only runs when the page is visible.
 * Automatically pauses when the tab is hidden and resumes + refetches when it becomes visible again.
 */
export function useVisibleInterval(callback: () => void, delayMs: number) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => savedCallback.current(), delayMs);
  }, [delayMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch + start
    savedCallback.current();
    start();

    const onVisChange = () => {
      if (document.hidden) {
        stop();
      } else {
        savedCallback.current(); // refetch immediately on tab focus
        start();
      }
    };

    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [start, stop]);
}
