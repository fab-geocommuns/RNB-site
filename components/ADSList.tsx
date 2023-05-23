'use client'

// Hooks
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Comps
import Link from 'next/link'
import ADSSearch from '@/components/ADSSearch'

// Styles
import styles from '@/components/ADSList.module.css'

async function fetchADSList(query: string | null ) {

  
    let url = process.env.NEXT_PUBLIC_API_BASE + '/ads'
    if (query != null) {
      url = url + '?q=' + query
    }
    const res = await fetch(url, {cache: 'no-cache'})
    const data = await res.json()
    return data
    
  }

export default function ADSList() {

    
    const params = useSearchParams()
    
    
    const [adsList, setAdsList] = useState([])
    
    
    useEffect(() => {
    
        fetchADSList(params.get('q') ).then((data) => {
            setAdsList(data['results'])
        })

    }, [params.get('q')])

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
              <th>Code INSEE</th>
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
                  {ads.decision_date}
                </td>
                <td>
                  {ads.insee_code}
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