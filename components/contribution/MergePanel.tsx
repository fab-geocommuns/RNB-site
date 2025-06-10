import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { useEffect, useState } from 'react';
import { fetchBuilding } from '@/utils/request';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { formatCandidates } from '@/stores/edition/edition-slice';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import RNBIDHeader from './RNBIDHeader';
import { Loader } from '@/components/Loader';
import styles from '@/styles/merge.module.scss';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import Toaster, {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
export default function CreationPanel() {
  const dispatch: AppDispatch = useDispatch();
  const candidatesToMerge = useSelector(
    (state: RootState) => state.edition.merge.candidates,
  );
  const isActive = candidatesToMerge.length > 1;
  const { fetch } = useRNBFetch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<(SelectedBuilding | undefined)[] | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (candidatesToMerge.length) {
        const responses = await Promise.all(
          candidatesToMerge.map((candidate) => fetchBuilding(candidate)),
        );
        setData(responses);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [candidatesToMerge]);
  const cancelMerge = () => {
    dispatch(Actions.edition.setOperation(null));
    dispatch(Actions.edition.resetCandidates());
  };
  const selectCandidateToRemove = (rnbId: string) => {
    const candidates =
      data?.filter((candidate) => candidate?.rnb_id !== rnbId) || null;
    setData(candidates);
    dispatch(
      Actions.edition.setCandidates(formatCandidates(rnbId, candidatesToMerge)),
    );
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/merge/`;

    const data: { [key: string]: any } = {
      rnb_ids: candidatesToMerge,
      status: 'constructed',
      addresses_cle_interop: [],
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
        dispatch(Actions.edition.setBuildingNewShape(null));
        dispatch(Actions.edition.setOperation(null));
        const data = await response.json();
        dispatch(Actions.map.selectBuilding(data.rnb_id));
        toasterSuccess(dispatch, `Les bâtiments ont été fusionnés avec succès`);
        cancelMerge();
      }
      setIsLoading(false);
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la fusion');
      setIsLoading(false);
      console.error(err);
    }
  };
  return (
    <>
      <RNBIDHeader>
        <h1 className="fr-text--lg fr-m-0">Fusionner des bâtiments</h1>
      </RNBIDHeader>
      <div className={styles.mergePanel_body}>
        <div className={styles.mergePanel__descWrapper}>
          <span className={styles.mergePanel__descText}>Je sélectionne</span>
          <span className={styles.mergePanel__descSubText}>
            sur la carte les bâtiments attenants que je souhaite fusionner
          </span>
        </div>
        {isLoading ? (
          <div className={styles.mergePanel__loader}>
            <Loader />
            <span>Chargement en cours</span>
          </div>
        ) : (
          <div>
            {data?.length ? (
              <div>
                {data.map(
                  (candidate) =>
                    candidate && (
                      <div
                        key={candidate?.rnb_id}
                        className={styles.mergePanel__infoWrapper}
                      >
                        <div className={styles.mergePanel__rnbIdWrapper}>
                          <div className={styles.mergePanel__rnbId}>
                            <span className="fr-text--lg fr-m-0">
                              {candidate.rnb_id}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              selectCandidateToRemove(candidate.rnb_id)
                            }
                          >
                            <span
                              className="fr-icon-close-circle-fill"
                              aria-hidden="true"
                            ></span>
                          </button>
                        </div>
                        <div className={styles.mergePanel__addressesWrapper}>
                          <span className={styles.mergePanel__label}>
                            {candidate?.addresses?.length > 1
                              ? 'Adresses'
                              : 'Adresse'}
                          </span>
                          {candidate?.addresses?.length ? (
                            <div>
                              {candidate.addresses.map((addresse) => (
                                <div>
                                  <div
                                    className={
                                      styles.mergePanel__addressWrapper
                                    }
                                  >
                                    <span
                                      className={styles.mergePanel__addressText}
                                    >
                                      {addresse.street_number} {addresse.street}{' '}
                                      {addresse.city_zipcode}{' '}
                                      {addresse.city_name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className={styles.mergePanel__addressText}>
                              Aucune adresse disponible
                            </span>
                          )}
                        </div>
                        <div className={styles.mergePanel__addressWrapper}>
                          <span className={styles.mergePanel__label}>
                            Statut du bâtiment :
                          </span>
                          <div className="fr-badge fr-badge--success fr-badge--no-icon">
                            <span>{BuildingStatusMap[candidate.status]}</span>
                          </div>
                        </div>
                      </div>
                    ),
                )}
                {isActive ? (
                  <div className={styles.mergePanel__summary}>
                    <span>
                      Vous avez choisi de fusionner{' '}
                      <span className={styles.mergePanel__summaryText}>
                        {data.length} bâtiments en 1
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
                      Vous devez sélectionner au moins 2 bâtiments pour pouvoir
                      les fusionner !
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.mergePanel__textNoBuilding}>
                Aucun bâtiment sélectionné 😔
              </div>
            )}
          </div>
        )}
        <div className={styles.footer}>
          <Button onClick={handleSubmit} disabled={!isActive}>
            Valider la fusion
          </Button>
          <Button onClick={cancelMerge} priority="tertiary no outline">
            Annuler
          </Button>
        </div>
      </div>
    </>
  );
}
