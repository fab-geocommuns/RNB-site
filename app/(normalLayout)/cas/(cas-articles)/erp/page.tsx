import Link from "next/link"


export default function Page() {

    
    return (
        <>
            
                    <h1 className="text-blue">Améliorer l&apos;identification des Etablissements Recevant du Public (ERP)</h1>
                    <h2>Le problème</h2>
                    <p>Les pompiers des SDIS ont pour mission de maintenir à jour le référencement des ERP (Établissements Recevant du Public) et des ETARE (Établissements Jugés Sensibles).</p>
                    <p>Les informations délivrées par les SDIS doivent passer par le logiciel de gestion des ERP, pour alimenter le fichier départemental des ERP et ces informations sont ensuite remontées au service SIG du SDIS.</p>
                    <p><span className="stab stab--blue">En pratique, ces ERP ne sont désignés que par une adresse et rarement géolocalisés.</span> Par ailleurs, ce processus varie d’un département à l’autre et l’on constate que ces données sont difficiles à échanger, voire sont parfois perdues.</p>

                    <h2>L&apos;intérêt du RNB</h2>
                    <p>La saisie d’un ID bâtiment lors du processus de référencement des ERP doit permettre de préciser leur géolocalisation, de faciliter et fiabiliser le processus de recensement et, de manière globale, d’aider les SDIS à assurer leur mission de suivi des ERP.</p>
                    <p>Par ailleurs, en 2023, chaque SDIS tient à jour sa propre base de données des bâtiments &quot;sensibles&quot; qui est utile à leurs interventions, sans agrégation ou règles de normalisation à l&apos;échelle nationale. Cela rend les échanges d&apos;information entre SDIS (ou avec d&apos;autres acteurs) complexes car la seule donnée pivot est le champ texte de l&apos;adresse. L&apos;usage du RNB et de l&apos;identifiant unique des bâtiments permet donc une approche normalisée pour faciliter l&apos;échange d&apos;informations.</p>

                    <h2>L&apos;impact</h2>
                    <p>Au delà de l&apos;impact sur les missions des SDIS, le RNB permettra notamment de faciliter les échanges avec la Direction Départementale des Territoires (DDT) en charge d’établir le Plan de prévention des risques (inondation, incendies, accès à l’eau).</p>
                    <p>Ce besoin a été souligné pendant la période du risque épidémique via la gestion des autorisations d’ouverture au public, pour les bâtiments ayant une surface importante (supérieure à 20 000 m2 dans le cas du COVID).</p>
                  
        </>
    )
}