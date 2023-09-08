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
                    <h3>Questions générales et service de rapprochement</h3>
                    <p>Pour toutes questions sur le RNB et son fonctionnement ou pour profiter de notre <a href="/outils-services/rapprochement">service de rapprochement</a>, vous pouvez nous écrire à :</p>
                    <p><b className="stab stab--yellow"><a href={`mailto:${contactEmail}`}>{contactEmail}</a></b></p>
                    <h3>Accès aux outils ADS</h3>
                    <p>Pour demander des accès à nos outils ADS, veuillez remplir <a href={formUrl} target='_blank'>ce formulaire</a>.</p>
                    <h3>Un bug, une erreur dans la référentiel</h3>
                    <p>Vous pouvez nous écrire par email (<a href={`mailto:${contactEmail}`}>{contactEmail}</a>) ou également <a href="https://github.com/fab-geocommuns/RNB-coeur/issues" target='_blank'>ouvrir un ticket</a> sur le Github du RNB.</p>
                    </div>
                </div>
            </div>
        </>
    )
}