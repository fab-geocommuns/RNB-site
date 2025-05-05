import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';

import Button from '@codegouvfr/react-dsfr/Button';

import styles from '@/styles/contribution/editPanel.module.scss';
import editPolygonIcon from '@/public/images/map/edition/edit_polygon.svg';
import editPolygonDisabledIcon from '@/public/images/map/edition/edit_polygon_disabled.svg';
import newPolygonIcon from '@/public/images/map/edition/new_polygon.svg';

export default function BuildingShape({
  drawMode,
  selectedBuilding,
}: {
  drawMode: MapboxDraw.DrawMode | null;
  selectedBuilding: SelectedBuilding;
}) {
  const dispatch: AppDispatch = useDispatch();

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

  return (
    <>
      <div className={styles.panelSection}>
        <span className={`fr-text--xs ${styles.sectionTitle}`}>Géométrie</span>

        <div className="">
          <span style={{ display: 'inline-block', width: 250 }}>
            <Button
              size="small"
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
                width="30"
                title="Modifier la géométrie existante"
              ></img>
              <span className="fr-pl-2v" style={{ textAlign: 'left' }}>
                Modifier la géometrie existante
              </span>
            </Button>
          </span>

          {drawMode === 'direct_select' && (
            <div className="fr-text--xs fr-pt-1v fr-mb-1v">
              Modifiez la géométrie du bâtiment directement sur la carte en
              déplacant les sommets du polygone.
            </div>
          )}
          <span style={{ display: 'inline-block', width: 250 }}>
            <Button
              size="small"
              onClick={handleBuildingShapeCreation}
              priority={`tertiary${drawMode === 'draw_polygon' ? '' : ' no outline'}`}
            >
              <img
                src={newPolygonIcon.src}
                width="30"
                title="Dessiner une nouvelle géométrie"
              ></img>
              <span className="fr-pl-2v" style={{ textAlign: 'left' }}>
                Redessiner la géométrie du bâtiment en partant de 0
              </span>
            </Button>
          </span>
          <div className="fr-text--xs fr-pt-1v">
            {drawMode === 'draw_polygon' && (
              <span>
                Redessinez la géométrie du bâtiment {selectedBuilding.rnb_id} en
                cliquant sur la carte. Pour finaliser la géométrie, fermez le
                polygone en <strong>recliquant sur le premier point.</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
