import { useState } from "react"

// Style
import styles from "./FlashMessage.module.css"

// DSFR comp
import { Alert } from "@codegouvfr/react-dsfr/Alert"

export default function FlashMessage({ flash }) {

    let isOpen = flash.open

    if (isOpen) {
        return (
            <>
            
            <div className={styles.flashShell} role="alert">
                <Alert
                    closable={flash.closable}
                    title={flash.title}
                    severity={flash.type}
                />
            </div>
            </>
        )
    } else {
        return <></>
    }

    
}