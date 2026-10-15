import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authService.getMe();
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 15,
  });
};