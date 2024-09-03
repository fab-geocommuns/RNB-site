// Styles
import { RootState, Actions, AppDispatch } from '@/stores/map/store';
import styles from '@/styles/mapLayerModal.module.scss';
import { useSelector, useDispatch } from 'react-redux';

export default function MapLayerModal() {
  const setMapBackground = (background: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(Actions.map.setMapBackground(background));
  };

  const setBuildingsShape = (shape: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(Actions.map.setBuildingsShape(shape));
  };

  const dispatch: AppDispatch = useDispatch();
  const mapBackground = useSelector((state: RootState) => state.mapBackground);
  const buildingShape = useSelector((state: RootState) => state.buildingsShape);

  return (
    <>
      <div className={styles.modal}>
        <h3>Forme des bâtiments</h3>
        <p>Selected : {buildingShape}</p>
        <ul>
          <li>
            <a href="#" onClick={setBuildingsShape('point')}>
              Points
            </a>
          </li>
          <li>
            <a href="#" onClick={setBuildingsShape('polygon')}>
              Polygones
            </a>
          </li>
        </ul>
        <h3>Fonds de carte</h3>
        <p>Selected : {mapBackground}</p>
        <ul>
          <li>
            <a href="#" onClick={setMapBackground('satellite')}>
              Satellite
            </a>
          </li>
          <li>
            <a href="#" onClick={setMapBackground('ign')}>
              Plan IGN
            </a>
          </li>
          <li>
            <a href="#" onClick={setMapBackground('osm')}>
              OSM
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
