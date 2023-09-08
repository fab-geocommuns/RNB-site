// Comps
import Head from 'next/head'
import Link from 'next/link'
import ADSList from '@/components/ADSList'
import { Notice } from '@codegouvfr/react-dsfr/Notice'
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup'


// Auth
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function Home() {

    const session = await getServerSession(authOptions)

    if (!session) {
      redirect("/outils-services/autorisation-droit-sols", "replace")
    }
    

    return (
        <>
          <Head>
          <title>RNB - ADS</title>
          <meta name="description" content="Liste des ADS" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <h1>Autorisation de droit des sols</h1>

        {session ? <>
          <p>
        <Link className='fr-btn' href={`/ads/new`}>Nouveau dossier ADS</Link>
        </p>
        <ADSList />        
        </> 
        : 
        <>

          
            <div className='fr-grid-row'>
              <div className='fr-col-12 fr-col-md-8'>

              <Notice title="Accès réservé aux communes" />

<ul className="fr-my-8v">
  <li>Mettez vos ADS à disposition de tous vos services</li>
  <li>Soyez prévenus par la DGFIP des fins de travaux</li>
  <li>Partagez un référentiel commun de tous les bâtiments de votre commune</li>
  <li>Outil en ligne et/ou API disponibles</li>
  <li>Gratuit et réservé aux communes</li>
</ul>
<div>

<ButtonsGroup
  inlineLayoutWhen="md and up"
  buttons={[
    {
      children: 'Obtenir des identifiants',
      linkProps: {
        href: 'https://framaforms.org/demande-didentifiants-pour-avoir-acces-aux-ads-1684847508'
      }
    },
    {
      children: 'Se connecter',
      priority: 'secondary',
      linkProps: {
        href: '/login?redirect=/ads'
      }
    }
  ]}
/>
</div>

  


              </div>
          
                 
          
          </div>

        
        </>
        }

      
        </>
    )
}