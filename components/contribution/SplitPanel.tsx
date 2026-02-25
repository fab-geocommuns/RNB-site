import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import {
  selectSplitChildrenForAPI,
  selectCutPreview,
} from '@/stores/edition/edition-selector';
import { SplitChild } from '@/stores/edition/edition-slice';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import styles from '@/styles/contribution/splitPanel.module.scss';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BuildingAddresses from './BuildingAddresses';
import BuildingStatus from './BuildingStatus';
import BuildingInfo from './BuildingInfo';
import GenericPanel from '@/components/panel/GenericPanel';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import { BuildingAddressType } from './types';

export default function SplitPanel() {
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const children: SplitChild[] = useSelector(
    (state: RootState) => state.edition.split.children,
  );
  const splitChildrenCount = children.length;
  const selectedChildIndex = useSelector(
    (state: RootState) => state.edition.split.selectedChildIndex,
  );
  const cutStep = useSelector(
    (state: RootState) => state.edition.split.cutStep,
  );

  // Step 1: Select building (no candidate yet)
  if (!splitCandidateId) {
    return <SplitBuildingInitialStep />;
  }

  // Step 2: Cut step (drawing cut lines)
  if (cutStep === 'drawing') {
    return <SplitBuildingCutStep splitCandidateId={splitCandidateId} />;
  }

  // Steps 3-N: Child info steps
  if (
    selectedChildIndex !== null &&
    selectedChildIndex >= 0 &&
    selectedChildIndex < splitChildrenCount
  ) {
    return (
      <SplitBuildingChildInfosStep
        splitCandidateId={splitCandidateId}
        selectedChildIndex={selectedChildIndex}
        splitChildrenCount={splitChildrenCount}
        childrenB={children}
      />
    );
  }

  // Final step: Summary
  if (
    selectedChildIndex !== null &&
    selectedChildIndex === splitChildrenCount
  ) {
    return (
      <SplitBuildingSummaryStep
        splitCandidateId={splitCandidateId}
        selectedChildIndex={selectedChildIndex}
        splitChildrenCount={splitChildrenCount}
        childrenB={children}
      />
    );
  }

  return null;
}

// Step 1: Select the building to split
function SplitBuildingInitialStep() {
  const dispatch: AppDispatch = useDispatch();
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const candidateShape = useSelector(
    (state: RootState) => state.edition.split.candidateShape,
  );

  return (
    <GenericPanel
      title="Scinder un bâtiment"
      onClose={() => cancelSplit(dispatch)}
      body={
        <div className={`${styles.panelSection} ${styles.noPad}`}>
          {splitCandidateId === null && (
            <>Sélectionnez un bâtiment à scinder sur la carte.</>
          )}
        </div>
      }
      footer={
        <>
          <Button
            onClick={() => cancelSplit(dispatch)}
            priority="tertiary no outline"
          >
            Annuler
          </Button>
        </>
      }
      header={
        <h1 className={`fr-text--lg fr-m-0 ${styles.stepTitle}`}>
          Étape 1 - Sélection du bâtiment
        </h1>
      }
      testId="edition-panel"
    />
  );
}

// Step 2: Draw cut lines
function SplitBuildingCutStep({
  splitCandidateId,
}: {
  splitCandidateId: string;
}) {
  const dispatch: AppDispatch = useDispatch();
  const cutLines = useSelector(
    (state: RootState) => state.edition.split.cutLines,
  );
  const cutPreview = useSelector(selectCutPreview);
  const candidateShape = useSelector(
    (state: RootState) => state.edition.split.candidateShape,
  );

  const cutLinesCount = cutLines.length;
  const resultingPolygonsCount = cutPreview ? cutPreview.length : 0;
  const hasValidCut = cutPreview !== null && cutPreview.length >= 2;

  const handleValidateCut = () => {
    if (cutPreview) {
      dispatch(Actions.edition.validateCut(cutPreview));
    }
  };

  const handleClearAll = () => {
    dispatch(Actions.edition.clearCutLines());
  };

  const handleRemoveLast = () => {
    dispatch(Actions.edition.removeLastCutLine());
  };

  return (
    <GenericPanel
      title="Scinder un bâtiment"
      onClose={() => cancelSplit(dispatch)}
      body={
        <div className={`${styles.panelSection} ${styles.noPad}`}>
          <div className="fr-pb-3v">
            <strong>Bâtiment :</strong> {splitCandidateId}
          </div>

          {!candidateShape && (
            <div style={{ display: 'flex' }} className="fr-mb-3v">
              <span className="fr-pr-2v">
                <i className="fr-icon-loader-line" aria-hidden="true"></i>
              </span>
              Chargement de la géométrie du bâtiment...
            </div>
          )}

          {candidateShape && (
            <>
              <div style={{ display: 'flex' }} className="fr-mb-3v">
                <span className="fr-pr-2v">
                  <i className="fr-icon-feedback-line" aria-hidden="true"></i>
                </span>
                Tracez un ou plusieurs traits de découpe sur le bâtiment.
                Double-cliquez pour terminer un trait.
              </div>

              <div className="fr-mb-3v">
                {cutLinesCount === 0 && <span>Aucun trait tracé</span>}
                {cutLinesCount > 0 && (
                  <span>
                    {cutLinesCount} trait{cutLinesCount > 1 ? 's' : ''} tracé
                    {cutLinesCount > 1 ? 's' : ''}
                    {hasValidCut && <> → {resultingPolygonsCount} bâtiments</>}
                  </span>
                )}
              </div>

              {cutLinesCount > 0 && !hasValidCut && (
                <div
                  style={{ display: 'flex', color: '#ce0500' }}
                  className="fr-mb-3v"
                >
                  <span className="fr-pr-2v">
                    <i className="fr-icon-warning-line" aria-hidden="true"></i>
                  </span>
                  Le trait ne découpe pas correctement le bâtiment. Assurez-vous
                  que le trait traverse le bâtiment de part en part.
                </div>
              )}

              {cutLinesCount > 0 && (
                <div className="fr-mb-3v">
                  <Button
                    onClick={handleRemoveLast}
                    priority="tertiary no outline"
                    size="small"
                    iconId="fr-icon-delete-line"
                  >
                    Supprimer le dernier trait
                  </Button>
                  {cutLinesCount > 1 && (
                    <Button
                      onClick={handleClearAll}
                      priority="tertiary no outline"
                      size="small"
                      iconId="fr-icon-close-circle-line"
                    >
                      Tout effacer
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      }
      footer={
        <>
          <Button
            onClick={() => cancelSplit(dispatch)}
            priority="tertiary no outline"
          >
            Annuler
          </Button>
          <Button
            onClick={handleValidateCut}
            disabled={!hasValidCut}
            priority="secondary"
            title={
              !hasValidCut
                ? 'Tracez au moins un trait de découpe valide'
                : `Valider la découpe en ${resultingPolygonsCount} bâtiments`
            }
          >
            Valider la découpe
          </Button>
        </>
      }
      header={
        <h1 className={`fr-text--lg fr-m-0 ${styles.stepTitle}`}>
          Étape 2 - Découpe du bâtiment
        </h1>
      }
      testId="edition-panel"
    />
  );
}

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

  return (
    <GenericPanel
      title="Scinder un bâtiment"
      onClose={() => cancelSplit(dispatch)}
      body={
        <>
          <BuildingStatus
            status={childrenB[selectedChildIndex].status}
            onChange={(status) => setStatus(status)}
          />
          <BuildingAddresses
            buildingPoint={location!}
            addresses={childrenB[selectedChildIndex].addresses}
            onChange={(addresses: BuildingAddressType[]) => {
              setAddresses(addresses);
            }}
          />
          <div className={`${styles.panelSection} ${styles.noPad}`}>
            <div style={{ display: 'flex' }}>
              <span className="fr-pr-2v">
                <i className="fr-icon-chat-check-line" aria-hidden="true"></i>
              </span>
              Géométrie définie par la découpe
            </div>
          </div>
        </>
      }
      footer={
        <>
          <Button
            onClick={() => cancelSplit(dispatch)}
            priority="tertiary no outline"
          >
            Annuler
          </Button>
          <Button
            onClick={() => previousChildStep(selectedChildIndex, dispatch)}
            priority="secondary"
          >
            Précédent
          </Button>
          <Button
            onClick={() =>
              nextChildStep(selectedChildIndex, splitChildrenCount, dispatch)
            }
            priority="secondary"
          >
            Suivant
          </Button>
        </>
      }
      header={
        <h1 className={`fr-text--lg fr-m-0 ${styles.stepTitle}`}>
          Étape {selectedChildIndex + 3}/{splitChildrenCount + 3} - Infos
          bâtiment {selectedChildIndex + 1}
        </h1>
      }
      testId="edition-panel"
    />
  );
}

function SplitBuildingSummaryStep({
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
  const splitChildrenForAPI = useSelector(selectSplitChildrenForAPI);
  const { fetch } = useRNBFetch();
  const [commentValue, setCommentValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(event.target.value);
  };

  const handleSubmit = async () => {
    await handleSplitSubmit(
      splitCandidateId,
      splitChildrenForAPI,
      commentValue,
      setCommentValue,
      dispatch,
      fetch,
    );
  };

  const isLoading = useSelector((state: RootState) => state.edition.isLoading);

  return (
    <GenericPanel
      title="Scinder un bâtiment"
      onClose={() => cancelSplit(dispatch)}
      body={
        <>
          <div>
            <div className={styles.panelSection}>
              <div className={`fr-text--xs ${styles.sectionTitle}`}>
                Résumé de la scission
              </div>
              <div>
                <strong>Bâtiment à scinder :</strong> {splitCandidateId}
              </div>
              <div className={styles.text}>
                {splitChildrenCount} Nouveaux bâtiments créés
              </div>
            </div>

            <div className={styles.buildingWrapper}>
              {childrenB.map((child, index) => (
                <div key={index} className={styles.buildingSummary}>
                  <strong
                    className={`fr-text--lg fr-m-0 ${styles.splitChildTitle}`}
                  >
                    Enfant {index + 1} :
                  </strong>
                  <BuildingInfo building={child} />
                </div>
              ))}
            </div>
          </div>
          <div className={`${styles.panelSection}`}>
            <div className={`fr-text--xs ${styles.sectionTitle}`}>
              <label htmlFor="comment-summary">Commentaire (optionnel)</label>
            </div>
            <textarea
              value={commentValue}
              onChange={handleChange}
              id="comment-summary"
              name="text"
              className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
              placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ou de la scission ? Laissez un commentaire ici."
            />
          </div>
        </>
      }
      footer={
        <>
          <Button
            onClick={() => cancelSplit(dispatch)}
            priority="tertiary no outline"
          >
            Annuler
          </Button>
          <Button
            onClick={() => previousChildStep(selectedChildIndex, dispatch)}
            priority="secondary"
          >
            Précédent
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            title={`Scinder le bâtiment en ${splitChildrenCount} bâtiments`}
          >
            Scinder
          </Button>
        </>
      }
      header={
        <h1 className={`fr-text--lg fr-m-0 ${styles.stepTitle}`}>
          Étape {splitChildrenCount + 3}/{splitChildrenCount + 3} -
          Récapitulatif
        </h1>
      }
      testId="edition-panel"
    />
  );
}

const cancelSplit = (dispatch: AppDispatch) => {
  dispatch(Actions.edition.setOperation(null));
};

const ordinal = (n: number): string => {
  if (n === 1) return '1er';
  return `${n}ème`;
};

const handleErrorResponse = async (
  response: Response,
  dispatch: AppDispatch,
) => {
  const errorData = await response.json();
  if (typeof errorData === 'object' && errorData.created_buildings) {
    const firstKey = Object.keys(errorData.created_buildings)[0];
    const errorsOnFirstField = Object.values(
      errorData.created_buildings[firstKey],
    )[0] as string[];
    const errorMessage = `Erreur sur le ${ordinal(parseInt(firstKey) + 1)} enfant : ${errorsOnFirstField.join(', ')}`;
    toasterError(dispatch, errorMessage);
    return;
  }
  await throwErrorMessageForHumans(response);
};

const nextChildStep = (
  selectedChildIndex: number,
  splitChildrenCount: number,
  dispatch: AppDispatch,
) => {
  if (selectedChildIndex < splitChildrenCount) {
    dispatch(Actions.edition.setCurrentChildSelected(selectedChildIndex + 1));
  }
};

const previousChildStep = (
  selectedChildIndex: number,
  dispatch: AppDispatch,
) => {
  if (selectedChildIndex === 0) {
    // Go back to cut step
    dispatch(Actions.edition.setCutStep('drawing'));
    dispatch(Actions.edition.setCurrentChildSelected(null));
  } else {
    dispatch(Actions.edition.setCurrentChildSelected(selectedChildIndex - 1));
  }
};

const handleSplitSubmit = async (
  splitCandidateId: string,
  splitChildrenForAPI: any,
  commentValue: string,
  setCommentValue: (value: string) => void,
  dispatch: AppDispatch,
  fetch: any,
) => {
  dispatch(Actions.edition.setIsLoading(true));
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
      await handleErrorResponse(response, dispatch);
    } else {
      // force the map to reload the building, to immediatly show the modifications made
      dispatch(Actions.map.reloadBuildings());
      dispatch(Actions.edition.setOperation(null));
      toasterSuccess(dispatch, 'Bâtiment scindé avec succès');
      setCommentValue('');
    }
  } catch (err: any) {
    toasterError(dispatch, err.message || 'Erreur lors de la scission');
    console.error(err);
  }
  dispatch(Actions.edition.setIsLoading(false));
};
