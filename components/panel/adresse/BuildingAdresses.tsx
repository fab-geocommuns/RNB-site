import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import React from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { EditBuildingAdresses } from '@/components/panel/adresse/EditBuildingAdresses';
import { BuildingAdresse } from '@/components/panel/adresse/BuildingAdresse';

type BuildingAdressesProps = {
  adresses: SelectedBuilding['addresses'];
};

export function BuildingAdresses({ adresses }: BuildingAdressesProps) {
  const editing = useSelector((state: RootState) => state.contribution.editing);

  if (editing) return <EditBuildingAdresses />;

  return adresses?.length === 0 ? (
    <div>
      <em>Aucune adresse liée</em>
    </div>
  ) : (
    adresses?.map((a, i) => <BuildingAdresse key={i} adresse={a} />)
  );
}
