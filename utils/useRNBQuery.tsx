import { useState } from 'react';

import { useEffect } from 'react';
import { useRNBFetch } from './useRNBFetch';

function transformKeys(obj: any) {
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] =
      obj[key];
    return acc;
  }, {});
}

type Params = {
  url: () => string | null;
  method: string;
};

export default function useRNBQuery<T>({ url, method }: Params) {
  const { fetch } = useRNBFetch();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchUrl = url();

  useEffect(() => {
    const fetchData = async () => {
      if (!fetchUrl) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}${fetchUrl}`,
          { method },
        );
        const data = await response.json();
        setData(transformKeys(data));
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetch, fetchUrl, method]);

  return { data, isLoading, error };
}
