import TabPanel from '@/components/panel/TabPanel';
import createBuildingImage from '@/public/images/map/edition/create.svg';
import createSelectedBuildingImage from '@/public/images/map/edition/create_selected.svg';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import styles from '@/styles/contribution/editPanel.module.scss';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import Button from '@codegouvfr/react-dsfr/Button';
import { geojsonToWKT } from '@terraformer/wkt';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BuildingActivationToggle from './BuildingActivationToggle';
import BuildingAddresses from './BuildingAddresses';
import BuildingShape from './BuildingShape';
import BuildingStatus from './BuildingStatus';
import CreationPanel from './CreationPanel';
import RNBIDHeader from './RNBIDHeader';
import Toaster, {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import { BuildingAddressType } from './types';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

function anyChangesBetween(a: any, b: any) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function EditSelectedBuildingPanelContent({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  const rnbId = selectedBuilding.rnb_id;
  const isActive = selectedBuilding.is_active;
  const dispatch: AppDispatch = useDispatch();
  const [newStatus, setNewStatus] = useState<BuildingStatusType>(
    selectedBuilding.status,
  );
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    selectedBuilding.addresses,
  );

  const buildingNewShape = useSelector(
    (state: RootState) => state.edition.updateCreate.buildingNewShape,
  );
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );

  const anyChanges = anyChangesBetween(
    {
      status: newStatus,
      addresses: localAddresses.map((a) => a.id).sort(),
      shape: buildingNewShape,
    },
    {
      status: selectedBuilding.status,
      addresses: selectedBuilding.addresses.map((a) => a.id).sort(),
      shape: null,
    },
  );

  const { fetch } = useRNBFetch();

  useEffect(() => {
    setNewStatus(selectedBuilding.status);
    setLocalAddresses(selectedBuilding.addresses);
  }, [selectedBuilding]);

  const handleEditAddress = (addresses: BuildingAddressType[]) => {
    setLocalAddresses(addresses);
  };

  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${selectedBuilding.rnb_id}/`;

    let data: { [key: string]: any } = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
    };

    if (buildingNewShape) {
      // send the data in WKT format
      data['shape'] = geojsonToWKT(buildingNewShape);
    }

    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'PATCH',
      });

      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      } else {
        // force the map to reload the building, to immediatly show the modifications made
        dispatch(Actions.map.reloadBuildings());
        dispatch(Actions.edition.setBuildingNewShape(null));
        toasterSuccess(dispatch, "Modification enregistrée");
        await dispatch(Actions.map.selectBuilding(rnbId));
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  const cancelUpdate = () => {
    dispatch(Actions.edition.setOperation(null));
    dispatch(Actions.edition.reset());
  };

  const toggleBuildingActivation = async (isActive: boolean) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${selectedBuilding.rnb_id}/`;
    const data = {
      is_active: isActive,
    };
    const response = await fetch(url, {
      body: JSON.stringify(data),
      method: 'PATCH',
    });
    if (!response.ok) {
      toasterError(
        dispatch,
        `Erreur lors de ${isActive ? "l'activation" : 'la désactivation'} du bâtiment`,
      );
      return;
    }
    toasterSuccess(
      dispatch,
      `Le bâtiment a été ${isActive ? 'réactivé' : 'désactivé'}`,
    );
    await dispatch(Actions.map.selectBuilding(rnbId));
    dispatch(Actions.map.reloadBuildings());
  };
  return (
    <>
      <TabPanel />
      <RNBIDHeader>
        <span className="fr-text--xs">Identifiant RNB</span>
        <h1 className="fr-text--lg fr-m-0">{rnbId}</h1>
      </RNBIDHeader>
      <PanelBody>
        {isActive && (
          <>
            <BuildingStatus
              status={newStatus}
              onChange={setNewStatus}
            ></BuildingStatus>
            <BuildingAddresses
              buildingPoint={selectedBuilding.point.coordinates}
              addresses={localAddresses}
              onChange={handleEditAddress}
            />
            <BuildingShape
              shapeInteractionMode={shapeInteractionMode}
              selectedBuilding={selectedBuilding}
            ></BuildingShape>
          </>
        )}
        <BuildingActivationToggle
          isActive={isActive}
          onToggle={toggleBuildingActivation}
        />
      </PanelBody>
      <div className={styles.footer}>
        <Button onClick={handleSubmit} disabled={!isActive || !anyChanges}>
          Valider les modifications
        </Button>
        {anyChanges && (
          <Button onClick={cancelUpdate} priority="tertiary no outline">
            Annuler
          </Button>
        )}
      </div>
    </>
  );
}

function PanelWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default function EditionPanel() {
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const operation = useSelector((state: RootState) => state.edition.operation);
  const zoomLevel = useSelector((state: RootState) => state.map.moveTo?.zoom);
  const selectedBuilding =
    selectedItem?._type === 'building'
      ? (selectedItem as SelectedBuilding)
      : null;

  const toggleCreateBuilding = () => {
    if (operation === "create") {
      dispatch(Actions.edition.setOperation(null));
    } else {
      dispatch(Actions.edition.setOperation("create"));
    }
  };

  useEffect(() => {
    if (operation === "create") {
      dispatch(Actions.edition.reset());

      // you can draw if the zoom level is high enough
      if (zoomLevel && zoomLevel > 18) {
        dispatch(Actions.edition.setShapeInteractionMode("drawing"));
      } else {
        dispatch(Actions.edition.setShapeInteractionMode(null));
      }
    } else if (operation === null) {
      dispatch(Actions.edition.setShapeInteractionMode(null));
    }
  };

  return (
    <>
      <div className={styles.actions}>
        <Button
          onClick={toggleCreateBuilding}
          className={operation === 'create' ? styles.buttonSelected : ''}
          size="small"
          priority="tertiary no outline"
        >
          <div className={styles.action}>
            <img
              src={
                operation === 'create'
                  ? createSelectedBuildingImage.src
                  : createBuildingImage.src
              }
              alt=""
              height="32"
              width="32"
            />
            <small
              className={operation === 'create' ? styles.actionSelected : ''}
            >
              créer
            </small>
          </div>
        </Button>
      </div>

      {operation == 'update' && selectedBuilding && (
        <PanelWrapper>
          <EditSelectedBuildingPanelContent
            selectedBuilding={selectedBuilding}
          />
        </PanelWrapper>
      )}
      {operation == 'create' && (
        <PanelWrapper>
          <CreationPanel />
        </PanelWrapper>
      )}

      <Toaster></Toaster>
    </>
  );
}
