'use client'

// Styles
import styles from '@/styles/mapPage.module.scss'

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
    

    // //////////////////////
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


    // //////////////////////
    // Track RNB ID searched in the search bar
    const trackRNBIDSearch = (infos) => {
        va.track("rnbid-search-public-map", {
            rnb_id: infos.rnb_id
        })
    }

    useEffect(() => {
            
        Bus.on('rnbid:search', trackRNBIDSearch)
        return () => {
            Bus.off('rnbid:search', trackRNBIDSearch)
        }
    });

    return (
        <>
                <Providers>


                <div className={styles.map}>
                    <AddressSearch />
                    <VisuPanel />
                    
                    
                    <div className={styles.map__mapShell}>
                        <VisuMap />
                    </div>
                    
                </div>

           
            </Providers>
            
        </>
    )
}