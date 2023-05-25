'use client'

import { useEffect, useState } from "react"

// Style
import styles from "./FlashMessage.module.css"

// DSFR comp
import { Alert } from "@codegouvfr/react-dsfr/Alert"

// Bus
import Bus from "@/utils/Bus"

// Router
import { usePathname, useSearchParams } from 'next/navigation';


export default function FlashMessage() {

    const [isOpen, setIsOpen] = useState(false)
    const [closable, setClosable] = useState(true)
    const [msg, setMsg] = useState('')
    const [type, setType] = useState('success')

    const [msgAfterRedirect, setMsgAfterRedirect] = useState('')

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        
        Bus.addListener('flash', (data) => {

            setIsOpen(true)
            setMsg(data.msg)
            setType(data.type)

        })

        Bus.addListener('flashAfterRedirect', (data) => {

            setMsgAfterRedirect(data.msg)
            setType(data.type)

        })

        Bus.addListener('flashClose', () => {

            setIsOpen(false)
            

        })

        
    }, [])

    useEffect(() => {

        if (msgAfterRedirect.length > 0) {
            setIsOpen(true)
            setMsg(msgAfterRedirect)
            setMsgAfterRedirect('')
        } else {
            setIsOpen(false)
        }
      }, [pathname, searchParams]);


    if (isOpen) {
        return (
            <>
            
            <div className={styles.flashShell} role="alert">
                <Alert
                    closable={closable}
                    onClose={() => setIsOpen(false)}
                    title={msg}
                    severity={type}
                />
            </div>
            </>
        )
    } else {
        return <></>
    }

    
}