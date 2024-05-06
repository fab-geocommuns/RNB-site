'use client'

// Hooks
import { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import {
    setAddressSearchQuery,
    setAddressSearchResults,
} from '@/stores/map/slice';

import styles from '@/styles/addressAutocomplete.module.scss'

export default function AddressAutocomplete({ autocompleteActive, query, keyDown, onSuggestionSelected, override_class = '' }) {
    // contains the address suggestions given by the BAN API
    const [addressSuggestions, setAddressSuggestions] = useState([])
    // used to highlight and choose an address suggestion
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1)

    const [typeTimeout, setTypeTimeout] = useState(null)


    // when a suggestion is chosen, this is set to true to prevent an extra call the the API
    const [suggestionChosen, setSuggestionChosen] = useState(false)
    const dispatch = useDispatch()
    const apiUrl = 'https://api-adresse.data.gouv.fr/search/'

    useEffect(() => {
        if (autocompleteActive) {
            const e = keyDown
            if (e !== null) {
                // pick the suggestion with the arrow keys
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
                    // select the suggestion with the enter key
                } else if (e.key === 'Enter') {
                    e.preventDefault()
                    let suggestion = null;
                    if (addressSuggestions.length > 1 && selectedSuggestion >= 0) {
                        suggestion = addressSuggestions[selectedSuggestion]
                        // you don't need to select a suggestion if there is only one
                    } else if (addressSuggestions.length == 1) {
                        suggestion = addressSuggestions[0]
                    }
                    if (suggestion) {
                        setSuggestionChosen(true)
                        setAddressSuggestions([])
                        setSelectedSuggestion(-1)
                    }
                    onSuggestionSelected({ suggestion: suggestion })
                } else {
                    setSuggestionChosen(false)
                }
            }
        }
    }, [keyDown])

    useEffect(() => {
        if (!suggestionChosen && autocompleteActive) {
            setSelectedSuggestion(-1)
            if (query.length < 3) {
                setAddressSuggestions([])
            } else {

                if (typeTimeout) {
                    clearTimeout(typeTimeout)
                }

                setTypeTimeout(setTimeout(() => {
                    handleAddressQuery()
                }, 300))

                
            }
        }
    }, [query])

    const handleAddressQuery = async () => {
        // Add the query to the store
        
        const geocode_result = await fetchBanAPI(query);

        dispatch(setAddressSearchQuery(query))
        dispatch(setAddressSearchResults(geocode_result.features))
        if (geocode_result.features.length > 0) {
            setAddressSuggestions(geocode_result.features)
            setSelectedSuggestion(-1)
        }
        return geocode_result.features
    }

    const fetchBanAPI = async (q) => {
        let query_url = new URL(apiUrl);
        query_url.searchParams.set('q', q);
        query_url.searchParams.set('autocomplete', 1);
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

    const select_suggestion = (suggestion) => {
        onSuggestionSelected({ suggestion: suggestion })
    }

    const suggestions = addressSuggestions.map((s, i) =>
        <div onMouseEnter={() => setSelectedSuggestion(i)} onClick={() => select_suggestion(s)} className={styles.suggestion + ' ' + (selectedSuggestion == i ? styles.selected : '')} key={s.properties.id} >
            {s.properties.label}
        </div >
    );

    return suggestions.length > 0 ? <div className={styles.autocomplete_suggestions + ' ' + override_class}>{suggestions}</div> : null;
}