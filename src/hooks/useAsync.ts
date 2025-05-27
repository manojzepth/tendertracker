import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setState(prev => ({ ...prev, loading: false, error }));
      options.onError?.(error);
      throw error;
    }
  }, [asyncFunction, options]);

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, loading: false, error: null });
    }, []),
  };
}