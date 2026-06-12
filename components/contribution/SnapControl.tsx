'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import { useHotkeys } from 'react-hotkeys-hook';
import { toasterSuccess } from '@/components/contribution/toaster';
import styles from '@/styles/contribution/snapControl.module.scss';

const LOCAL_STORAGE_KEY = 'rnb-edition-snap-settings';

/**
 * Contrôle de l'aimantation des outils de dessin : activation (toggle ou
 * Shift+S) et réglage de la sensibilité. Les réglages sont conservés dans le
 * localStorage d'une session à l'autre.
 */
export default function SnapControl() {
  const dispatch: AppDispatch = useDispatch();
  const enabled = useSelector((state: RootState) => state.edition.snap.enabled);
  const tolerancePx = useSelector(
    (state: RootState) => state.edition.snap.tolerancePx,
  );

  // restaure les réglages sauvegardés au montage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.enabled === 'boolean') {
        dispatch(Actions.edition.setSnapEnabled(saved.enabled));
      }
      if (typeof saved.tolerancePx === 'number') {
        dispatch(Actions.edition.setSnapTolerancePx(saved.tolerancePx));
      }
    } catch (_error) {}
  }, [dispatch]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ enabled, tolerancePx }),
      );
    } catch (_error) {}
  }, [enabled, tolerancePx]);

  const toggleSnap = (checked: boolean) => {
    dispatch(Actions.edition.setSnapEnabled(checked));
    toasterSuccess(
      dispatch,
      checked ? 'aimantation activée' : 'aimantation désactivée',
    );
  };

  useHotkeys('shift+s', () => toggleSnap(!enabled), [enabled]);

  return (
    <div className={styles.snapControl}>
      <ToggleSwitch
        label={<span className="fr-text--sm">Aimantation</span>}
        helperText="Colle le dessin aux bâtiments voisins (Shift+S)"
        checked={enabled}
        onChange={toggleSnap}
        showCheckedHint={false}
      />
      {enabled && (
        <label className={`fr-text--xs ${styles.sensitivity}`}>
          Sensibilité&nbsp;: {tolerancePx}&nbsp;px
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={tolerancePx}
            onChange={(event) =>
              dispatch(
                Actions.edition.setSnapTolerancePx(Number(event.target.value)),
              )
            }
          />
        </label>
      )}
    </div>
  );
}
