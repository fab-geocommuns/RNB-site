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
import GenericPanel from '@/components/panel/GenericPanel';
import EditionButton from '@/components/contribution/EditionButton';
import BuildingActivationToggle from './BuildingActivationToggle';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { geojsonToReducedPrecisionWKT } from '@/utils/geojsonToReducedPrecisionWKT';
import { BuildingAddressType } from './types';
import { Loader } from '@/components/Loader';
import Button from '@codegouvfr/react-dsfr/Button';

import createBuildingImage from '@/public/images/map/edition/create.svg';
import createSelectedBuildingImage from '@/public/images/map/edition/create_selected.svg';

import splitBuildingImage from '@/public/images/map/edition/split.svg';
import splitSelectedBuildingImage from '@/public/images/map/edition/split_selected.svg';

import mergeBuildingImage from '@/public/images/map/edition/merge.svg';
import mergeSelectedBuildingImage from '@/public/images/map/edition/merge_selected.svg';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';
import Toaster, {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';
import SplitPanel from './SplitPanel';

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
  const [commentValue, setCommentValue] = useState('');
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
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(event.target.value);
  };
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
    if (commentValue.length) data = { ...data, comment: commentValue };
    if (buildingNewShape) {
      // send the data in WKT format
      data['shape'] = geojsonToReducedPrecisionWKT(buildingNewShape);
    }
    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'PATCH',
      });

      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      } else {
        setCommentValue('');
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
      <GenericPanel
        title="Modifier"
        onClose={cancelUpdate}
        body={bodyPanel(
          rnbId,
          isLoading,
          isActive,
          newStatus,
          selectedBuilding,
          localAddresses,
          shapeInteractionMode,
          commentValue,
          setNewStatus,
          handleEditAddress,
          handleChange,
          toggleBuildingActivation,
        )}
        footer={footerPanel(
          isActive,
          anyChanges,
          isLoading,
          handleSubmit,
          cancelUpdate,
        )}
        data-testid="visu-panel"
      ></GenericPanel>
    </>
  );
}
function bodyPanel(
  rnbId: string,
  isLoading: boolean,
  isActive: boolean,
  newStatus: BuildingStatusType,
  selectedBuilding: SelectedBuilding,
  localAddresses: BuildingAddressType[],
  shapeInteractionMode: ShapeInteractionMode,
  commentValue: string,
  setNewStatus: (status: BuildingStatusType) => void,
  handleEditAddress: (addresses: BuildingAddressType[]) => void,
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
  toggleBuildingActivation: (isActive: boolean) => void,
) {
  return (
    <>
      <RNBIDHeader rnbId={rnbId}></RNBIDHeader>
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
            <div className={`${styles.panelSection}`}>
              <div className={`fr-text--xs ${styles.sectionTitle}`}>
                <label htmlFor="comment">Commentaire</label>
              </div>
              <textarea
                value={commentValue}
                onChange={handleChange}
                id="comment"
                name="text"
                className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
                placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ? Laissez un commentaire ici."
              />
            </div>
          </>
        )
      )}
      {!isLoading && (
        <BuildingActivationToggle
          isActive={isActive}
          onToggle={toggleBuildingActivation}
        />
      )}
    </>
  );
}
function footerPanel(
  isActive: boolean,
  anyChanges: boolean,
  isLoading: boolean,
  handleSubmit: () => void,
  cancelUpdate: () => void,
) {
  return (
    <>
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

  return (
    <>
      <div className={styles.actions}>
        <EditionButton
          operationType="create"
          operationText="créer"
          selectedImageSrc={createSelectedBuildingImage.src}
          imageSrc={createBuildingImage.src}
        ></EditionButton>
        <EditionButton
          operationType="merge"
          operationText="fusionner"
          selectedImageSrc={mergeSelectedBuildingImage.src}
          imageSrc={mergeBuildingImage.src}
        ></EditionButton>
        <EditionButton
          operationType="split"
          operationText="scinder"
          selectedImageSrc={splitSelectedBuildingImage.src}
          imageSrc={splitBuildingImage.src}
        ></EditionButton>
      </div>

      {operation && (
        <div data-testid="edition-panel">
          {operation == 'update' && selectedBuilding && (
            <EditSelectedBuildingPanelContent
              selectedBuilding={selectedBuilding}
            />
          )}
          {operation == 'create' && <CreationPanel />}
          {operation == 'split' && <SplitPanel />}
          {operation == 'merge' && <MergePanel />}
        </div>
      )}

      <Toaster></Toaster>
    </>
  );
}
