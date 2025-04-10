import React from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { EditBuildingAdresses } from '@/components/panel/adresse/EditBuildingAdresses';
import { BuildingAdresse } from '@/components/panel/adresse/BuildingAdresse';
import { RNBGroup, useRNBAuthentication } from '@/utils/use-rnb-authentication';

type BuildingAdressesProps = {
  adresses: SelectedBuilding['addresses'];
};

export function BuildingAdresses({ adresses }: BuildingAdressesProps) {
  const { is } = useRNBAuthentication();

  return adresses?.length === 0 ? (
    <div>
      <em>Aucune adresse liée</em>
    </div>
  ) : (
    adresses?.map((a, i) => <BuildingAdresse key={i} adresse={a} />)
  );
}
