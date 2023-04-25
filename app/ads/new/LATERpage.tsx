import Link from 'next/link'
import ADSForm from '../../../components/ADSForm'



export default function NewADS() {


    return (
        <>
        <p><Link href={`/`}>&larr; retour</Link></p>
        <h1>Nouvelles ADS</h1>
        <h2>Detail</h2>
        <ADSForm />
        </>
    )
}