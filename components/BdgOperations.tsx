'use client'

import { useState } from 'react';
import ADSMap from './ADSMap';
import styles from './BdgOperations.module.css'

export default function BdgOperations({ads = {} }) {

    const [formData, setFormData] = useState(ads);

    return (
        <>
            <div className={styles.grid}>
            <div>
                <ADSMap />
            </div>
            <div>
            <div>Liste des opérations</div>
                <ul>
                    {ads?.buildings_operations?.map((bdgop) => (
                        <li key={bdgop.building.rnb_id}>{bdgop.building.rnb_id} - {bdgop.operation}</li>
                    ))}
                </ul>
            </div>
            
            </div>
            

        </>
    )

}