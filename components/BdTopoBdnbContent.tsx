import { SelectedBuilding } from '@/stores/map/map-slice';
import deployableStyle from '@/styles/deployableBlock.module.scss';
interface BuildingInfoProps {
  building: SelectedBuilding;
}
export default function BuildingInfo({ building }: BuildingInfoProps) {
  return (
    <>
      <div className={deployableStyle.sectionBody}>
        {building?.ext_ids?.length === 0 ? (
          <div>
            <em>Aucun lien avec une autre base de donnée.</em>
          </div>
        ) : (
          building?.ext_ids?.map((ext_id) => (
            <div key={ext_id.id} className={deployableStyle.sectionListItem}>
              <span>Base de données : {ext_id.source}</span>
              <br />
              <span>Identifiant : {ext_id.id}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
