'use client'

import { useState, useContext, useEffect } from 'react';
import ADSMap from './ADSMap';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';



export default function BdgOperations() {

    const [ads, setAds] = useContext(AdsContext)    

    return (
        <>
            <div className={styles.grid}>
            <div>
                <ADSMap />
            </div>
            <div>
            <div>Liste des opérations</div>
                <ul>
                    {ads.buildings_operations?.map((bdgop) => (
                        <li key={bdgop.building.rnb_id}>{bdgop.building.rnb_id} - {bdgop.operation}<br />
                        lat {bdgop.building.lat} - lng {bdgop.building.lng}</li>
                    ))}
                </ul>
            </div>
            
            </div>
            

        </>
    )

}