'use client'

import { useState } from 'react';
import ADSMap from './ADSMap';
import styles from './BdgOperations.module.css'

export default function BdgOperations({initialBdgOps = [] }) {

    const [bdgsOps, setOperations] = useState(initialBdgOps);

    return (
        <>
            <div className={styles.grid}>
            <div>
                <ADSMap bdgsOps={bdgsOps} />
            </div>
            <div>
            <div>Liste des opérations</div>
                <ul>
                    {bdgsOps?.map((bdgop) => (
                        <li key={bdgop.building.rnb_id}>{bdgop.building.rnb_id} - {bdgop.operation}</li>
                    ))}
                </ul>
            </div>
            
            </div>
            

        </>
    )

}