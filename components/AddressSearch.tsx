'use client'

// Hooks
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'

import styles from '@/styles/mapPage.module.scss'

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from "react-redux";
import {
    setMoveTo,
    setAddressSearchQuery,
    setAddressSearchResults,
    setAddressSearchUnknownRNBId,
    setMarker,
    fetchBdg,
    openPanel,
    closePanel
} from '@/stores/map/slice';

export default function AddressSearch() {
    const unknown_rnb_id = useSelector((state) => state.addressSearch.unknown_rnb_id)

    // URL params
    const params = useSearchParams()
    const [query, setQuery] = useState(params.get('q') || '')

    const [addressSuggestions, setAddressSuggestions] = useState([])
    const [selectedSuggestion, setSelectedSuggestion] = useState(null)

    // State
    const moveTo = useSelector((state) => state.moveTo)
    const dispatch = useDispatch()

    const apiUrl = 'https://api-adresse.data.gouv.fr/search/'
    const addressInput = useRef(null)

    const handleKeyDown = async (e) => {
        dispatch(setAddressSearchUnknownRNBId(false))
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (selectedSuggestion < addressSuggestions.length - 1) {
                setSelectedSuggestion(selectedSuggestion + 1)
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (selectedSuggestion > 0) {
                setSelectedSuggestion(selectedSuggestion - 1)
            }
        } else if (e.key === 'Enter') {
            if (queryIsRnbId()) {
                dispatch(closePanel())
                handleBdgQuery()
            } else if (addressSuggestions.length > 0) {
                select_suggestion(addressSuggestions[selectedSuggestion])
            }
        } else if (query.length > 4) {
            handleAddressQuery()
            setSelectedSuggestion(0)
        } else {
            setAddressSuggestions([])
        }

    }

    const queryIsRnbId = () => {
        return query.match(/^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/)
    }

    const search = async () => {

        if (queryIsRnbId()) {
            dispatch(closePanel())
            handleBdgQuery()
        } else {
            // launch address search, await for response
            handleAddressQuery().then((results) => {
                console.log('then')
                console.log(addressSuggestions.length)
                if (results.length > 0) {
                    select_suggestion(results[0])
                }
            })
        }
    }
    
    const handleBdgQuery = async () => {

        dispatch(fetchBdg(query)).then((res) => {
            if (res.payload !== null) {
                dispatch(openPanel())
                dispatch(setMoveTo({
                    lat: res.payload.point.coordinates[1],
                    lng: res.payload.point.coordinates[0],
                    zoom: 20,
                    fly: false
                }))

                Bus.emit('rnbid:search', {
                    rnb_id: query
                })
            }
            else {
                dispatch(setAddressSearchUnknownRNBId(true))
            }
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
            setAddressSuggestions(geocode_result.features)
        }
        return geocode_result.features

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

    const select_suggestion = (suggestion) => {
        setAddressSuggestions([])
        const position = featureToPosition(suggestion)
        // Add a marker to the map
        dispatch(setMarker({
            lat: position.lat,
            lng: position.lng
        }))
        // Move the map to the position
        dispatch(setMoveTo(position))
        setQuery(suggestion.properties.label)
        Bus.emit('address:search', {
            search: suggestion.label
        })
    }

    const suggestions = addressSuggestions.length > 0 ?
        addressSuggestions.map((s, i) =>
            <div onMouseEnter={() => setSelectedSuggestion(i)} onClick={() => select_suggestion(s)} className={styles.suggestion + ' ' + (selectedSuggestion == i ? styles.selected : '')} key={s.properties.id} >
                {s.properties.label}
            </div >
        ) : null

    return (
        <>
            <div className={`${styles.map__InputShell} ${(unknown_rnb_id ? styles['shake'] : '')}`}>
                <input
                    className={"fr-input " + (unknown_rnb_id ? styles['fr-input--error'] : "")}
                    placeholder='Chercher une adresse, un identifiant RNB'
                    type="text"
                    autoComplete='off'
                    name="address"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    id="address"
                    ref={addressInput}
                    onKeyDown={handleKeyDown}
                />
                {suggestions}
            </div>

        </>
    )

}