import React from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import panelStyles from '@/styles/panel.module.scss';

type BuildingAdresseProps = {
  adresse: Partial<SelectedBuilding['addresses'][number]>;
};

export function BuildingAdresse({ adresse }: BuildingAdresseProps) {
  return (
    <div key={adresse.id} className={panelStyles.sectionListItem}>
      {adresse.street_number}
      {adresse.street_rep} {adresse.street}
      <br />
      {adresse.city_zipcode} {adresse.city_name}
      <br />
      <small>
        Clé BAN : {adresse.id}
        {adresse.ban_id && (
          <>
            <br />
            Identifiant BAN : {adresse.ban_id}
          </>
        )}
      </small>
    </div>
  );
}
