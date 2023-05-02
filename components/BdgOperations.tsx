'use client'

import { useContext } from 'react';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';
import { fr } from "@codegouvfr/react-dsfr";
import { MapContext } from '@/components/MapContext'

export default function BdgOperations() {

    const [ads, setAds] = useContext(AdsContext)    
    const [mapCtx, setMapCtx] = useContext(MapContext)

    const chooseOpOption = (op: string, rnb_id: string) => {
        
        ads.updateBdgOperation(op, rnb_id)
        setAds(ads.clone())

    }

    const centerMap = (lat: number, lng: number) => {

        mapCtx.data.position.center = [lng, lat]
        mapCtx.data.position.zoom = 20

        setMapCtx(mapCtx.clone())

    }

    return (
        <>
            <div className={styles.grid}>
            
            <div>
            <div>Bâtiments concernés par l'ADS</div>
                <ul className={styles.opsList}>
                    {ads.buildings_operations?.map((bdgop) => (
                        <li className={styles.op} key={bdgop.building.rnb_id}>
                            <div>
                                <span className={styles.opIdentifierShell}>
                                <span onClick={() => {centerMap(bdgop.building.lat, bdgop.building.lng)}} className={styles.opIdentifier}>{bdgop.building.rnb_id}</span>
                                 <span className={styles.centerHelp}><i className={fr.cx("fr-icon-map-pin-2-line")}></i>Centrer la carte</span>
                                 </span>
                            </div>
                        <span onClick={() => {chooseOpOption("build", bdgop.building.rnb_id)}} className={`${styles.opOption} ${styles.opOption__build} ${bdgop.operation == "build" ? styles.active : ""}`}>Construction</span> 
                        <span onClick={() => {chooseOpOption("modify", bdgop.building.rnb_id)}} className={`${styles.opOption} ${styles.opOption__modify} ${bdgop.operation == "modify" ? styles.active : ""}`}>Modification</span>
                        <span onClick={() => {chooseOpOption("demolish", bdgop.building.rnb_id)}} className={`${styles.opOption} ${styles.opOption__demolish}  ${bdgop.operation == "demolish" ? styles.active : ""}`}>Démolition</span> 
                        
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.mapShell}>
                
            </div>
            </div>
            

        </>
    )

}