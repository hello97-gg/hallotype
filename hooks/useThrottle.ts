import { useRef, useEffect, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const isThrottledRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;
    if (isThrottledRef.current) {
      return;
    }

    isThrottledRef.current = true;
    callbackRef.current(...args);

    timeoutRef.current = window.setTimeout(() => {
      isThrottledRef.current = false;
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
