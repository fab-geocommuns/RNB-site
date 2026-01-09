import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { useState } from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { MergeCandidate } from '@/stores/edition/edition-slice';
import MergeSummary from './MergeSummary';
import BuildingInfo from './BuildingInfo';
import GenericPanel from '@/components/panel/GenericPanel';
import { Loader } from '@/components/Loader';
import styles from '@/styles/contribution/mergePanel.module.scss';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRNBFetch } from '@/utils/useRNBFetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
export default function MergePanel() {
  const dispatch: AppDispatch = useDispatch();
  const candidatesIdToMerge = useSelector((state: RootState) =>
    state.edition.merge.candidates.map(
      (candidate: MergeCandidate) => candidate.rnbId,
    ),
  );
  const newBuilding = useSelector(
    (state: RootState) => state.edition.merge.newBuilding,
  );
  const isActive = candidatesIdToMerge.length > 1;
  const { fetch } = useRNBFetch();
  const isLoading = useSelector((state: RootState) => state.edition.isLoading);
  const [commentValue, setCommentValue] = useState('');
  const candidatesWithAddresses = useSelector((state: RootState) =>
    state.edition.merge.candidates.map(
      (candidate: MergeCandidate) => candidate.data,
    ),
  );

  const cancelMerge = () => {
    dispatch(Actions.edition.setOperation(null));
  };

  const newMerge = () => {
    dispatch(Actions.edition.setNewBuilding(null));
    dispatch(Actions.edition.setOperation('merge'));
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(event.target.value);
  };

  const selectCandidateToRemove = (rnbId: string) => {
    dispatch(Actions.edition.setRemoveCandidate(rnbId));
  };

  const handleSubmit = async () => {
    dispatch(Actions.edition.setIsLoading(true));
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/merge/`;

    let data: { [key: string]: any } = {
      comment: commentValue,
      rnb_ids: candidatesIdToMerge,
      status: 'constructed',
      merge_existing_addresses: true,
    };
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
        const data = await response.json();
        dispatch(Actions.map.selectBuilding(data.rnb_id));
        toasterSuccess(dispatch, `Les bâtiments ont été fusionnés avec succès`);
        dispatch(Actions.edition.setNewBuilding(data));
        setCommentValue('');
      }
      dispatch(Actions.edition.setIsLoading(false));
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la fusion');
      dispatch(Actions.edition.setIsLoading(false));

      console.error(err);
    }
  };
  return (
    <>
      <GenericPanel
        title="Fusionner des bâtiments"
        onClose={cancelMerge}
        body={
          <BodyPanel
            newBuilding={newBuilding}
            candidatesWithAddresses={candidatesWithAddresses}
            isLoading={isLoading}
            isActive={isActive}
            commentValue={commentValue}
            selectCandidateToRemove={selectCandidateToRemove}
            handleChange={handleChange}
          />
        }
        footer={
          <FooterPanel
            newBuilding={newBuilding}
            isLoading={isLoading}
            candidatesWithAddresses={candidatesWithAddresses}
            newMerge={newMerge}
            cancelMerge={cancelMerge}
            handleSubmit={handleSubmit}
          />
        }
        testId="edition-panel"
      ></GenericPanel>
    </>
  );
}
function BodyPanel({
  newBuilding,
  candidatesWithAddresses,
  isLoading,
  isActive,
  commentValue,
  selectCandidateToRemove,
  handleChange,
}: {
  newBuilding: SelectedBuilding | null;
  candidatesWithAddresses: (SelectedBuilding | undefined)[] | null;
  isLoading: boolean;
  isActive: boolean;
  commentValue: string;
  selectCandidateToRemove: (candidate: string) => void;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      {newBuilding?.rnb_id ? (
        <MergeSummary
          newBuilding={newBuilding}
          buildingsMerged={candidatesWithAddresses}
        />
      ) : (
        <div>
          {!isLoading && (
            <div className={styles.mergePanelDescWrapper}>
              <span className={styles.mergePanelDescText}>
                Sélectionner les bâtiments à fusionner
              </span>
              <span className={styles.mergePanelDescSubText}>
                Sélectionnez sur la carte les bâtiments attenants qui doivent
                être fusionnés
              </span>
            </div>
          )}
          {isLoading ? (
            <div className={styles.mergePanelLoader}>
              <Loader />
              <span>Chargement en cours</span>
            </div>
          ) : (
            <div>
              {candidatesWithAddresses?.length ? (
                <div>
                  <div className={styles.buildingWrapper}>
                    {candidatesWithAddresses.map(
                      (candidate) =>
                        candidate && (
                          <div
                            key={candidate.rnb_id}
                            className={styles.buildingSummary}
                          >
                            <BuildingInfo building={candidate}>
                              <button
                                onClick={() =>
                                  selectCandidateToRemove(candidate.rnb_id)
                                }
                                title="Supprime le bâtiment de la liste des bâtiments à fusionner"
                              >
                                <span
                                  className="fr-icon-close-circle-fill"
                                  aria-hidden="true"
                                ></span>
                              </button>
                            </BuildingInfo>
                          </div>
                        ),
                    )}
                  </div>
                  {isActive ? (
                    <div className={styles.mergePanelSummary}>
                      <div className={styles.mergePanelDescWrapper}>
                        <div className={styles.mergePanelDescText}>
                          <label
                            htmlFor="comment"
                            className={styles.mergePanelLabel}
                          >
                            Commentaire (optionnel)
                          </label>
                        </div>
                        <textarea
                          value={commentValue}
                          onChange={handleChange}
                          id="comment"
                          name="text"
                          className={`fr-text--sm fr-input fr-mb-4v ${styles.mergePanelTextarea}`}
                          placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ou de la fusion ? Laissez un commentaire ici."
                        />
                      </div>
                      <span>
                        Vous avez choisi de fusionner{' '}
                        <span className={styles.mergePanelSummaryText}>
                          {candidatesWithAddresses.length} bâtiments en 1
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${styles.mergePanelCard} kg-card kg-callout-card kg-callout-card-yellow`}
                    >
                      <span className={styles.mergePanelCardText}>
                        Il manque au moins un bâtiment à votre sélection
                      </span>
                      <span>
                        Vous devez sélectionner au moins 2 bâtiments pour
                        pouvoir les fusionner !
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.mergePanelTextNoBuilding}>
                  <span>Aucun bâtiment sélectionné</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
function FooterPanel({
  newBuilding,
  isLoading,
  candidatesWithAddresses,
  newMerge,
  cancelMerge,
  handleSubmit,
}: {
  newBuilding: SelectedBuilding | null;
  isLoading: boolean;
  candidatesWithAddresses: (SelectedBuilding | undefined)[] | null;
  newMerge: () => void;
  cancelMerge: () => void;
  handleSubmit: () => void;
}) {
  return (
    <>
      {newBuilding?.rnb_id ? (
        <Button onClick={newMerge}>Nouvelle fusion</Button>
      ) : (
        <>
          <Button onClick={cancelMerge} priority="tertiary no outline">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (candidatesWithAddresses?.length ?? 0) < 2}
            title={
              (candidatesWithAddresses?.length ?? 0) > 1
                ? `Fusionner ${candidatesWithAddresses?.length} bâtiments en un seul`
                : 'Sélectionnez au moins 2 bâtiments à fusionner'
            }
          >
            Valider la fusion
          </Button>
        </>
      )}
    </>
  );
}
