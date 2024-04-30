
'use client'

import { useState, useRef, use, useEffect } from 'react';
import { Providers } from '@/stores/map/provider';

import AddressAutocomplete from '@/components/AddressAutocomplete'
import { set } from 'yaml/dist/schema/yaml-1.1/set';

export default function AdressSearchHome() {
    const [query, setQuery] = useState('')
    const [keyDown, setKeyDown] = useState(null)
    const [submitForm, setSubmitForm] = useState(false)
    const formRef = useRef(null);

    const handleKeyDown = (e) => {
        setKeyDown(e)
    }

    const handleSuggestionSelected = ({ suggestion }) => {
        if (suggestion !== null) {
            console.log(suggestion)
            setQuery(`${suggestion.geometry.coordinates[1]},${suggestion.geometry.coordinates[0]}`)
        }
        setSubmitForm(true)
    }

    useEffect(() => {
        if (submitForm) {
            formRef.current.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
            )
        }
    }, [submitForm])

    return <Providers>
        <form
            action="/carte"
            method="get"
            ref={formRef}
        >
            <div className="fr-search-bar">
                <input
                    className='fr-input'
                    type="text"
                    autoComplete='off'
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={query}
                    name="q"
                    placeholder="un identifiant RNB : 1GA7PBYM1QDY ou une adresse : 42, rue des architectes, Nantes"
                />

                <button className="fr-btn" type="submit">Rechercher</button>
            </div>
            <AddressAutocomplete query={query} keyDown={keyDown} onSuggestionSelected={handleSuggestionSelected} ></AddressAutocomplete>

        </form>
    </Providers >
}