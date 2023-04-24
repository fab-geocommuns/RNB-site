import React, { useRef, useEffect, useContext } from 'react';
import {MapContext} from '@/components/MapContext'
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default function VisuPanel() {

    const [mapCtx, setMapCtx] = useContext(MapContext)

    const hasBdg = () => {
        return mapCtx.data.panel_bdg?.rnb_id !== undefined
    }

    if (hasBdg()) {
        return (
            <>
            <p>
                <b>{mapCtx.data.panel_bdg.rnb_id}</b>
                <CopyToClipboard text={mapCtx.data.panel_bdg.rnb_id}>
                    <button className="fr-btn fr-btn--secondary fr-btn--sm fr-fi-copy-line fr-btn--icon-left">Copier</button>
                </CopyToClipboard>
            </p>
            </>
        )
    } else {
        return (<></>)
    }

    

}