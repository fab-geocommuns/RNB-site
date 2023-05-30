
// React
import React, { useContext, useState } from 'react';

// Context
import {MapContext} from '@/components/MapContext'

// Styles
import { fr } from "@codegouvfr/react-dsfr";
import styles from './VisuPanel.module.css'

// UI Tools
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { addDash } from '@/utils/identifier';


export default function VisuPanel() {

    const [mapCtx, setMapCtx] = useContext(MapContext)
    const [copied, setCopied] = useState(false);

    const hasBdg = () => {
        return mapCtx.data.panel_bdg?.rnb_id !== undefined
    }

    const handleCopy = () => {
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const easyRnbId = () => {
        return addDash(mapCtx.data.panel_bdg.rnb_id)
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

                
                
            </div>
            </>
        )
    } else {
        return (<></>)
    }

    

}