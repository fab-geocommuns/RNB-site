'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Actions, AppDispatch } from '@/stores/store';
import { SelectedBuilding, bdgApiUrl } from '@/stores/map/map-slice';
import { useRNBFetch } from '@/utils/useRNBFetch';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
import { hasUserValidated } from '@/utils/validations';
import {
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';

interface ValidationTogglerProps {
  building: SelectedBuilding;
}

/**
 * Lien (sans style) pour ajouter ou retirer la validation de l'utilisateur
 * courant sur un bâtiment. Détermine lui-même le libellé et l'action selon que
 * le bâtiment a déjà des validations et que l'utilisateur en fait partie.
 * Encapsule l'appel serveur (PATCH is_valid), le toaster et le rafraîchissement
 * du bâtiment dans le store.
 */
export default function ValidationToggler({
  building,
}: ValidationTogglerProps) {
  const dispatch: AppDispatch = useDispatch();
  const { fetch } = useRNBFetch();
  const { user } = useRNBAuthentication();
  const [isLoading, setIsLoading] = useState(false);

  const validatedBy = building.validated_by;
  const userHasValidated = hasUserValidated(validatedBy, user?.username);
  // true = ajouter sa validation, false = la retirer.
  const isValid = !userHasValidated;

  const label =
    validatedBy.length === 0
      ? 'Valider ce bâtiment'
      : userHasValidated
        ? 'Retirer ma validation'
        : 'Ajouter ma validation';

  const setValidation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(bdgApiUrl(`${building.rnb_id}/`), {
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
        await dispatch(Actions.map.selectBuilding(building.rnb_id));
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
