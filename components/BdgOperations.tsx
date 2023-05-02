'use client'

import { useContext } from 'react';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';



export default function BdgOperations() {

    const [ads, setAds] = useContext(AdsContext)    

    const chooseOpOption = (op: string, rnb_id: string) => {
        
        ads.updateBdgOperation(op, rnb_id)
        setAds(ads.clone())

    }

    return (
        <>
            <div className={styles.grid}>
            
            <div>
            <div>Liste des opérations</div>
                <ul>
                    {ads.buildings_operations?.map((bdgop) => (
                        <li className={styles.op} key={bdgop.building.rnb_id}>{bdgop.building.rnb_id}<br />

                        <span onClick={() => {chooseOpOption("build", bdgop.building.rnb_id)}} className={`${styles.opOption} ${bdgop.operation == "build" ? styles.active : ""}`}>Construction</span> 
                        <span onClick={() => {chooseOpOption("demolish", bdgop.building.rnb_id)}} className={`${styles.opOption} ${bdgop.operation == "demolish" ? styles.active : ""}`}>Démolition</span> 
                        <span onClick={() => {chooseOpOption("modify", bdgop.building.rnb_id)}} className={`${styles.opOption} ${bdgop.operation == "modify" ? styles.active : ""}`}>Modification</span>
                        {bdgop.operation}
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