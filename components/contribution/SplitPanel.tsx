import { Actions, AppDispatch, RootState } from '@/stores/store';
import Button from '@codegouvfr/react-dsfr/Button';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import { useDispatch, useSelector } from 'react-redux';
import BuildingStatus from './BuildingStatus';
import { SplitChild } from '@/stores/edition/edition-slice';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import BuildingAddresses from './BuildingAddresses';
import { BuildingAddressType } from './types';
import newPolygonIcon from '@/public/images/map/edition/new_polygon.svg';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { selectSplitChildrenForAPI } from '@/stores/edition/edition-selector';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import RNBIDHeader from './RNBIDHeader';
import styles from '@/styles/contribution/editPanel.module.scss';

const INITIAL_STEP = 0;

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export default function SplitPanel() {
  const dispatch: AppDispatch = useDispatch();
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const splitChildrenN = useSelector(
    (state: RootState) => state.edition.split.childrenNumber,
  );
  const children: SplitChild[] = useSelector(
    (state: RootState) => state.edition.split.children,
  );
  const stepsN: number = splitChildrenN + 1;
  const currentChildSelected = useSelector(
    (state: RootState) => state.edition.split.currentChildSelected,
  );

  return (
    <>
      {currentChildSelected === null && (
        <SplitBuildingInitialStep
          splitCandidateId={splitCandidateId}
          currentChildSelected={currentChildSelected}
          splitChildrenN={splitChildrenN}
        ></SplitBuildingInitialStep>
      )}

      {splitCandidateId &&
        currentChildSelected !== null &&
        currentChildSelected >= 0 && (
          <SplitBuildingChildInfosStep
            splitCandidateId={splitCandidateId}
            currentChildSelected={currentChildSelected}
            splitChildrenN={splitChildrenN}
            childrenB={children}
          ></SplitBuildingChildInfosStep>
        )}
    </>
  );
}

function SplitBuildingInitialStep({
  splitCandidateId,
  splitChildrenN,
  currentChildSelected,
}: {
  splitCandidateId: string | null;
  splitChildrenN: number;
  currentChildSelected: number | null;
}) {
  const dispatch: AppDispatch = useDispatch();
  const setChildrenNumber = (n: string) => {
    dispatch(Actions.edition.setSplitChildrenNumber(parseInt(n)));
  };

  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Scinder un bâtiment</span>
        <h1 className="fr-text--lg fr-m-0">Étape 1 - Sélection du bâtiment</h1>
      </RNBIDHeader>

      <PanelBody>
        <div className={`${styles.panelSection} ${styles.noPad}`}>
          {splitCandidateId && (
            <>
              <div className="fr-pb-3v">
                En combien de bâtiments souhaitez-vous scinder{' '}
                {splitCandidateId} ?
              </div>
              <Select
                nativeSelectProps={{
                  value: splitChildrenN?.toString(),
                  onChange: (event) => {
                    setChildrenNumber(event.target.value);
                  },
                }}
                label=""
                options={[
                  { value: '2', label: 2 },
                  { value: '3', label: 3 },
                  { value: '4', label: 4 },
                  { value: '5', label: 5 },
                  { value: '6', label: 6 },
                  { value: '7', label: 7 },
                  { value: '8', label: 8 },
                  { value: '9', label: 9 },
                ]}
              />
            </>
          )}

          {splitCandidateId === null && (
            <>Sélectionnez un bâtiment à scinder sur la carte.</>
          )}
        </div>
      </PanelBody>
      <div className={styles.footer}>
        <Button
          onClick={() => cancelSplit(dispatch)}
          priority="tertiary no outline"
        >
          Annuler
        </Button>
        <Button
          onClick={() =>
            nextStep(currentChildSelected, splitChildrenN, dispatch)
          }
          priority="secondary"
        >
          Suivant
        </Button>
      </div>
    </>
  );
}

const cancelSplit = (dispatch: AppDispatch) => {
  dispatch(Actions.edition.setOperation(null));
};

function SplitBuildingChildInfosStep({
  currentChildSelected,
  splitChildrenN,
  childrenB,
  splitCandidateId,
}: {
  currentChildSelected: number;
  splitChildrenN: number;
  childrenB: SplitChild[];
  splitCandidateId: string;
}) {
  const dispatch: AppDispatch = useDispatch();
  const location = useSelector(
    (state: RootState) => state.edition.split.location,
  );

  const setStatus = (status: BuildingStatusType) => {
    dispatch(Actions.edition.setSplitChildStatus(status));
  };
  const setAddresses = (addresses: BuildingAddressType[]) => {
    dispatch(Actions.edition.setSplitAddresses(addresses));
  };

  const splitChildrenForAPI = useSelector(selectSplitChildrenForAPI);
  const currentChildHasNoShape =
    childrenB[currentChildSelected].shapeId === null;
  const { fetch } = useRNBFetch();

  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${splitCandidateId}/split/`;

    try {
      const response = await fetch(url, {
        body: JSON.stringify({ created_buildings: splitChildrenForAPI }),
        method: 'POST',
      });

      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      } else {
        // force the map to reload the building, to immediatly show the modifications made
        dispatch(Actions.map.reloadBuildings());
        dispatch(Actions.edition.setOperation(null));
        toasterSuccess(dispatch, 'Bâtiment scindé avec succès');
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la scission');
      console.error(err);
    }
  };

  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Scinder un bâtiment</span>
        <h1 className="fr-text--lg fr-m-0">
          Étape {currentChildSelected + 2}/{splitChildrenN + 1} - Infos bâtiment{' '}
          {currentChildSelected + 1}
        </h1>
      </RNBIDHeader>

      <PanelBody>
        <BuildingStatus
          status={childrenB[currentChildSelected].status}
          onChange={(status) => setStatus(status)}
        ></BuildingStatus>
        <BuildingAddresses
          buildingPoint={location!}
          addresses={childrenB[currentChildSelected].addresses}
          onChange={(addresses: BuildingAddressType[]) => {
            setAddresses(addresses);
          }}
        />
        <div className={`${styles.panelSection} ${styles.noPad}`}>
          {currentChildHasNoShape && (
            <div style={{ display: 'flex' }}>
              <span className="fr-pr-2v">
                <i className="fr-icon-feedback-line" aria-hidden="true"></i>
              </span>
              Tracez la géométrie du bâtiment sur la carte. Un double-clic
              termine le tracé.
            </div>
          )}
          {!currentChildHasNoShape && (
            <>
              <span className="fr-pr-2v">
                <i className="fr-icon-chat-check-line" aria-hidden="true"></i>
              </span>
              Géométrie tracée
            </>
          )}
        </div>
      </PanelBody>
      <div className={styles.footer}>
        <Button
          onClick={() => cancelSplit(dispatch)}
          priority="tertiary no outline"
        >
          Annuler
        </Button>
        <Button
          onClick={() => previousStep(currentChildSelected, dispatch)}
          priority="secondary"
        >
          précédent
        </Button>

        {currentChildSelected < splitChildrenN - 1 && (
          <Button
            onClick={() =>
              nextStep(currentChildSelected, splitChildrenN, dispatch)
            }
            disabled={currentChildHasNoShape}
            priority="secondary"
            title={
              currentChildHasNoShape
                ? 'Veuillez tracer une géométrie pour ce bâtiment'
                : ''
            }
          >
            Suivant
          </Button>
        )}
        {currentChildSelected === splitChildrenN - 1 && (
          <Button
            onClick={handleSubmit}
            disabled={currentChildHasNoShape}
            title={
              currentChildHasNoShape
                ? 'Veuillez tracer une géométrie pour ce bâtiment'
                : `Scinder le bâtiment en ${splitChildrenN}`
            }
          >
            Scinder
          </Button>
        )}
      </div>
    </>
  );
}

const nextStep = (
  currentChildSelected: number | null,
  splitChildrenN: number,
  dispatch: AppDispatch,
) => {
  const i = currentChildSelected === null ? -1 : currentChildSelected;
  if (i < splitChildrenN) {
    dispatch(Actions.edition.setCurrentChildSelected(i + 1));
  }
};

const previousStep = (currentChildSelected: number, dispatch: AppDispatch) => {
  const i = currentChildSelected || 0;
  if (i === 0) {
    dispatch(Actions.edition.setCurrentChildSelected(null));
  } else if (i > 0) {
    dispatch(Actions.edition.setCurrentChildSelected(i - 1));
  }
};
