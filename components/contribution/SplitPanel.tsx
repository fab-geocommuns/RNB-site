import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { selectSplitChildrenForAPI } from '@/stores/edition/edition-selector';
import { SplitChild } from '@/stores/edition/edition-slice';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import styles from '@/styles/contribution/editPanel.module.scss';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import Button from '@codegouvfr/react-dsfr/Button';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BuildingAddresses from './BuildingAddresses';
import BuildingStatus from './BuildingStatus';
import RNBIDHeader from './RNBIDHeader';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import { BuildingAddressType } from './types';

const INITIAL_STEP = 0;

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export default function SplitPanel() {
  const dispatch: AppDispatch = useDispatch();
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const splitChildrenCount = useSelector(
    (state: RootState) => state.edition.split.children.length,
  );
  const children: SplitChild[] = useSelector(
    (state: RootState) => state.edition.split.children,
  );
  const stepsN: number = splitChildrenCount + 1;
  const selectedChildIndex = useSelector(
    (state: RootState) => state.edition.split.selectedChildIndex,
  );

  return (
    <>
      {selectedChildIndex === null && (
        <SplitBuildingInitialStep
          splitCandidateId={splitCandidateId}
          selectedChildIndex={selectedChildIndex}
          splitChildrenCount={splitChildrenCount}
        ></SplitBuildingInitialStep>
      )}

      {splitCandidateId &&
        selectedChildIndex !== null &&
        selectedChildIndex >= 0 && (
          <SplitBuildingChildInfosStep
            splitCandidateId={splitCandidateId}
            selectedChildIndex={selectedChildIndex}
            splitChildrenCount={splitChildrenCount}
            childrenB={children}
          ></SplitBuildingChildInfosStep>
        )}
    </>
  );
}

function SplitBuildingInitialStep({
  splitCandidateId,
  splitChildrenCount,
  selectedChildIndex,
}: {
  splitCandidateId: string | null;
  splitChildrenCount: number;
  selectedChildIndex: number | null;
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
                  value: splitChildrenCount?.toString(),
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
            nextStep(selectedChildIndex, splitChildrenCount, dispatch)
          }
          disabled={splitCandidateId === null}
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
  selectedChildIndex,
  splitChildrenCount,
  childrenB,
  splitCandidateId,
}: {
  selectedChildIndex: number;
  splitChildrenCount: number;
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
    dispatch(Actions.edition.setSplitChildAddresses(addresses));
  };

  const splitChildrenForAPI = useSelector(selectSplitChildrenForAPI);
  const currentChildHasNoShape = childrenB[selectedChildIndex].shapeId === null;
  const { fetch } = useRNBFetch();
  const [commentValue, setCommentValue] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(event.target.value);
  };
  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${splitCandidateId}/split/`;
    let data: { [key: string]: any } = {
      created_buildings: splitChildrenForAPI,
    };
    if (commentValue.length) data = { ...data, comment: commentValue };
    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
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
          Étape {selectedChildIndex + 2}/{splitChildrenCount + 1} - Infos
          bâtiment {selectedChildIndex + 1}
        </h1>
      </RNBIDHeader>

      <PanelBody>
        <BuildingStatus
          status={childrenB[selectedChildIndex].status}
          onChange={(status) => setStatus(status)}
        ></BuildingStatus>
        <BuildingAddresses
          buildingPoint={location!}
          addresses={childrenB[selectedChildIndex].addresses}
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
        <div className={`${styles.panelSection}`}>
          <div className={`fr-text--xs ${styles.sectionTitle}`}>
            <label htmlFor="comment">Commentaire (optionnel)</label>
          </div>
          <textarea
            value={commentValue}
            onChange={handleChange}
            id="comment"
            name="text"
            className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
            placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ou de la scission ? Laissez un commentaire ici."
          />
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
          onClick={() => previousStep(selectedChildIndex, dispatch)}
          priority="secondary"
        >
          Précédent
        </Button>

        {selectedChildIndex < splitChildrenCount - 1 && (
          <Button
            onClick={() =>
              nextStep(selectedChildIndex, splitChildrenCount, dispatch)
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
        {selectedChildIndex === splitChildrenCount - 1 && (
          <Button
            onClick={handleSubmit}
            disabled={currentChildHasNoShape}
            title={
              currentChildHasNoShape
                ? 'Veuillez tracer une géométrie pour ce bâtiment'
                : `Scinder le bâtiment en ${splitChildrenCount}`
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
  selectedChildIndex: number | null,
  splitChildrenCount: number,
  dispatch: AppDispatch,
) => {
  const i = selectedChildIndex === null ? -1 : selectedChildIndex;
  if (i < splitChildrenCount) {
    dispatch(Actions.edition.setCurrentChildSelected(i + 1));
  }
};

const previousStep = (selectedChildIndex: number, dispatch: AppDispatch) => {
  const i = selectedChildIndex || 0;
  if (i === 0) {
    dispatch(Actions.edition.setCurrentChildSelected(null));
  } else if (i > 0) {
    dispatch(Actions.edition.setCurrentChildSelected(i - 1));
  }
};
