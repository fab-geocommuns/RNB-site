import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { BuildingAdresse } from '@/components/panel/adresse/BuildingAdresse';
import styles from '@/styles/panel.module.scss';
import Button from '@codegouvfr/react-dsfr/Button';
import { useBanAddressModalPicker } from '@/components/panel/adresse/useBanAddressModalPicker';
import { ContributionAddress } from '@/stores/contribution/contribution-slice';
import { SelectedBuilding } from '@/stores/map/map-slice';

type EditBuildingAdresseProps = {
  index: number;
};

export function EditBuildingAdresse({ index }: EditBuildingAdresseProps) {
  const dispatch: AppDispatch = useDispatch();
  const contributionAdresses = useSelector(
    (state: RootState) => state.contribution.addresses,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const { modalComponent, open } = useBanAddressModalPicker({
    onAddressSelected: (address?: ContributionAddress) =>
      dispatch(
        Actions.contribution.setAddress({
          address,
          index,
        }),
      ),
    warning: {
      distanceInKilometers: 0.5,
      point: (selectedItem as SelectedBuilding).point.coordinates,
    },
  });

  return (
    <div className={styles.editAdresse}>
      {modalComponent}
      <BuildingAdresse adresse={contributionAdresses![index]} />

      <div className={styles.editAction}>
        <Button
          size="small"
          onClick={() =>
            open(
              `${contributionAdresses![index].street_number! + contributionAdresses![index].street_rep} ${contributionAdresses![index].street}, ${contributionAdresses![index].city_zipcode} ${contributionAdresses![index].city_name}`,
            )
          }
          iconId={'fr-icon-edit-line'}
        >
          <span></span>
        </Button>
      </div>

      <div className={styles.editAction}>
        <Button
          size="small"
          onClick={() => dispatch(Actions.contribution.deleteAddress(index))}
          iconId={'fr-icon-delete-line'}
        >
          <span></span>
        </Button>
      </div>
    </div>
  );
}
