'use client';

// Styles
import styles from '@/styles/stats.module.scss'

// Settings
import settings from '@/logic/settings'
import { useState } from 'react';

export default function Page() {
    // initialize the stats
    const [stats, setStats] = useState({ "building_counts": null, "api_calls_since_2024_count": null, "contributions_count": null, "data_gouv_publication_count": null });
    const [loading, setLoading] = useState(true);

    const contactEmail = settings.contactEmail;
    // make a request to the API to get the stats
    fetch('https://rnb-api.beta.gouv.fr/api/alpha/stats')
        .then(response => response.json())
        .then(stats => {
            setStats(stats);
            setLoading(false);
        });



    function stat_card(key) {
        let card;
        if (loading) {
            card = <h1> ... </h1 >
        } else {
            if (stats[key] == null) {
                card = <h1>?</h1>
            } else {
                card = <h1> {stats[key].toLocaleString('fr-FR')} </h1>
            }
        }
        return card
    }

    let building_counts = stat_card("building_counts");
    let api_calls_since_2024_count = stat_card("api_calls_since_2024_count");
    let contributions_count = stat_card("contributions_count");
    let data_gouv_publication_count = stat_card("data_gouv_publication_count");

    return (
        <div class={"fr-container fr-mt-3w fr-mb-6w " + styles.stats}>
            <h1 class="fr-m-2w">Statistiques</h1>
            <div class="fr-grid-row fr-grid-row--center fr-grid-row--middle ">
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-4v"}>
                    {building_counts}
                    BÂTIMENTS RÉFÉRENCÉS
                    <p class='fr-pt-3w'>
                        <a href="/carte" class="fr-link">Voir la carte</a>
                    </p>
                </div>
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-4v"}>
                    {api_calls_since_2024_count}
                    APPELS À L&apos;API EN 2024
                    <p class='fr-pt-3w'>
                        <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments" class="fr-link">Voir la doc</a>
                    </p>
                </div>
            </div>
            <div class="fr-grid-row fr-grid-row--center fr-grid-row--middle ">
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-4v"}>
                    {data_gouv_publication_count}
                    JEUX DE DONNÉES REPUBLIÉS SUR DATA.GOUV.FR
                    <p class='fr-pt-3w'>
                        <a href="https://www.data.gouv.fr/fr/datasets/?tag=rnb" class="fr-link">Les parcourir</a>
                    </p>
                </div>
                <div class={styles['stat-card'] + " fr-col fr-m-5w fr-p-4v"}>
                    {contributions_count}
                    SIGNALEMENTS REÇUS
                    <p class='fr-pt-3w'>
                        <a href="/carte" class="fr-link">Faire un signalement</a>
                    </p>
                </div>
            </div>
        </div>
    )


}
