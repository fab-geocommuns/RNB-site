import React from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { BuildingAdresse } from '@/components/panel/adresse/BuildingAdresse';

type BuildingAdressesProps = {
  adresses: SelectedBuilding['addresses'];
};

export function BuildingAdresses({ adresses }: BuildingAdressesProps) {
  return adresses?.length === 0 ? (
    <div>
      <em>Aucune adresse liée</em>
    </div>
  ) : (
    adresses?.map((a, i) => <BuildingAdresse key={i} adresse={a} />)
  );
}
