
"use client";

import ADSSearch from '@/components/ADSSearch'
import Head from 'next/head'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

async function fetchADSList(query: string | null) {


  let url = process.env.NEXT_PUBLIC_API_BASE + '/ads'
  if (query) {
    url = url + '?q=' + query
  }
  const res = await fetch(url, {cache: 'no-cache'})
  const data = await res.json()
  return data
  
}

export default async function Home() {

  const params = useSearchParams()
  const query = params.get('q') || null

  const response = await fetchADSList(query)

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


        


        <ADSSearch />
        
        
        <table className='fr-table'>
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Date d&apos;émission</th>
              <th>Ville</th>
              <th># bâtiments</th>
            </tr>

          </thead>

          <tbody>
          {response?.results?.map((ads: any) => (
            
              <tr key={ads.issue_number}>
                <td>
                  <Link href={`/ads/${ads.issue_number}`}>{ads.issue_number}</Link>
                </td>
                <td>
                  {ads.issue_date}
                </td>
                <td>
                  {ads.code_insee}
                </td>
                <td>todo</td>
                
              </tr>
              
          ))}
          </tbody>

        </table>

        
        
            
        

        </>
    )
}