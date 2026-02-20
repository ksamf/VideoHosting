import { useState, useEffect, useCallback } from "react";

export default function useFetch<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (isActive) {
          setData(result);
        }
      } catch (err: unknown) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [fetchFn]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, loading, error, refetch };
}
