import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { useEffect, useState } from 'react';
import { fetchBuilding } from '@/utils/requests';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { addOrRemoveCandidate } from '@/stores/edition/edition-slice';
import MergeSummary from './MergeSummary';
import BuildingInfo from './BuildingInfo';
import GenericPanel from '@/components/panel/GenericPanel';
import { Loader } from '@/components/Loader';
import styles from '@/styles/merge.module.scss';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
export default function MergePanel() {
  const dispatch: AppDispatch = useDispatch();
  const candidatesToMerge = useSelector(
    (state: RootState) => state.edition.merge.candidates,
  );
  const newBuilding = useSelector(
    (state: RootState) => state.edition.merge.newBuilding,
  );
  const isActive = candidatesToMerge.length > 1;
  const { fetch } = useRNBFetch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commentValue, setCommentValue] = useState('');
  const [candidatesWithAddresses, setCandidatesWithAddresses] = useState<
    (SelectedBuilding | undefined)[] | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const responses = await Promise.all(
        candidatesToMerge.map((candidate) => fetchBuilding(candidate)),
      );
      setCandidatesWithAddresses(responses);
      setIsLoading(false);
    };
    if (candidatesToMerge.length) {
      fetchData();
    } else setCandidatesWithAddresses(null);
  }, [candidatesToMerge]);
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
    dispatch(
      Actions.edition.setCandidates(
        addOrRemoveCandidate(rnbId, candidatesToMerge),
      ),
    );
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/merge/`;

    let data: { [key: string]: any } = {
      comment: commentValue,
      rnb_ids: candidatesToMerge,
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
      setIsLoading(false);
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la fusion');
      setIsLoading(false);
      console.error(err);
    }
  };
  function bodyPanel() {
    return (
      <>
        {newBuilding?.rnb_id ? (
          <div className={styles.mergePanel_body}>
            <MergeSummary
              newBuilding={newBuilding}
              buildingsMerged={candidatesWithAddresses}
            />
            <div className={styles.footer}>
              <Button onClick={newMerge}>Nouvelle fusion</Button>
            </div>
          </div>
        ) : (
          <div className={styles.mergePanel_body}>
            {!isLoading && (
              <div className={styles.mergePanel__descWrapper}>
                <span className={styles.mergePanel__descText}>
                  Sélectionner les bâtiments à fusionner
                </span>
                <span className={styles.mergePanel__descSubText}>
                  Sélectionnez sur la carte les bâtiments attenants qui doivent
                  être fusionnés
                </span>
              </div>
            )}
            {isLoading ? (
              <div className={styles.mergePanel__loader}>
                <Loader />
                <span>Chargement en cours</span>
              </div>
            ) : (
              <div>
                {candidatesWithAddresses?.length ? (
                  <div>
                    {candidatesWithAddresses.map(
                      (candidate) =>
                        candidate && (
                          <BuildingInfo
                            key={candidate.rnb_id}
                            building={candidate}
                          >
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
                        ),
                    )}
                    {isActive ? (
                      <div className={styles.mergePanel__summary}>
                        <div>
                          <div className={styles.mergePanel__descText}>
                            <label htmlFor="comment">
                              Commentaire (optionnel)
                            </label>
                          </div>
                          <textarea
                            value={commentValue}
                            onChange={handleChange}
                            id="comment"
                            name="text"
                            className={`fr-text--sm fr-input fr-mb-4v ${styles.mergePanel__textarea}`}
                            placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ou de la fusion ? Laissez un commentaire ici."
                          />
                        </div>
                        <span>
                          Vous avez choisi de fusionner{' '}
                          <span className={styles.mergePanel__summaryText}>
                            {candidatesWithAddresses.length} bâtiments en 1
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`${styles.mergePanel__card} kg-card kg-callout-card kg-callout-card-yellow`}
                      >
                        <span className={styles.mergePanel__cardText}>
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
                  <div className={styles.mergePanel__textNoBuilding}>
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
  function footerPanel() {
    return (
      <>
        <div className={styles.footer}>
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
        </div>
      </>
    );
  }
  return (
    <>
      <GenericPanel
        title="Fusionner des bâtiments"
        triggerClose={cancelMerge}
        contentBody={bodyPanel()}
        contentFooter={footerPanel()}
        data-testid="edition-panel"
      ></GenericPanel>
    </>
  );
}
