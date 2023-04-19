'use client'

import { useState, useContext, useEffect } from 'react';
import ADSMap from './ADSMap';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';



export default function BdgOperations() {

    const [ads, setAds] = useContext(AdsContext)    

    const handleTogleRnbId = (rnbid: string) => {
        console.log('Handle toggle rnbid: ' + rnbid)
        toggleRnbId(rnbid)
    }

    const toggleRnbId = (rnbid: string) => {

        console.log('toggle rnbid: ' + rnbid)

        const hasRnbId = containsRnbId(rnbid)
        console.log(hasRnbId)
    
        if (hasRnbId) {
            // remove
            removeRnbId(rnbid)
            
            
        } else {
            // add
            addRnbId(rnbid)
            
        }

    }

    const containsRnbId = (rnbid: string): boolean => {
        
        
    }

    const removeRnbId = (rnbid: string) => {

    }

    const addRnbId = (rnbid: string) => {

        
    }

    return (
        <>
            <div className={styles.grid}>
            <div>
                
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