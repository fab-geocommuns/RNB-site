// Comps
import Head from 'next/head'
import Link from 'next/link'
import ADSList from '@/components/ADSList'
import LoginForm from '@/components/LoginForm'

// Auth
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {

    const session = await getServerSession(authOptions)

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
        <Link className='fr-btn' href={`/ads/new`}>Nouvelle ADS</Link>
        </p>
        <ADSList />        
        </> 
        : 
        <>
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link href={`/login?redirect=/ads`}>Se connecter</Link>
        </>
        }

      
        </>
    )
}