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

        if (hasPosition()) {
            mapCtx.data.position.center = [data.building.lng, data.building.lat]
            mapCtx.data.position.zoom = 20
    
            setMapCtx(mapCtx.clone())
        }

        

    }

    const removeBdg = (identifier: string) => {
        ads.removeIdentifier(identifier)
        setAds(ads.clone())
    }

    const isEditing = () => {
        return ads.state.bdg_move == data.building.identifier
    }
    const isNew = () => {
        return data.building.rnb_id == "new"
    }

    const hasPosition = () => {
        return data.building.lat != null && data.building.lng != null
    }

    const helpText = () => {

        if (isEditing()) {

            if (hasPosition()) {
                return "Déplacez le bâtiment en clickant sur la carte"
            } else {
                return "Placez le bâtiment en clickant sur la carte"
            }

            
        }
        


        return ""


    }

    const opLabel = () => {

        if (isNew()) {
            return "Nouveau"
        }

        return data.building.rnb_id

    }

    return (
        <>
        <li className={styles.op} key={data.building.rnb_id}>
                    <div>
                        <span className={styles.opIdentifierShell}>
                        <span onClick={() => {centerMap()}} className={styles.opIdentifier}>{opLabel()}</span>
                            <span className={styles.centerHelp}>{helpText()}</span>
                            </span>
                    </div>
                <span onClick={() => {chooseOpOption("build", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__build} ${data.operation == "build" ? styles.active : ""}`}>Construction</span> 
                <span onClick={() => {chooseOpOption("modify", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__modify} ${data.operation == "modify" ? styles.active : ""}`}>Modification</span>
                <span onClick={() => {chooseOpOption("demolish", data.building.identifier)}} className={`${styles.opOption} ${styles.opOption__demolish}  ${data.operation == "demolish" ? styles.active : ""}`}>Démolition</span> 
                        
                <span className={styles.opToolsShell}>
                    {isNew() && <span title="Déplacer ce bâtiment" onClick={() => {}} className={`${styles.opTool} ${styles.opMove} ${isEditing() ? styles.opMove__active : ""}`}><i className={fr.cx("fr-icon-drag-move-2-line")}></i></span>}
                    <span title="Retirer ce bâtiment de l'ADS" onClick={() => {removeBdg(data.building.rnb_id)}} className={`${styles.opTool} ${styles.opRemove}`}><i className={fr.cx("fr-icon-delete-line")}></i></span>
                    
                </span>


                

                        </li>
        </>
    )

}