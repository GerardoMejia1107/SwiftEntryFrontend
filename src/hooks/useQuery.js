import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook for GET requests.
 *
 * @param {() => Promise<T>} queryFn  - Function that returns a Promise of the data.
 * @param {unknown[]}        deps     - Re-runs the query whenever any dep changes (like useEffect).
 *
 * Usage:
 *   const { data, loading, error, refetch } = useQuery(() => getEvents(), []);
 *   const { data, loading, error }          = useQuery(() => getEventsByOrganizer(id), [id]);
 */
export function useQuery(queryFn, deps = []) {
  const fnRef = useRef(queryFn);

  // Sync the ref after every render so `run` always calls the latest function.
  // useLayoutEffect runs before useEffect, guaranteeing fnRef is current
  // by the time the fetch effect fires.
  useLayoutEffect(() => {
    fnRef.current = queryFn;
  });

  const [data, setDataInternal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // `run` is stable across renders unless a dep changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fnRef.current()
      .then((result) => {
        if (!cancelled) {
          setDataInternal(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message ?? err.message ?? 'Request failed.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => run(), [run]);

  // Allows feature hooks to do local optimistic updates (e.g. remove item after delete).
  const setData = useCallback(
    (updater) =>
      setDataInternal((prev) => (typeof updater === 'function' ? updater(prev) : updater)),
    []
  );

  return { data, loading, error, refetch: run, setData };
}
