'use client'

// Hooks
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from "react-redux";
import { 
    setMoveTo, 
    setAddressSearchQuery, 
    setAddressSearchResults, 
    setMarker,
    fetchBdg 
} from '@/stores/map/slice';

export default function AddressSearch() {

    // URL params
    const params = useSearchParams()
    const [query, setQuery] = useState(params.get('q') || '')

    // State
    const moveTo = useSelector((state) => state.moveTo)
    const dispatch = useDispatch()

    const apiUrl = 'https://api-adresse.data.gouv.fr/search/'
    const addressInput = useRef(null)

    const handleKeyDown = async (e) => { 

        if (e.key === 'Enter') {
            e.preventDefault();
            search()            
        }

    }

    const queryIsRnbId = () => {
        return query.match(/^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/)
    }

    const search = async () => {

        if (queryIsRnbId()) {
            handleBdgQuery()
        } else {
            handleAddressQuery()
        }

    }
    
    const handleBdgQuery = async () => {

        dispatch(fetchBdg(query)).then((res) => {
                
            console.log('result of fetchBdg', res)
        
            dispatch(setMoveTo({
                lat: res.payload.point.coordinates[1],
                lng: res.payload.point.coordinates[0],
                zoom: 20,
                fly: false
            }))


        })

    }

    const featureToPosition = (feature: any) => {

        const mapPosition = {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            zoom: 17
        }

        if (feature.properties.type == "municipality") {
            mapPosition.zoom = 13
          }
          if (feature.properties.type == "housenumber") {
            mapPosition.zoom = 18
          }
          return mapPosition

    }

    const handleAddressQuery = async () => {

        // Add the query to the store
        const geocode_result = await fetchBanAPI(addressInput.current.value);

        dispatch(setAddressSearchQuery(addressInput.current.value))
        dispatch(setAddressSearchResults(geocode_result.features))


        if (geocode_result.features.length > 0) {

            const position = featureToPosition(geocode_result.features[0])

            // Add a marker to the map
            dispatch(setMarker({
                lat: position.lat,
                lng: position.lng
            }))

            // Move the map to the position
            dispatch(setMoveTo(position))

            Bus.emit('address:search', {
                search: geocode_result
            })
        }

    }
    const fetchBanAPI = async (query) => {

        let query_url = new URL(apiUrl);
        query_url.searchParams.set('q', query);

        return new Promise((resolve, reject) => {

            fetch(query_url)
                .then(response => response.json())
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })

    }

    useEffect(() => {

        if (params.get('q') !== null) {

            search()

        }


    }, [])

    

    return (
        <>
        <input 
        className="fr-input" 
        placeholder='ex : 1 rue de la paix, Paris'
        type="text" 
        autoComplete='off'
        name="address" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="address"
        ref={addressInput}
        onKeyDown={handleKeyDown}
         />
        
        </>
    )

}