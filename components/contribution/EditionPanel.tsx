import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { useState, useEffect } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { geojsonToWKT } from '@terraformer/wkt';
import { BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';
import editPolygonIcon from '@/public/images/map/edition/edit_polygon.svg';
import editPolygonDisabledIcon from '@/public/images/map/edition/edit_polygon_disabled.svg';
import newPolygonIcon from '@/public/images/map/edition/new_polygon.svg';

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
  const dispatch: AppDispatch = useDispatch();
  const [newStatus, setNewStatus] = useState<string>(selectedBuilding.status);
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    selectedBuilding.addresses,
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const buildingNewShape = useSelector(
    (state: RootState) => state.map.buildingNewShape,
  );
  const drawMode = useSelector((state: RootState) => state.map.drawMode);

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

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleBuildingShapeModification = () => {
    dispatch(Actions.map.setDrawMode('direct_select'));
  };

  const handleBuildingShapeCreation = () => {
    if (drawMode === 'draw_polygon') {
      // that's a way to cancel the ongoing drawing
      dispatch(Actions.map.setDrawMode(null));
      dispatch(Actions.map.setBuildingNewShape(null));
    } else {
      dispatch(Actions.map.setDrawMode('draw_polygon'));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${selectedBuilding.rnb_id}/`;
    const data = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
      // send the data in WKT format
      shape: buildingNewShape ? geojsonToWKT(buildingNewShape) : null,
    };

    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      await dispatch(Actions.map.selectBuilding(rnbId));
      setSuccess(true);
      // force the map to reload the building, to immediatly show the modifications made
      dispatch(Actions.map.reloadBuildings());
      dispatch(Actions.map.setBuildingNewShape(null));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  return (
    <>
      <RNBIDHeader rnbId={rnbId}></RNBIDHeader>
      <PanelBody>
        <BuildingStatus
          status={newStatus}
          onChange={setNewStatus}
        ></BuildingStatus>
        <BuildingAddresses
          buildingPoint={selectedBuilding.point.coordinates}
          addresses={localAddresses}
          onChange={handleEditAddress}
        />
        <div className="fr-mb-6v">
          <label className="fr-label">Géométrie du bâtiment</label>
          <div className="fr-pt-2v fr-pb-4v">
            <span className="fr-pr-4v">
              <Button
                onClick={handleBuildingShapeModification}
                priority={`tertiary${drawMode === 'direct_select' ? '' : ' no outline'}`}
                disabled={selectedBuilding.shape.type === 'Point'}
              >
                <img
                  src={
                    selectedBuilding.shape.type === 'Point'
                      ? editPolygonDisabledIcon.src
                      : editPolygonIcon.src
                  }
                  height="35"
                  title="Modifier la géométrie existante"
                ></img>
              </Button>
            </span>
            <span>
              <Button
                onClick={handleBuildingShapeCreation}
                priority={`tertiary${drawMode === 'draw_polygon' ? '' : ' no outline'}`}
              >
                <img
                  src={newPolygonIcon.src}
                  height="35"
                  title="Dessiner une nouvelle géométrie"
                ></img>
              </Button>
            </span>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={!anyChanges}>
          Valider les modifications
        </Button>
      </PanelBody>

      <div className={styles.noticeContainer}>
        <div
          className={`${styles.notice} ${success || error ? styles.noticeVisible : ''}`}
        >
          {success && (
            <Notice title="Modification enregistrée" severity="info" />
          )}
          {error && (
            <Notice title="Modification impossible" severity="warning" />
          )}
        </div>
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
  const selectedBuilding =
    selectedItem?._type === 'building'
      ? (selectedItem as SelectedBuilding)
      : null;
  return (
    <>
      <div className={styles.actions}>&nbsp;{/* Actions placeholder */}</div>

      {selectedBuilding && (
        <PanelWrapper>
          <EditSelectedBuildingPanelContent
            selectedBuilding={selectedBuilding}
          />
        </PanelWrapper>
      )}
    </>
  );
}
