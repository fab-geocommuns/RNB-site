import React from 'react';

import { SelectedBuilding } from '@/stores/map/map-slice';
import BuildingValidations from '@/components/BuildingValidations';
import { ContributionStatusPicker } from '@/components/panel/ContributionStatusPicker';
import { BuildingAdresses } from '@/components/panel/adresse/BuildingAdresses';

import panelStyles from '@/styles/panel.module.scss';

interface BuildingMainAttributesProps {
  building: SelectedBuilding;
  allowEdit: boolean;
}

/**
 * Présentation en lecture seule des attributs principaux d'un bâtiment :
 * bloc de validations, statut et adresses. Utilisé dans le panneau de
 * consultation et dans le panneau d'édition (mode lecture seule, avant
 * déverrouillage du formulaire).
 */
export default function BuildingMainAttributes({
  building,
  allowEdit,
}: BuildingMainAttributesProps) {
  return (
    <>
      <div
        className={`${panelStyles.mainAttributes} ${building.validated_by.length > 0 ? panelStyles.validated : ''}`}
      >
        <BuildingValidations building={building} allowEdit={allowEdit} />
        <div className={panelStyles.section}>
          <h2 className={panelStyles.sectionTitle}>Statut du bâtiment</h2>
          <div className={panelStyles.sectionBody}>
            <ContributionStatusPicker currentStatus={building.status} />
          </div>
        </div>
        <div className={panelStyles.section}>
          <h2 className={panelStyles.sectionTitle}>Adresses</h2>
          <div className={panelStyles.sectionBody}>
            <BuildingAdresses adresses={building.addresses} />
          </div>
        </div>
      </div>
    </>
  );
}
