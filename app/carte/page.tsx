'use client'

// Styles
import styles from './RNBMap.module.css'

// Hooks
import { useEffect } from 'react';

// Components
import VisuMap from '@/components/VisuMap'
import VisuPanel from '@/components/VisuPanel'
import AddressSearch from '@/components/AddressSearch'

// Analytics
import va from "@vercel/analytics"

// Bus
import Bus from "@/utils/Bus"

// Store
import { Providers } from '@/stores/map/provider';




export default function RNBMap() {
    

    // Tracking address search
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
                <Providers>
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
            </Providers>
            
        </>
    )
}