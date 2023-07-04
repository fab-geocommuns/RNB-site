'use client'
import { useEffect, useState } from 'react';
import VisuMap from '@/components/VisuMap'
import VisuPanel from '@/components/VisuPanel'
import AddressSearch from '@/components/AddressSearch'
import { MapContext } from '@/components/MapContext';
import styles from './RNBMap.module.css'
import BuildingsMap from '@/logic/map';

// Analytics
import va from "@vercel/analytics"

// Bus
import Bus from "@/utils/Bus"

export default function RNBMap() {

    let bdgmap = new BuildingsMap({
        position: {
            center: null,
            zoom: null
        }
    })

    const [mapCtx, setMapCtx] = useState(bdgmap)

    const trackAddressSearch = (results) => {


        let insee_code = results.search.features?.[0]?.properties?.citycode
        
        va.track("address-search-public-map", {
            query: results.search.query,
            result_insee_code: insee_code
        })



    }

    useEffect(() => {
        
        Bus.on('address:search', trackAddressSearch)

        return () => {
            Bus.off('address:search', trackAddressSearch)
        }
        

    }, []);


    return (
        <>
            <MapContext.Provider value={[mapCtx, setMapCtx]}>
            <div className={styles.geodisplay}>    
                <div className={styles.geodisplay__panel}>

                    <div className={'fr-mt-2v'}>
                        <div>
                            <label className="fr-label">Rechercher une adresse</label>
                            </div>
                        <AddressSearch />
                    </div>
                    <div className={'fr-mt-8v'}>
                        <VisuPanel />
                    </div>
                    </div>    
                <div className={styles.geodisplay__map}><VisuMap /></div>
            </div>
            </MapContext.Provider>
        </>
    )
}