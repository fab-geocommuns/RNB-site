// Components
import Link from 'next/link'
import ADSForm from '@/components/ADSForm'

// Store
import { Providers } from '@/stores/map/provider';

export default function NewADS() {

    const data = {
        file_number: "",
        decided_at: "",
        buildings_operations: [] 
    }


    return (
        <>
        <Providers>
        <p><Link href={`/ads`}>&larr; retour</Link></p>
        <h1>Nouveau dossier ADS</h1>
        <ADSForm data={data} />
        </Providers>
        </>
    )
}