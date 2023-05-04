// DSFR & styles
import { fr } from "@codegouvfr/react-dsfr";
import styles from '@/components/BdgOp.module.css'

// Contexts
import { useContext } from 'react';
import { AdsContext } from './AdsContext';
import { MapContext } from '@/components/MapContext'

export default function BdgOp({data=null}) {


    const [ads, setAds] = useContext(AdsContext)    
    const [mapCtx, setMapCtx] = useContext(MapContext)

    const chooseOpOption = (op: string, idenfitier: string) => {
        
        ads.updateBdgOperation(op, idenfitier)
        setAds(ads.clone())

    }

    const centerMap = (lat: number, lng: number) => {

        mapCtx.data.position.center = [lng, lat]
        mapCtx.data.position.zoom = 20

        setMapCtx(mapCtx.clone())

    }

    const removeBdg = (identifier: string) => {
        ads.removeIdentifier(identifier)
        setAds(ads.clone())
    }

    const isEditing = () => {
        return ads.state.bdg_move == data.building.identifier
    }

    return (
        <>
        <li className={styles.op} key={data.building.rnb_id}>
                    <div>
                        <span className={styles.opIdentifierShell}>
                        <span onClick={() => {centerMap(data.building.lat, data.building.lng)}} className={styles.opIdentifier}>{data.building.rnb_id}</span>
                            <span className={styles.centerHelp}><i className={fr.cx("fr-icon-map-pin-2-line")}></i>Centrer la carte</span>
                            {isEditing() ? " (en cours d'édition)" : ""}
                            </span>
                    </div>
                <span onClick={() => {chooseOpOption("build", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__build} ${data.operation == "build" ? styles.active : ""}`}>Construction</span> 
                <span onClick={() => {chooseOpOption("modify", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__modify} ${data.operation == "modify" ? styles.active : ""}`}>Modification</span>
                <span onClick={() => {chooseOpOption("demolish", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__demolish}  ${data.operation == "demolish" ? styles.active : ""}`}>Démolition</span> 
                        
                <span title="Retirer ce bâtiment de l'ADS" onClick={() => {removeBdg(data.building.rnb_id)}} className={styles.opRemove}><i className={fr.cx("fr-icon-delete-line")}></i></span> 

                        </li>
        </>
    )

}