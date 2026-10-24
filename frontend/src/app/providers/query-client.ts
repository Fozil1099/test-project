import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Switching tabs back and forth must not refetch.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) &&
        count < 2,
    },
  },
});
