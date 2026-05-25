import {
  SRC_ADS,
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState } from '@/stores/store';
import { SelectedItem } from '@/stores/map/map-slice';
import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const BUILDING_SOURCES = [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
const ADS_SOURCES = [SRC_ADS];

// Toutes les sources susceptibles de porter un feature-state in_panel.
const ALL_HIGHLIGHTABLE_SOURCES = [...BUILDING_SOURCES, ...ADS_SOURCES];

const getItemSources = (item: SelectedItem): string[] => {
  if (item._type === 'building') return BUILDING_SOURCES;
  if (item._type === 'ads') return ADS_SOURCES;
  return [];
};

const getItemId = (item: SelectedItem): string | undefined => {
  if (item._type === 'building') return item.rnb_id;
  if (item._type === 'ads') return item.file_number;
  return undefined;
};

/**
 * Gestion du highlight d'un item (bâtiment ou ADS) sur la carte de visualisation.
 *
 * Approche déclarative : on n'a qu'un seul item sélectionné à la fois.
 * On remet donc tous les features à `in_panel: false` (removeFeatureState sur
 * chaque source) puis on passe le seul item sélectionné à `in_panel: true`.
 * Pas besoin de tracker l'item précédent.
 *
 * @param map
 */
export const useMapVisuHighlight = (map?: maplibregl.Map) => {
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );

  const selectedSources = selectedItem ? getItemSources(selectedItem) : [];
  const selectedId = selectedItem ? getItemId(selectedItem) : undefined;

  useEffect(() => {
    if (!map) return;

    const applyHighlight = () => {
      // 1. reset : tous les features de toutes les sources repassent à in_panel false
      for (const source of ALL_HIGHLIGHTABLE_SOURCES) {
        if (map.getSource(source)) {
          map.removeFeatureState({ source, sourceLayer: 'default' });
        }
      }

      // 2. highlight : seul l'item sélectionné passe à true
      if (selectedId) {
        for (const source of selectedSources) {
          if (map.getSource(source)) {
            map.setFeatureState(
              { source, id: selectedId, sourceLayer: 'default' },
              { in_panel: true },
            );
          }
        }
      }
    };

    applyHighlight();

    // La source peut ne pas être encore chargée (ex : arrivée sur la page avec
    // ?q=rnbId). On ré-applique au premier chargement puis on se retire : le
    // feature-state est stocké par id (pas par tuile), donc une seule pose suffit.
    const onSourceData = (e: maplibregl.MapSourceDataEvent) => {
      if (e.isSourceLoaded && ALL_HIGHLIGHTABLE_SOURCES.includes(e.sourceId)) {
        applyHighlight();
        map.off('sourcedata', onSourceData);
      }
    };
    map.on('sourcedata', onSourceData);

    return () => {
      map.off('sourcedata', onSourceData);
    };
  }, [map, selectedId]);
};
