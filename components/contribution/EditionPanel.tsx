import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { useState, useEffect } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import BuildingShape from './BuildingShape';
import CreationPanel from './CreationPanel';
import MergePanel from './MergePanel';
import BuildingActivationToggle from './BuildingActivationToggle';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { geojsonToWKT } from '@terraformer/wkt';
import { BuildingAddressType } from './types';
import { Loader } from '@/components/Loader';
import Button from '@codegouvfr/react-dsfr/Button';

import createBuildingImage from '@/public/images/map/edition/create.svg';
useMapEditBuildingShape;
import createSelectedBuildingImage from '@/public/images/map/edition/create_selected.svg';

import splitBuildingImage from '@/public/images/map/edition/split.svg';
import splitSelectedBuildingImage from '@/public/images/map/edition/split_selected.svg';

import mergeBuildingImage from '@/public/images/map/edition/merge.svg';
import mergeSelectedBuildingImage from '@/public/images/map/edition/merge_selected.svg';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import Toaster, {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import SplitPanel from './SplitPanel';

import { useMapEditBuildingShape } from '../map/useMapEditBuildingShape';
import { Operation } from '@/stores/edition/edition-slice';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
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
        toasterSuccess(dispatch, 'Modification enregistrée');
        await dispatch(Actions.map.selectBuilding(rnbId));
      }
      setIsLoading(false);
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la modification');
      setIsLoading(false);
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
    console.log(isLoading);
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
      <RNBIDHeader>
        <span className="fr-text--xs">Identifiant RNB</span>
        <h1 className="fr-text--lg fr-m-0">{rnbId}</h1>
      </RNBIDHeader>
      <PanelBody>
        {isLoading ? (
          <div className={styles.editLoader}>
            <Loader />
            <span>Chargement en cours</span>
          </div>
        ) : (
          isActive && (
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
          )
        )}
        {!isLoading && (
          <BuildingActivationToggle
            isActive={isActive}
            onToggle={toggleBuildingActivation}
          />
        )}
      </PanelBody>
      <div className={styles.footer}>
        <Button
          onClick={handleSubmit}
          disabled={!isActive || !anyChanges || isLoading}
        >
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

  const selectedBuilding =
    selectedItem?._type === 'building'
      ? (selectedItem as SelectedBuilding)
      : null;

  const toggleOperation = (operationName: Operation) => () => {
    if (operation === operationName) {
      dispatch(Actions.edition.setOperation(null));
    } else {
      dispatch(Actions.edition.setOperation(operationName));
    }
  };

  const toggleCreateBuilding = toggleOperation('create');
  const toggleSplitBuilding = toggleOperation('split');
  const toggleMergeBuilding = toggleOperation('merge');

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
        <Button
          onClick={toggleMergeBuilding}
          className={operation === 'merge' ? styles.buttonSelected : ''}
          size="small"
          priority="tertiary no outline"
        >
          <div className={styles.action}>
            <img
              src={
                operation === 'merge'
                  ? mergeSelectedBuildingImage.src
                  : mergeBuildingImage.src
              }
              alt=""
              height="32"
              width="32"
            />
            <small
              className={operation === 'merge' ? styles.actionSelected : ''}
            >
              fusionner
            </small>
          </div>
        </Button>
        <Button
          onClick={toggleSplitBuilding}
          className={operation === 'split' ? styles.buttonSelected : ''}
          size="small"
          priority="tertiary no outline"
        >
          <div className={styles.action}>
            <img
              src={
                operation === 'split'
                  ? splitSelectedBuildingImage.src
                  : splitBuildingImage.src
              }
              alt=""
              height="32"
              width="32"
            />
            <small
              className={operation === 'split' ? styles.actionSelected : ''}
            >
              scinder
            </small>
          </div>
        </Button>
      </div>

      {operation && (
        <PanelWrapper>
          {operation == 'update' && selectedBuilding && (
            <EditSelectedBuildingPanelContent
              selectedBuilding={selectedBuilding}
            />
          )}
          {operation == 'create' && <CreationPanel />}
          {operation == 'split' && <SplitPanel />}
          {operation == 'merge' && <MergePanel />}
        </PanelWrapper>
      )}

      <Toaster></Toaster>
    </>
  );
}
