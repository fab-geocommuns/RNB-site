'use client';

import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';

/**
 * Bouton on/off de l'aimantation des outils de dessin sur les bâtiments
 * voisins. Partagé par le formulaire d'édition (rubrique géométrie) et l'écran
 * de scission : tous deux pilotent la même préférence dans le store.
 */
export default function SnapToggle({ className }: { className?: string }) {
  const dispatch: AppDispatch = useDispatch();
  const snapEnabled = useSelector(
    (state: RootState) => state.edition.snap.enabled,
  );

  return (
    <div className={className}>
      <ToggleSwitch
        label={
          <span className="fr-text--sm">Aimanter les arêtes et les coins</span>
        }
        checked={snapEnabled}
        onChange={(checked) =>
          dispatch(Actions.edition.setSnapEnabled(checked))
        }
        showCheckedHint={false}
      />
    </div>
  );
}
