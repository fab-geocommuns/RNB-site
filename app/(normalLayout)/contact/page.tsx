// Settings
import settings from '@/logic/settings'

export default function Contact() {

    const formUrl = settings.adsFormUrl;
    const contactEmail = settings.contactEmail;

    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-col-md-8 fr-py-12v">
                    <h1>Contact</h1>
                    <h3>Vous souhaitez :</h3>
                    <ul>
                        <li>En savoir plus sur le RNB et son fonctionnement</li>
                        <li>Profiter de notre <a href="/outils-services/rapprochement">service de rapprochement</a></li>
                        <li>Demander des accès à <a href="/outils-services/autorisation-droit-sols">nos outils ADS</a></li>
                    </ul>
                    
                    <p>Vous pouvez nous écrire à : <b className="stab stab--yellow"><a href={`mailto:${contactEmail}`}>{contactEmail}</a></b></p>
                    
                    
                    <h3>Un bug, une erreur dans la référentiel</h3>
                    <p>Vous pouvez nous écrire par email (<a href={`mailto:${contactEmail}`}>{contactEmail}</a>) ou, faire un signalement directement sur <a href="/carte">la carte du RNB</a> et également <a href="https://github.com/fab-geocommuns/RNB-coeur/issues" target='_blank'>ouvrir un ticket</a> sur le Github du RNB.</p>
                    </div>
                </div>
            </div>
        </>
    )
}