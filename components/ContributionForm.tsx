'use client'

// Hooks
import React, { useState, useRef } from 'react';

// Store
import { useDispatch, useSelector } from "react-redux";


// Styles
import styles from '@/styles/contributionForm.module.scss'

// Comps
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';

export default function ContributionForm() {

    const url = process.env.NEXT_PUBLIC_API_BASE + '/contributions/';

    const bdg = useSelector((state) => state.panelBdg)

    const msgInput = useRef(null)

    const emptyMsgInput = () => {
        msgInput.current.value = ""
    }

    const resize = (e) => {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)


    const handleSubmit = async (e: any) => {

        setSending(true);
        setSuccess(false);

        e.preventDefault();

        // submit the form to the url
        let data = new FormData(e.target);
        const res = await fetch(url, {
            method: 'POST',
            body: data,
        }).then((res) => {

            /* Empty textarea */

            setSending(false);
            setSuccess(true);
            emptyMsgInput();

            setTimeout(() => {
                setSuccess(false);
            }, 2000)
            
            
        });
        

    }

    return (
        <form method="post" action={url} onSubmit={handleSubmit}>
            <input name="rnb_id" type="hidden" className="fr-input" value={bdg?.rnb_id} />
            <textarea onChange={resize} ref={msgInput} required name="text" className={`fr-text--sm fr-input fr-mb-2v ${styles.msgInput}`} placeholder="Une adresse à changer ? Des bâtiments à fusionner ? Tout le monde peut contribuer au RNB."></textarea>

            <Button disabled={sending} size="small" type='submit'>{sending && <span>Envoi en cours ...</span>}{!sending && <span>Envoyer ma contribution</span>}</Button>
            {success && <div className='fr-mt-2v'><Badge small severity='success'>Contribution envoyée. Merci.</Badge></div>}            
            
        </form>
    )

}