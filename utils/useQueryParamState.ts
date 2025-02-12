'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function useQueryParamState(
  key: string,
  initialValue: string,
): [string, (newValue: string) => void] {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const searchParams = useSearchParams();
  const queryParamValue = searchParams.get(key) || value;
  const setQueryParamValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, newValue);
    router.push(`?${params.toString()}`, { scroll: false });
    setValue(newValue);
  };
  return [queryParamValue, setQueryParamValue];
}
