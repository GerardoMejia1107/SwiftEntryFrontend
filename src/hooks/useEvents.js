import { useCallback, useMemo } from 'react';
import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import * as eventsApi from '../api/events';

/**
 * All events — for admin views.
 * Exposes create / update / removeEvent mutations that also update
 * the local list so the UI reflects changes without re-fetching.
 */
export function useEvents() {
  const { data, loading, error, refetch, setData } = useQuery(eventsApi.getEvents);

  const { mutate: createMutate, loading: creating, error: createError, reset: resetCreate } = useMutation(eventsApi.createEvent);
  const { mutate: updateMutate, loading: updating, error: updateError, reset: resetUpdate } = useMutation(eventsApi.updateEvent);
  const { mutate: deleteMutate, loading: deleting, error: deleteError, reset: resetDelete } = useMutation(eventsApi.deleteEvent);

  const createEvent = useCallback(async (payload) => {
    const created = await createMutate(payload);
    setData((prev) => [...(prev ?? []), created]);
    return created;
  }, [createMutate, setData]);

  const updateEvent = useCallback(async (id, payload) => {
    const updated = await updateMutate(id, payload);
    setData((prev) => prev?.map((e) => (e.id === id ? updated : e)) ?? []);
    return updated;
  }, [updateMutate, setData]);

  const removeEvent = useCallback(async (id) => {
    await deleteMutate(id);
    setData((prev) => prev?.filter((e) => e.id !== id) ?? []);
  }, [deleteMutate, setData]);

  return {
    events: data ?? [],
    loading,
    error,
    refetch,
    // mutations
    createEvent,
    updateEvent,
    removeEvent,
    // per-mutation states
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError,
    resetCreate,
    resetUpdate,
    resetDelete,
  };
}

/**
 * Public events for the consumer view — all statuses except DRAFT.
 */
export function useConsumerEvents() {
  const { data, loading, error, refetch } = useQuery(eventsApi.getEvents);

  const events = useMemo(
    () => (data ?? []).filter((e) => e.status !== 'DRAFT'),
    [data]
  );

  return { events, loading, error, refetch };
}

/**
 * Events scoped to a single organizer.
 * Re-fetches automatically when organizerId changes.
 */
export function useOrganizerEvents(organizerId) {
  const { data, loading, error, refetch } = useQuery(
    () =>
      organizerId
        ? eventsApi.getEventsByOrganizer(organizerId)
        : Promise.resolve([]),
    [organizerId]
  );

  return { events: data ?? [], loading, error, refetch };
}
