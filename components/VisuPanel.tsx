'use client'

// Hooks
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'

// Styles
import { fr } from "@codegouvfr/react-dsfr";
import styles from '@/styles/mapPanel.module.scss'

// UI Tools
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { addDash } from '@/utils/identifier';

// Store
import { useDispatch, useSelector } from "react-redux";
import { bdgApiUrl, closePanel, openPanel } from '@/stores/map/slice';

// Analytics
import va from "@vercel/analytics"

// Comps
import ContributionForm from '@/components/ContributionForm';


export default function VisuPanel() {

    // Store
    const bdg = useSelector((state) => state.panelBdg)
    const isOpen = useSelector((state) => state.panelIsOpen)
    const dispatch = useDispatch()


    // URL params
    const params = useSearchParams()

    const [copied, setCopied] = useState(false);

    const getStatusLabel = (status: string) => {

        const labels = {
            'constructionProject': 'En projet',
            'canceledConstructionProject': 'Projet annulé',
            'ongoingConstruction': 'Construction en cours',
            'constructed': 'Construit',
            'ongoingChange': 'En cours de modification',
            'notUsable': 'Non utilisable',
            'demolished': 'Démoli',
        }

        const label = labels[status]

        return label

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
        
        
        const bdgStatus = bdg?.status

        if (bdgStatus === undefined) return "Inconnu"
        if (bdgStatus === null) return "Inconnu"

        // Bdg status is a string, we are on the new format
        if (typeof bdgStatus === "string") return getStatusLabel(bdgStatus)

        // Bdg status is an array, we are on the old format
        if (Array.isArray(bdgStatus)) {
            const currentStatus = bdg?.status?.find(s => s.is_current)
            return currentStatus.label    
        }


    }

    const easyRnbId = () => {
        return addDash(bdg?.rnb_id)
    }

    
    const close = () => {
        dispatch(closePanel())
    }

    useEffect(() => {

        if (bdg?.rnb_id !== undefined) {
            va.track("open-side-panel", {rnb_id: bdg.rnb_id})
        }

    }, [bdg?.rnb_id])


    if (isOpen) {
        return (
            <>
            <div className={styles.shell}>
                <div className={styles.section}>

                <a href="#" onClick={close} className={styles.closeLink}><i className='fr-icon-close-line' /></a>
                
                    
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

                            {bdg?.addresses?.length === 0 ? (
                                
                                <div><em>Aucune adresse liée</em></div>
                            

                            ) : (
                                bdg?.addresses?.map(a => (
                                    <div key={a.id} className={styles.sectionListItem}>
                                        {a.street_number}{a.street_rep} {a.street_type} {a.street_name}<br />
                                        {a.city_zipcode} {a.city_name}<br />
                                        <small>(Idenfitiant BAN : {a.id})</small>
                                    </div>
                                ))
                            )}


                            

                        
                        </div>
                </div>
                
          

                

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Améliorez le RNB</h2>
                    
                    <ContributionForm />
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Correspondances</h2>
                    <div className={styles.sectionBody}>

                            {bdg?.ext_ids?.length === 0 ? (
                                
                                <div><em>Aucun lien avec une autre base de donnée.</em></div>
                            

                            ) : (
                                bdg?.ext_ids?.map(ext_id => (
                                    <div key={ext_id.id} className={styles.sectionListItem}>
                                        <span>Base de données : {ext_id.source}</span><br />
                                        <span>Identifiant : {ext_id.id}</span>

                                    </div>
                                    
                                ))
                            )}


                            

                        
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