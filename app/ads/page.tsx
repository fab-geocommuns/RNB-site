
import Head from 'next/head'
import Link from 'next/link'

async function fetchADSList() {
  const url = process.env.NEXT_PUBLIC_API_BASE + '/ads'
  const res = await fetch(url, {cache: 'no-cache'})
  const data = await res.json()
  return data
  
}

export default async function Home() {

  const response = await fetchADSList()

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
        <Link href={`/new`}>Nouvelle ADS</Link>
        </p>

        <h2>Listing</h2>
        
        <ul>
          {response?.results?.map((ads: any) => (
              <li key={ads.issue_number}>
                <Link href={`/${ads.issue_number}`}>{ads.issue_number}</Link>
              </li>
          ))}
            
        </ul>

        </>
    )
}