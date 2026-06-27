import { useEffect, useState } from 'react';

/**
 * Returns a value that only updates after `delay` ms of stability.
 * Handy for search inputs so we don't hammer the API on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
