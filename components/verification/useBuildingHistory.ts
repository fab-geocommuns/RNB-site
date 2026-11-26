'use client';

import { useEffect, useState } from 'react';
import type { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { rnbApi } from '@/utils/rnbApi';

// Plusieurs blocs de la page lisent l'historique du même bâtiment : une seule
// requête par bâtiment (les dernières seulement sont gardées).
const cache = new Map<string, Promise<ApiHistoryItem[]>>();
const CACHE_SIZE = 20;

function loadHistory(rnbId: string): Promise<ApiHistoryItem[]> {
  const cached = cache.get(rnbId);
  if (cached) return cached;
  const request = rnbApi.get<ApiHistoryItem[]>(
    `buildings/${encodeURIComponent(rnbId)}/history/`,
  );
  request.catch(() => cache.delete(rnbId));
  cache.set(rnbId, request);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!);
  return request;
}

export function useBuildingHistory(rnbId: string) {
  const [items, setItems] = useState<ApiHistoryItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(false);
    loadHistory(rnbId)
      .then((result) => active && setItems(result))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [rnbId]);

  return { items, error };
}
