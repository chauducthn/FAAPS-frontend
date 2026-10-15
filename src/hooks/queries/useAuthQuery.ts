import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 1000 * 60 * 15,
  });
};
