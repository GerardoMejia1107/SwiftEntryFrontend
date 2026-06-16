import { useState, useLayoutEffect, useCallback, useRef } from 'react';

/**
 * Generic mutation hook for POST / PUT / DELETE requests.
 *
 * @param {(...args) => Promise<T>} mutationFn
 *
 * Usage:
 *   const { mutate, loading, error, reset } = useMutation(deleteEvent);
 *   await mutate(eventId);           // throws on failure so callers can react
 *
 *   const { mutate: create } = useMutation(createEvent);
 *   const created = await create(payload);
 */
export function useMutation(mutationFn) {
  const fnRef = useRef(mutationFn);

  // Sync the ref after every render so `mutate` always calls the latest function.
  useLayoutEffect(() => {
    fnRef.current = mutationFn;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stable reference — never recreated.
  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      return await fnRef.current(...args);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Request failed.');
      throw err; // re-throw so callers can handle it with try/catch or .catch()
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
