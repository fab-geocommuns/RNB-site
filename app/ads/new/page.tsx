import Link from 'next/link'
import ADSForm from '@/components/ADSForm'

export default function NewADS() {

    const data = {
        file_number: "",
        decided_at: "",
        buildings_operations: [] 
    }


    return (
        <>
        <p><Link href={`/ads`}>&larr; retour</Link></p>
        <h1>Nouveau dossier ADS</h1>
        <ADSForm data={data} />
        </>
    )
}