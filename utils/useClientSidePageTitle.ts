'use client';
import { useEffect } from 'react';

export default function useClientSidePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Référentiel National des Bâtiments`;
  }, [title]);
}
