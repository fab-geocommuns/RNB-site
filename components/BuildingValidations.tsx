'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@codegouvfr/react-dsfr/Button';

import { Actions, AppDispatch } from '@/stores/store';
import {
  SelectedBuilding,
  PublicUser,
  bdgApiUrl,
} from '@/stores/map/map-slice';
import { useRNBFetch } from '@/utils/useRNBFetch';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
import { hasUserValidated } from '@/utils/validations';
import {
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';

import styles from '@/styles/buildingValidations.module.scss';

interface BuildingValidationsProps {
  building: SelectedBuilding;
  allowEdit: boolean;
}

export default function BuildingValidations({
  building,
  allowEdit,
}: BuildingValidationsProps) {
  const dispatch: AppDispatch = useDispatch();
  const { fetch } = useRNBFetch();
  const { user } = useRNBAuthentication();
  const [isLoading, setIsLoading] = useState(false);

  const validatedBy = building.validated_by;
  const userHasValidated = hasUserValidated(validatedBy, user?.username);

  // En consultation, rien à afficher s'il n'y a aucune validation.
  if (!allowEdit && validatedBy.length === 0) return null;

  const setValidation = async (isValid: boolean) => {
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

  const actionButton = allowEdit && user && (
    <div className={styles.actionShell}>
      <a href="#" onClick={() => setValidation(!userHasValidated)}>
        {userHasValidated ? 'Retirer ma validation' : 'Valider ce bâtiment'}
      </a>
    </div>
  );

  // Cas édition sans aucune validation : bloc neutre + bouton "Valider".
  if (validatedBy.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.validationEmpty}>
          <div>
            <h2 className={styles.sectionTitle}>Bâtiment non validé</h2>
            <div className={styles.sectionBody}>
              <span>Aucune validation pour le moment.</span>
              {actionButton}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cas avec validations : bloc vert (style existant) + liste + bouton éventuel.
  return (
    <div className={styles.validated}>
      <div className={styles.iconShell}>
        <i className="fr-icon-chat-check-fill" aria-hidden="true"></i>
      </div>
      <div>
        <p className={styles.title}>
          Bâtiment validé par
          {validatedBy.map((u: PublicUser) => (
            <span key={u.id} className={styles.user}>
              {' '}
              <span className={styles.username}>{u.display_name}</span>{' '}
              {u.organization_name && (
                <span className={styles.organization}>
                  ({u.organization_name})
                  {/* add a comma between users except for the last one */}
                  {u.id !== validatedBy[validatedBy.length - 1].id && ','}
                </span>
              )}
            </span>
          ))}
        </p>
        <div>{actionButton}</div>
      </div>
    </div>
  );
}
