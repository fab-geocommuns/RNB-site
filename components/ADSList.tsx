'use client'

// Hooks
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Comps
import Link from 'next/link'
import ADSSearch from '@/components/ADSSearch'

// Styles
import styles from '@/components/ADSList.module.css'

// Auth
import { useSession } from 'next-auth/react'

async function fetchADSList(query: string | null, token: string | null ) {
  

    let url = process.env.NEXT_PUBLIC_API_BASE + '/ads'
    if (query != null) {
      url = url + '?q=' + query
    }
    const res = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + token,
      },
    })
    const data = await res.json()
    return data
    
  }

export default function ADSList() {

    // Session
    const { data: session, status } = useSession()
    
    // Search query
    const params = useSearchParams()

    // ADS List
    const [adsList, setAdsList] = useState([])
    
    
    useEffect(() => {
    
        if (status == 'authenticated') {

          fetchADSList(params.get('q'), session?.accessToken ).then((data) => {

            setAdsList(data['results'])
        })

        }

        

    }, [params.get('q'), status])

    return (
        <>
        <div className={styles.listShell}>
            <div className={styles.searchShell}>
            <ADSSearch />
            </div>
        
        <table className='fr-table'>
          <thead>
            <tr>
              <th>N° de dossier</th>
              <th>Date de décision</th>
              <th>Ville</th>
              <th># bâtiments</th>
            </tr>

          </thead>

          <tbody>
          {adsList.map((ads: any) => (
            
              <tr key={ads.file_number}>
                <td>
                  <Link href={`/ads/${ads.file_number}`}>{ads.file_number}</Link>
                </td>
                <td>
                  {ads.decided_at}
                </td>
                <td>
                  {ads.city.name}
                </td>
                <td className=''>{ads.buildings_operations.length}</td>
                
              </tr>
              
          ))}
          </tbody>

        </table>
        </div>
        </>
    )

}