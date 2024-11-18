import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { EditBuildingAdresse } from '@/components/panel/adresse/EditBuildingAdresse';
import { ContributionAddress } from '@/stores/contribution/contribution-slice';
import { useBanAddressModalPicker } from '@/components/panel/adresse/useBanAddressModalPicker';
import { SelectedBuilding } from '@/stores/map/map-slice';

export function EditBuildingAdresses() {
  const dispatch: AppDispatch = useDispatch();
  const contributionAdresses = useSelector(
    (state: RootState) => state.contribution.addresses,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const { modalComponent, open } = useBanAddressModalPicker({
    onAddressSelected: (address?: ContributionAddress) =>
      dispatch(Actions.contribution.newAddress(address)),
    warning: {
      distanceInKilometers: 0.5,
      point: (selectedItem as SelectedBuilding).point.coordinates,
    },
  });

  return (
    <>
      {contributionAdresses?.map((_, i) => (
        <EditBuildingAdresse key={i} index={i} />
      ))}
      {modalComponent}
      <Button size="small" onClick={() => open()}>
        Ajouter une adresse
      </Button>
    </>
  );
}
