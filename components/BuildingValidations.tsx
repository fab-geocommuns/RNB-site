'use client';

import React from 'react';

import { SelectedBuilding, PublicUser } from '@/stores/map/map-slice';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
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

  // En consultation, rien à afficher s'il n'y a aucune validation.
  if (!allowEdit && validatedBy.length === 0) return null;

  const actionButton = allowEdit && user && (
    <div className={styles.actionShell}>
      <ValidationToggler building={building} />
    </div>
  );

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
              <span className={styles.username}>{u.username}</span>{' '}
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
