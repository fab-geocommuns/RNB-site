
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

// Analytics
import va from "@vercel/analytics"

export default function VisuPanel() {

    const [bdg, setBdg] = useState(null)

    
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
    

    useEffect(() => {
        Bus.on("map:bdgclick", setBdg)

        return () => {
            Bus.off("map:bdgclick", setBdg)
        }

    }, [])

    const statusLabel = () => {
        
        const currentStatus = bdg?.status?.find(s => s.is_current)

        if (currentStatus === undefined) return "Inconnu"

        return currentStatus.label

    }

    const easyRnbId = () => {
        return addDash(bdg.rnb_id)
    }

    if (hasBdg()) {
        return (
            <>
            <div>
                <div className={styles.title}>Identifiant RNB</div>

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

                <div className='fr-mt-8v'>
                        Statut du bâtiment : {statusLabel()}
                    </div>

                
                
            </div>
            </>
        )
    } else {
        return (<></>)
    }

    

}