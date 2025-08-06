import RNBIDHeader from './RNBIDHeader';
import styles from '@/styles/contribution/editPanel.module.scss';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import { BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';
import { geojsonToReducedPrecisionWKT } from '@/utils/geojsonToReducedPrecisionWKT';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export default function CreationPanel() {
  const dispatch: AppDispatch = useDispatch();
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );
  const buildingNewShape = useSelector(
    (state: RootState) => state.edition.updateCreate.buildingNewShape,
  );
  const mapCoordinates = useSelector((state: RootState) => state.map.moveTo);
  const [newStatus, setNewStatus] = useState<BuildingStatusType>('constructed');
  const [step, setStep] = useState<number>(1);
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    [],
  );
  const [commentValue, setCommentValue] = useState('');
  const { fetch } = useRNBFetch();

  const cancelCreation = () => {
    dispatch(Actions.edition.reset());
    dispatch(Actions.edition.setOperation(null));
  };

  useEffect(() => {
    if (buildingNewShape && shapeInteractionMode === 'drawing') {
      setStep(2);
    }
  }, [shapeInteractionMode, buildingNewShape]);

  const handleEditAddress = (addresses: BuildingAddressType[]) => {
    setLocalAddresses(addresses);
  };

  const createBuilding = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/`;

    let data: { [key: string]: any } = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
      shape: geojsonToReducedPrecisionWKT(buildingNewShape!),
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
        dispatch(Actions.edition.setBuildingNewShape(null));
        dispatch(Actions.edition.setOperation(null));
        const data = await response.json();
        const rnb_id = data.rnb_id;
        toasterSuccess(dispatch, `Bâtiment ${rnb_id} créé avec succès`);
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(event.target.value);
  };
  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Créer un nouveau bâtiment </span>
        {step == 1 && (
          <h1 className="fr-text--lg fr-m-0">étape 1 - Géométrie</h1>
        )}
        {step == 2 && (
          <h1 className="fr-text--lg fr-m-0">étape 2 - informations</h1>
        )}
      </RNBIDHeader>
      <PanelBody>
        {step === 1 && (
          <div className={`${styles.panelSection} ${styles.noPad}`}>
            {mapCoordinates && mapCoordinates.zoom < 18 ? (
              <div style={{ display: 'flex' }}>
                <span className="fr-pr-2v">
                  <i className="fr-icon-feedback-line"></i>
                </span>
                Zoomez sur la carte pour pouvoir tracer le bâtiment avec
                précision
              </div>
            ) : (
              <>
                <div>Tracez la géométrie du bâtiment sur la carte.</div>
                <div className="fr-pt-3v">Un double-clic termine le tracé.</div>
              </>
            )}
          </div>
        )}
        {step === 2 && (
          <>
            <BuildingStatus
              status={newStatus}
              onChange={setNewStatus}
            ></BuildingStatus>

            <BuildingAddresses
              buildingPoint={[mapCoordinates!.lng, mapCoordinates!.lat]}
              addresses={localAddresses}
              onChange={handleEditAddress}
            />
            <div className={styles.panelSection}>
              <div className={`fr-text--xs ${styles.sectionTitle}`}>
                <label htmlFor="comment">Commentaire (optionnel)</label>
              </div>
              <textarea
                value={commentValue}
                onChange={handleChange}
                id="comment"
                name="text"
                className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
                placeholder="Laissez un commentaire optionnel sur les raisons de ce changement. Celui-ci sera visible aux autre utilisateur dans l'historique de l'identifiant."
              />
            </div>
          </>
        )}
      </PanelBody>
      <div className={styles.footer}>
        <Button onClick={cancelCreation} priority="tertiary no outline">
          Annuler
        </Button>
        {step === 2 && (
          <Button onClick={createBuilding}>Créer le bâtiment</Button>
        )}
      </div>
    </>
  );
}
