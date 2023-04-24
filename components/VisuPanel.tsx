import React, { useRef, useEffect, useContext } from 'react';
import {MapContext} from '@/components/MapContext'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { fr } from "@codegouvfr/react-dsfr";
import styles from './VisuPanel.module.css'


export default function VisuPanel() {

    const [mapCtx, setMapCtx] = useContext(MapContext)

    const hasBdg = () => {
        return mapCtx.data.panel_bdg?.rnb_id !== undefined
    }

    if (hasBdg()) {
        return (
            <>
            <div>
                <h6><b>Identifiant RNB</b></h6>

                <div className={styles.rnbidShell}>
                <div className={styles.rnbidShell__id}>{mapCtx.data.panel_bdg.rnb_id}</div>
                <div>
                <CopyToClipboard text={mapCtx.data.panel_bdg.rnb_id}>
                    <span>Copier l'identifiant <span className={fr.cx("fr-icon-clipboard-line")}></span></span>
                </CopyToClipboard>
                </div>
                </div>
                
            </div>
            </>
        )
    } else {
        return (<></>)
    }

    

}