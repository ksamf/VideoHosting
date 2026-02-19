import { useState, useEffect, useCallback } from "react";

export default function useFetch(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        if (isActive) {
          setError(err.message || "Ошибка при загрузке данных");
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
    } catch (err) {
      setError(err.message || "Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, loading, error, refetch };
}
