import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  SRC_ADS,
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState } from '@/stores/store';
import { SelectedItem } from '@/stores/map/map-slice';
import { Operation } from '@/stores/edition/edition-slice';
import maplibregl from 'maplibre-gl';

const BUILDING_SOURCES = [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
// Toutes les sources susceptibles de porter un feature-state highlighted.
const ALL_HIGHLIGHTABLE_SOURCES = [...BUILDING_SOURCES, SRC_ADS];

// Une cible de highlight : un id de feature et les sources où le poser.
type HighlightTarget = { sources: string[]; id: string };

/**
 * Calcule, à partir de l'état d'édition, l'ensemble complet des features à
 * mettre en `highlighted: true`. C'est l'unique source de vérité du highlight :
 * selon `operation`, on surligne la sélection, les candidats au merge ou le
 * candidat au split.
 */
const computeHighlightTargets = (params: {
  operation: Operation;
  selectedItem: SelectedItem | null | undefined;
  mergeCandidates: string[];
  splitCandidateId: string | null;
}): HighlightTarget[] => {
  const { operation, selectedItem, mergeCandidates, splitCandidateId } = params;

  // En merge, seuls les candidats sont surlignés.
  if (operation === 'merge') {
    return mergeCandidates.map((id) => ({ sources: BUILDING_SOURCES, id }));
  }

  // En split, seul le candidat est surligné, et uniquement dans la source des
  // shapes (les points ne représentent pas le bâtiment coupé).
  if (operation === 'split') {
    return splitCandidateId
      ? [{ sources: [SRC_BDGS_SHAPES], id: splitCandidateId }]
      : [];
  }

  // null | 'create' | 'update' : on surligne l'item sélectionné.
  if (selectedItem?._type === 'building') {
    return [{ sources: BUILDING_SOURCES, id: selectedItem.rnb_id }];
  }
  if (selectedItem?._type === 'ads') {
    return [{ sources: [SRC_ADS], id: selectedItem.file_number }];
  }

  return [];
};

/**
 * Gestion centralisée du highlight (`feature-state.highlighted`) des bâtiments sur
 * la carte d'édition. Point unique pour les highlights de sélection, update,
 * merge et split.
 * @param map
 */
export const useMapEditHighlight = (map?: maplibregl.Map) => {
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const mergeCandidates = useSelector((state: RootState) =>
    state.edition.merge.candidates.map((candidate) => candidate.rnbId),
  );
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );

  const targets = computeHighlightTargets({
    operation,
    selectedItem,
    mergeCandidates,
    splitCandidateId,
  });

  // Clé sérialisée : l'effet ne se redéclenche que si l'ensemble des highlights
  // change réellement (mergeCandidates produit un nouveau tableau à chaque rendu).
  const targetsKey = JSON.stringify(targets);

  useEffect(() => {
    if (!map) return;

    const applyHighlight = () => {
      // 1. reset : on efface l'état de tous les features de toutes les sources.
      // Cela efface aussi `hovered`, mais il se reposera au prochain mousemove.
      for (const source of ALL_HIGHLIGHTABLE_SOURCES) {
        if (map.getSource(source)) {
          map.removeFeatureState({ source, sourceLayer: 'default' });
        }
      }

      // 2. highlight : on pose highlighted:true sur chaque cible.
      for (const target of targets) {
        for (const source of target.sources) {
          if (map.getSource(source)) {
            map.setFeatureState(
              { source, id: target.id, sourceLayer: 'default' },
              { highlighted: true },
            );
          }
        }
      }
    };

    applyHighlight();

    // Les sources peuvent ne pas être chargées (ex : arrivée avec ?q=rnbId).
    // On ré-applique au premier chargement puis on se retire : le feature-state
    // est stocké par id (pas par tuile), donc une seule pose suffit.
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
    // targets est dérivé de targetsKey ; on dépend de la clé sérialisée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, targetsKey]);
};
