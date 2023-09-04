// Comps
import CasListe from '@/components/CasListe'


export default function Page() {

    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-py-12v">
                    <h1>Cas d&apos;usages</h1>
                    <CasListe />

                    </div>
                </div>
            </div>
        </>
    )
}