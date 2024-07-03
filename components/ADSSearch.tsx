'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ADSSearch() {
  const timeout = useRef(0);

  const search = useSearchParams();
  const [query, setQuery] = useState(search.get('q') || '');
  const router = useRouter();

  const handleChange = (e: any) => {
    setQuery(e.target.value);

    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      const encodedQuery = encodeURI(e.target.value);
      router.push(`/ads?q=${encodedQuery}`);
    }, 300);
  };

  return (
    <>
      <input
        onChange={handleChange}
        type="text"
        value={query}
        className="fr-input"
        placeholder="Chercher une ADS"
      />
    </>
  );
}
