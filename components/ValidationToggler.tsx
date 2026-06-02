'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Actions, AppDispatch } from '@/stores/store';
import { bdgApiUrl } from '@/stores/map/map-slice';
import { useRNBFetch } from '@/utils/useRNBFetch';
import {
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';

interface ValidationTogglerProps {
  /** Texte du lien. */
  label: string;
  /** Identifiant RNB du bâtiment concerné. */
  rnbId: string;
  /** Action à mener : true = ajouter sa validation, false = la retirer. */
  isValid: boolean;
}

/**
 * Lien (sans style) qui ajoute ou retire la validation de l'utilisateur courant
 * sur un bâtiment. Encapsule l'appel serveur (PATCH is_valid), le toaster, et le
 * rafraîchissement du bâtiment dans le store.
 */
export default function ValidationToggler({
  label,
  rnbId,
  isValid,
}: ValidationTogglerProps) {
  const dispatch: AppDispatch = useDispatch();
  const { fetch } = useRNBFetch();
  const [isLoading, setIsLoading] = useState(false);

  const setValidation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(bdgApiUrl(`${rnbId}/`), {
        method: 'PATCH',
        body: JSON.stringify({ is_valid: isValid }),
      });
      if (!response.ok) {
        toasterError(
          dispatch,
          'Erreur lors de la mise à jour de la validation',
        );
      } else {
        toasterSuccess(
          dispatch,
          isValid ? 'Validation enregistrée' : 'Validation retirée',
        );
        // Re-consultation du bâtiment pour rafraîchir validated_by (réponse 204).
        await dispatch(Actions.map.selectBuilding(rnbId));
      }
    } catch (err: any) {
      toasterError(
        dispatch,
        err.message || 'Erreur lors de la mise à jour de la validation',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a href="#" onClick={() => setValidation()}>
      {label}
    </a>
  );
}
