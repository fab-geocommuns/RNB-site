import React, { useState } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { EditBuildingAdresse } from '@/components/panel/adresse/EditBuildingAdresse';
import { ContributionAddress } from '@/stores/contribution/contribution-slice';
import { useBanAddressModalPicker } from '@/components/panel/adresse/useBanAddressModalPicker';

export function EditBuildingAdresses() {
  const dispatch: AppDispatch = useDispatch();
  const contributionAdresses = useSelector(
    (state: RootState) => state.contribution.addresses,
  );
  const { modalComponent, open } = useBanAddressModalPicker(
    (address?: ContributionAddress) =>
      dispatch(Actions.contribution.newAddress(address)),
  );

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
