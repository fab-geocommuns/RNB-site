'use client';

import React from 'react';

import { SelectedBuilding, PublicUser } from '@/stores/map/map-slice';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
import { hasUserValidated } from '@/utils/validations';
import ValidationToggler from '@/components/ValidationToggler';

import styles from '@/styles/buildingValidations.module.scss';

interface BuildingValidationsProps {
  building: SelectedBuilding;
  allowEdit: boolean;
}

export default function BuildingValidations({
  building,
  allowEdit,
}: BuildingValidationsProps) {
  const { user } = useRNBAuthentication();

  const validatedBy = building.validated_by;
  const userHasValidated = hasUserValidated(validatedBy, user?.username);

  // En consultation, rien à afficher s'il n'y a aucune validation.
  if (!allowEdit && validatedBy.length === 0) return null;

  const actionButton = allowEdit && user && (
    <div className={styles.actionShell}>
      <ValidationToggler
        rnbId={building.rnb_id}
        label={
          userHasValidated ? 'Retirer ma validation' : 'Valider ce bâtiment'
        }
        isValid={!userHasValidated}
      />
    </div>
  );

  // Cas édition sans aucune validation : bloc neutre + bouton "Valider".
  if (validatedBy.length === 0) {
    return (
      <div className={styles.validationEmpty}>
        <div>
          La géométrie, le statut et les adresses de ce bâtiment vous semblent
          corrects ? {actionButton}
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
