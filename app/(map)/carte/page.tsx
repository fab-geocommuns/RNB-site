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
    const trackAddressSearch = (address) => {
        va.track("address-search-public-map", {
            query: address.label,
            result_insee_code: address.insee_code,
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