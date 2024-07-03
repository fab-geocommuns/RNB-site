import { createContext } from 'react';
import AdsEditing from '@/logic/ads';

export const AdsContext = createContext({
  ads: null,
  setAds: (ads: AdsEditing) => {},
});
