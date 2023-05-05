"use client";

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ADSSearch() {

    const search = useSearchParams()

    const [query, setQuery] = useState(search.get('q') || '')
    const router = useRouter()

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        const encodedQuery = encodeURI(query)
        router.push(`/ads?q=${encodedQuery}`)
    }

    return (
        <>
        <form onSubmit={handleSearch}>
            <input 
                onChange={(e) => setQuery(e.target.value)}
                type="text" 
                value={query}
                className='fr-input' 
                placeholder='Chercher une ADS' />
        </form>
        </>
    )

}