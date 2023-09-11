import { Highlight } from "@codegouvfr/react-dsfr/Highlight";


export default function Page() {

    
    return (
        <>
            
                    <h1 className="text-blue">Faciliter les échanges d&apos;informations bâtimentaires au sein des communes</h1>
                    <h2>Le problème</h2>
                    <p>Il existe aujourd’hui une grande disparité d’information sur le parc bâti selon la taille et les moyens des communes françaises. Même pour les plus grosses métropoles disposant de compétences SIG et numérique, <span className="stab stab--blue">il est difficile d’avoir une vision suffisamment précise et à jour de leur parc de bâtiments.</span></p>
<p>Cela génère d&apos;importants manques à gagner pour les communes dont les ressources sont pourtant déjà limitées :</p>
<ul>
<li>La mauvaise connaissance de nouvelles constructions peut complexifier le recensement de la population. Or il s’agit d’une variable clé pour définir la dotation versée par l’Etat.</li>
<li>Les communes ont une mauvaise connaissance de leur propre patrimoine bâti (public) et ont du mal à l’entretenir, ou encore payent des abonnements d’électricité sur des bâtiments qui ne leur appartiennent plus.</li>
<li>Les différents services ne partagent pas de vision commune du parc de bâti et utilisent chacun leur propre source de données complexifiant ainsi les interactions entre les services.</li>
</ul>

<h2>L&apos;intérêt du RNB</h2>

<Highlight>
&quot;Les gains en efficacité des procédures et les facilités qui en découlent laissent entrevoir un ROI global qui peut être estimé à plusieurs ETP au travers de toutes les directions&quot; <br /><b>Toulouse Métropole - Direction du Numérique</b>
</Highlight>

<p>La <a href="/definition">définition commune de l’objet “bâti”</a> ainsi que l’existence d’un référentiel national des bâtiments partagé par tous doit permettre à toutes les communes d’assurer la cohérence du système d’information et la transversalité des données de la collectivité entre les différents services (finance, urbanisme, habitat, patrimoine, environnement, etc.).</p>
<p>A terme, cela doit même permettre à la commune de plus facilement échanger des informations avec les acteurs extérieurs et ainsi mieux cibler le recours à des bureaux d’études pour les assister dans leurs projets et missions.</p>
<p>C’est pourquoi nous travaillons actuellement avec plusieurs communes partenaires afin de les accompagner dans leurs usages du RNB et évaluer les gains de temps et de ressources réalisés.</p>

<h2>L&apos;impact</h2>
<ul>
    <li>Pour les services de l&apos;urbanisme, il est essentiel de dialoguer avec le SIG afin de partager un référentiel commun et faire circuler les informations liées au Plan Local d&apos;Urbanisme Intercommunal ou l&apos;instruction des demandes d&apos;autorisation et suivi des permis.</li>
<li>Pour la direction de l&apos;environnement, la maille bâtiment permet de mieux évaluer les contraintes liées aux projets de rénovation énergétique des bâtiments, cadastre solaire, îlots de chaleur, raccordement aux eaux usées, ce que ne permet pas toujours la maille adresse ou cadastrale utilisée aujourd’hui.</li>
<li>Pour les services de maintenance, le RNB permet d’affecter correctement les agents et de préciser les lieux d’intervention et ce quelque soit le domaine d’intervention (maintenance informatique, entretien des chaudières, système électrique, etc….)</li>
</ul>

                  
        </>
    )
}