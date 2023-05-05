import Link from 'next/link'
import ADSForm from '@/components/ADSForm'

export default function NewADS() {

    const data = {
        issue_number: "",
        insee_code: "",
        issue_date: "",
        buildings_operations: [] 
    }

    const isNewAds = true


    return (
        <>
        <p><Link href={`/ads`}>&larr; retour</Link></p>
        <h1>Nouvelles ADS</h1>
        <ADSForm data={data} isNewAds={isNewAds} />
        </>
    )
}