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
    setAddressSearchUnknownRNBId,
    setMarker,
    fetchBdg,
    openPanel,
    closePanel
} from '@/stores/map/slice';

import AddressAutocomplete from '@/components/AddressAutocomplete'

export default function AddressSearch() {
    const unknown_rnb_id = useSelector((state) => state.addressSearch.unknown_rnb_id)

    // URL params
    const params = useSearchParams()
    const [query, setQuery] = useState(params.get('q') || '')
    const [keyDown, setKeyDown] = useState(null)

    // // contains the address suggestions given by the BAN API
    // const [addressSuggestions, setAddressSuggestions] = useState([])
    // // used to highlight and choose an address suggestion
    // const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
    // // when a suggestion is chosen, this is set to true to prevent an extra call the the API
    // const [suggestionChosen, setSuggestionChosen] = useState(false)

    // State
    const moveTo = useSelector((state) => state.moveTo)
    const dispatch = useDispatch()

    const apiUrl = 'https://api-adresse.data.gouv.fr/search/'
    const addressInput = useRef(null)

    const handleKeyDown = (e) => {
        dispatch(setAddressSearchUnknownRNBId(false))
        if (e.key === 'Enter' && queryIsRnbId()) {
            // special case, if the query is a RNB ID we bypass the address search
            dispatch(closePanel())
            handleBdgQuery()
        } else {
            setKeyDown(e)
        }
    }

    const queryIsRnbId = () => {
        return query.match(/^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/)
    }

    // used when loading the page with a rnb id in the URL
    const search = async () => {
        if (queryIsRnbId()) {
            dispatch(closePanel())
            handleBdgQuery()
        } 
        // else {
        //     handleAddressQuery().then((results) => {
        //         if (results.length > 0) {
        //             select_suggestion(results[0])
        //         }
        //     })
        // }
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

    useEffect(() => {
        if (params.get('q') !== null) {
            search()
        }
    }, [])

    const select_suggestion = (suggestion) => {
        // setAddressSuggestions([])
        const position = featureToPosition(suggestion)
        // Add a marker to the map
        dispatch(setMarker({
            lat: position.lat,
            lng: position.lng
        }))
        // Move the map to the position
        dispatch(setMoveTo(position))
        // setSuggestionChosen(true)
        setQuery(suggestion.properties.label)
        Bus.emit('address:search', {
            search: suggestion.label
        })
    }

    const handleSuggestionSelected = ({ suggestion }) => {
        if (suggestion !== null) {
            select_suggestion(suggestion)
        }
    }

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

                <AddressAutocomplete query={query} keyDown={keyDown} onSuggestionSelected={handleSuggestionSelected} ></AddressAutocomplete>
            </div>
        </>
    )

}