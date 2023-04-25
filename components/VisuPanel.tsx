import React, { useRef, useEffect, useContext, useState } from 'react';
import {MapContext} from '@/components/MapContext'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { fr } from "@codegouvfr/react-dsfr";
import styles from './VisuPanel.module.css'


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

    if (hasBdg()) {
        return (
            <>
            <div>
                <h6><b>Identifiant RNB</b></h6>

                <div className={styles.rnbidShell}>
                    <div className={styles.rnbidShell__id}>{mapCtx.data.panel_bdg.rnb_id}</div>

                    
                    <CopyToClipboard 
                        onCopy={() => handleCopy()}
                        text={mapCtx.data.panel_bdg.rnb_id}>

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