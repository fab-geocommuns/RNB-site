'use client';

import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { useRNBFetch } from '@/utils/use-rnb-fetch';

const modal = createModal({
  id: 'disable-building-modal',
  isOpenedByDefault: false,
});

export function DisableBuilding() {
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  )!;
  const { fetch } = useRNBFetch();
  const dispatch: AppDispatch = useDispatch();

  const disableBuilding = async () => {
    const building = selectedItem as SelectedBuilding;
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${building.rnb_id}/`;

    try {
      const res = await fetch(url, {
        body: JSON.stringify({
          comment: 'Désactivation via le site',
          is_active: false,
        }),
        method: 'PATCH',
      });

      if (res.ok) {
        // Reload map buildings
        dispatch(Actions.map.reloadBuildings());

        // Unselect the building
        dispatch(Actions.map.unselectItem());

        // Show alert
        dispatch(
          Actions.app.showAlert({
            alert: {
              id: `disable-building-${building.rnb_id}`,
              severity: 'success',
              description: 'Le bâtiment a bien été désactivé',
              small: true,
            },
          }),
        );
      } else {
        // Show error
        dispatch(
          Actions.app.showAlert({
            alert: {
              id: `disable-building-${building.rnb_id}`,
              severity: 'error',
              description:
                'Une erreur est survenue, veuillez essayer plus tard',
              small: true,
            },
          }),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    selectedItem._type === 'building' && (
      <>
        <button className="action" onClick={() => modal.open()}>
          Désactiver
        </button>

        <modal.Component
          title={`Désactiver le RNB ID ${selectedItem.rnb_id}`}
          concealingBackdrop={false}
          size="large"
          buttons={[
            {
              doClosesModal: true,
              children: 'Annuler',
            },
            {
              onClick: disableBuilding,
              doClosesModal: true,
              children: 'Désactiver',
            },
          ]}
        >
          <p>
            Ce bâtiment ne correspond pas à la{' '}
            <a href="/definition" target="_blank">
              définition du RNB
            </a>
            .
          </p>

          <Alert
            description={`L'action que vous vous apprêtez à effectuer ne supprime pas le RNB ID du référentiel. Il va être désactivé et sa consultation restera possible.`}
            severity="info"
            small
          />
        </modal.Component>
      </>
    )
  );
}
