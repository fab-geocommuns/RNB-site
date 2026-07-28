import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { saveMapLayersPreference } from './mapLayersDefaults';

export function useSyncMapLayersCookie() {
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  useEffect(() => {
    saveMapLayersPreference(mapLayers);
  }, [mapLayers]);

  return mapLayers;
}
