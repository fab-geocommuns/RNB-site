import Head from 'next/head'
import Link from 'next/link'
import ADSList from '@/components/ADSList'


export default function Home() {

    return (
        <>
          <Head>
          <title>RNB - ADS</title>
          <meta name="description" content="Liste des ADS" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <h1>Autorisation de droit des sols</h1>

        <p>
        <Link className='fr-btn' href={`/ads/new`}>Nouvelle ADS</Link>
        </p>

        <ADSList />        

        </>
    )
}