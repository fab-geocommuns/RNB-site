
// React
import React, { use, useContext, useState, useEffect } from 'react';

// Styles
import { fr } from "@codegouvfr/react-dsfr";
import styles from './VisuPanel.module.css'

// UI Tools
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { addDash } from '@/utils/identifier';

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from "react-redux";
import { bdgApiUrl } from '@/stores/map/slice';

// Analytics
import va from "@vercel/analytics"


export default function VisuPanel() {

    // Store
    const bdg = useSelector((state) => state.panelBdg)

    
    

    
    const [copied, setCopied] = useState(false);

    const hasBdg = () => {
        return bdg?.rnb_id !== undefined
    }

    const handleCopy = () => {
        va.track("rnbid-copied", {rnb_id: bdg.rnb_id})
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const apiUrl = () => {
        return bdgApiUrl(bdg?.rnb_id)
    }


  

    const statusLabel = () => {
        
        const currentStatus = bdg?.status?.find(s => s.is_current)

        if (currentStatus === undefined) return "Inconnu"

        return currentStatus.label

    }

    const easyRnbId = () => {
        return addDash(bdg?.rnb_id)
    }

    const banAddresses = () => {

        return bdg?.addresses?.filter(a => a.source === "BAN")
    }

    if (hasBdg()) {
        return (
            <>
            <div>
                <hr />
                <div className={styles.section}>
                    
                <h2 className={styles.sectionTitle}>Identifiant RNB</h2>

                <div className={styles.rnbidShell}>
                    <div className={styles.rnbidShell__id}>{easyRnbId()}</div>

                    
                    <CopyToClipboard 
                        onCopy={() => handleCopy()}
                        text={easyRnbId()}>

                    <div className={styles.rnbidShell__copy}>
                        {copied ? <span>Copié <i className={fr.cx("fr-icon-success-line")}></i></span> : <span>Copier <i className={fr.cx("fr-icon-clipboard-line")}></i></span>}
                        
                        </div>
                    
                    </CopyToClipboard>

                    


                </div>
                </div>

                <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Statut du bâtiment</h2>
                        <div className={styles.sectionBody}>
                        {statusLabel()}
                        </div>
                </div>
                <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Adresses</h2>
                        <div className={styles.sectionBody}>

                            {banAddresses()?.length === 0 ? (
                                
                                <div><em>Aucune adresse liée</em></div>
                            

                            ) : (
                                banAddresses()?.map(a => (
                                    <div key={a.id} className={styles.address}>
                                        {a.street_number}{a.street_rep} {a.street_type} {a.street_name}<br />
                                        {a.city_zipcode} {a.city_name}<br />
                                        <small>(Idenfitiant BAN : {a.id})</small>
                                    </div>
                                ))
                            )}


                            

                        
                        </div>
                </div>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Identifiant BD Topo</h2>
                    <div className={styles.sectionBody}>
                        {bdg?.ext_bdtopo_id?.length === 0 ? (<em>Aucun identifiant lié</em>) : bdg?.ext_bdtopo_id}
                    
                    </div>
                </div>

                <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Lien API</h2>
                    <div className={styles.sectionBody}>
                        <a href={apiUrl()} target="_blank">Format JSON</a>
                    </div>
                </div>


                
                
            </div>
            </>
        )
    } else {
        return (<>
        
        </>)
    }

    

}