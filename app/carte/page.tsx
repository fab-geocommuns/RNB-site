'use client'
import { useState } from 'react';
import VisuMap from '@/components/VisuMap'
import AddressSearch from '@/components/AddressSearch'
import { MapContext } from '@/components/MapContext';
import styles from './RNBMap.module.css'

export default function RNBMap() {

    const [mapCtx, setMapCtx] = useState({})

    return (
        <>
            <MapContext.Provider value={{mapCtx, setMapCtx}}>
            <div className={styles.geodisplay}>    
                <div className={styles.geodisplay__panel}>
                    <div>
                        <div>
                            <label className="fr-label">Rechercher une adresse</label>
                            </div>
                        <AddressSearch />
                    </div>
                    <p>todo : result</p>
                    </div>    
                <div className={styles.geodisplay__map}><VisuMap /></div>
            </div>
            </MapContext.Provider>
        </>
    )
}