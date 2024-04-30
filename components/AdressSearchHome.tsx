
'use client'

import { useState, useRef } from 'react';
import { Providers } from '@/stores/map/provider';

import AddressAutocomplete from '@/components/AddressAutocomplete'

export default function AdressSearchHome() {
    const [query, setQuery] = useState('')
    const [keyDown, setKeyDown] = useState(null)
    const formRef = useRef(null);

    const handleKeyDown = (e) => {
        setKeyDown(e)
    }

    const handleSuggestionSelected = ({ suggestion }) => {
        console.log(formRef)
        if (suggestion !== null) {
            // submit the form with the selected address
            formRef.current.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
            )
        }
    }

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
                    name="q"
                    placeholder="un identifiant RNB : 1GA7PBYM1QDY ou une adresse : 42, rue des architectes, Nantes"
                />

                <button className="fr-btn" type="submit">Rechercher</button>
            </div>
            <AddressAutocomplete query={query} keyDown={keyDown} onSuggestionSelected={handleSuggestionSelected} ></AddressAutocomplete>

        </form>
    </Providers >
}