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
import { geojsonToWKT } from '@terraformer/wkt';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import { PanelBody, PanelFooter, PanelHeader, PanelSection } from '../ui/Panel';

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

    const data: { [key: string]: any } = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
      shape: geojsonToWKT(buildingNewShape!),
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
        const rnb_id = data.rnb_id;
        toasterSuccess(dispatch, `Bâtiment ${rnb_id} créé avec succès`);
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  return (
    <>
      <PanelHeader onClose={cancelCreation}>
        Créer un nouveau bâtiment
      </PanelHeader>
      <PanelBody>
        {step === 1 && (
          <PanelSection
            title="Etape 1 - Géométrie"
            body={
              mapCoordinates && mapCoordinates.zoom < 18 ? (
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
                  <div className="fr-pt-3v">
                    Un double-clic termine le tracé.
                  </div>
                </>
              )
            }
          />
        )}
        {step === 2 && (
          <PanelSection
            title="Etape 2 - informations"
            body={
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
              </>
            }
          />
        )}
      </PanelBody>
      <PanelFooter>
        <Button onClick={cancelCreation} priority="tertiary no outline">
          Annuler
        </Button>
        {step === 2 && (
          <Button onClick={createBuilding}>Créer le bâtiment</Button>
        )}
      </PanelFooter>
    </>
  );
}
