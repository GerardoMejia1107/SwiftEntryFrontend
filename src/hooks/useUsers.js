import { useQuery } from './useQuery';
import * as usersApi from '../api/users';

export function useUsers() {
  const { data, loading, error, refetch } = useQuery(usersApi.getUsers);
  return { users: data ?? [], loading, error, refetch };
}
