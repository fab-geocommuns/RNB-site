// Styles
import styles from '@/styles/stats.module.scss'

// Settings
import settings from '@/logic/settings'

export default function Page() {

    const contactEmail = settings.contactEmail;


    return (
        <div class={"fr-container fr-mt-3w fr-mb-6w " + styles.stats}>
            <h1 class="fr-m-2w">Statistiques</h1>
            <div class="fr-grid-row fr-grid-row--center fr-grid-row--middle ">
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-3w"}>
                    <h1 class="">48 000 000</h1>
                    BÂTIMENTS RÉFÉRENCÉS
                    <p class='fr-pt-3w'>
                        <a href="/carte" class="fr-link">Voir la carte</a>
                    </p>
                </div>
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-3w"}>
                    <h1 class="">150 000</h1>
                    APPELS À L'API EN 2024
                    <p class='fr-pt-3w'>
                        <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments" class="fr-link">Voir la doc</a>
                    </p>
                </div>
            </div>
            <div class="fr-grid-row fr-grid-row--center fr-grid-row--middle ">
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-3w"}>
                    <h1>1</h1>
                    JEUX DE DONNÉES REPUBLIÉS SUR DATA.GOUV.FR
                    <p class='fr-pt-3w'>
                        <a href="https://www.data.gouv.fr/fr/datasets/?tag=rnb" class="fr-link">Les parcourir</a>
                    </p>
                </div>
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-3w"}>
                    <h1>90</h1>
                    SIGNALEMENTS REÇUS
                    <p class='fr-pt-3w'>
                        <a href="/carte" class="fr-link">Faire un signalement</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
