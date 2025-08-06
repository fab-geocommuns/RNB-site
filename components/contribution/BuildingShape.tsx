import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';

import Button from '@codegouvfr/react-dsfr/Button';

import styles from '@/styles/contribution/building.module.scss';
import editPolygonIcon from '@/public/images/map/edition/edit_polygon.svg';
import editPolygonDisabledIcon from '@/public/images/map/edition/edit_polygon_disabled.svg';
import newPolygonIcon from '@/public/images/map/edition/new_polygon.svg';

export default function BuildingShape({
  shapeInteractionMode,
  selectedBuilding,
}: {
  shapeInteractionMode: ShapeInteractionMode;
  selectedBuilding: SelectedBuilding;
}) {
  const dispatch: AppDispatch = useDispatch();

  const handleBuildingShapeModification = () => {
    dispatch(Actions.edition.setShapeInteractionMode('updating'));
  };

  const handleBuildingShapeCreation = () => {
    if (shapeInteractionMode === 'drawing') {
      // that's a way to cancel the ongoing drawing
      dispatch(Actions.edition.setShapeInteractionMode(null));
      dispatch(Actions.edition.setBuildingNewShape(null));
    } else {
      dispatch(Actions.edition.setShapeInteractionMode('drawing'));
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
              priority={`tertiary${shapeInteractionMode === 'updating' ? '' : ' no outline'}`}
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

          {shapeInteractionMode === 'updating' && (
            <div className="fr-text--xs fr-pt-1v fr-mb-1v">
              Modifiez la géométrie du bâtiment directement sur la carte en
              déplacant les sommets du polygone.
            </div>
          )}
          <span style={{ display: 'inline-block', width: 250 }}>
            <Button
              size="small"
              onClick={handleBuildingShapeCreation}
              priority={`tertiary${shapeInteractionMode === 'drawing' ? '' : ' no outline'}`}
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
            {shapeInteractionMode === 'drawing' && (
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
