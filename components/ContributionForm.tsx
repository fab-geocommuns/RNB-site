'use client'

// Hooks
import React, { useState, useRef, useEffect } from 'react';

// Store
import { useDispatch, useSelector } from "react-redux";

// Analytics
import va from "@vercel/analytics"      

// Styles
import styles from '@/styles/contributionForm.module.scss'

// Comps
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';

// Utils
import Cookies from 'js-cookie';

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

    const handleFocus = (e) => {
        console.log('focus contrib')
        va.track("contribution-textarea-focus")
    }

    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [email, setEmail] = useState('');


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

            /* Store email in cookie */
            Cookies.set('email', email, { expires: 365 });

            va.track("contribution-success")

            setTimeout(() => {
                setSuccess(false);
            }, 2000)
            
            
        }).catch((err) => {
            va.track("contribution-error", {error: err})
        });

        

    }

    const changeEmail = (e) => {
        setEmail(e.target.value);
    }
    

    useEffect(() => {

            const storedEmail = Cookies.get('email');
            if (storedEmail) {
                setEmail(storedEmail);
            }


    }, []);

    return (
        <form method="post" action={url} onSubmit={handleSubmit}>
            <input name="rnb_id" type="hidden" className="fr-input" value={bdg?.rnb_id} />
            <textarea onFocus={handleFocus} onChange={resize} ref={msgInput} required name="text" className={`fr-text--sm fr-input fr-mb-4v ${styles.msgInput}`} placeholder="Il manque un bâtiment ? Une adresse semble erronée ? Envoyez votre signalement; tout le monde peut apporter sa pierre au RNB. "></textarea>

            <div className='fr-mb-1v'><label className='fr-text--sm '>Suivez le traitement de votre signalement</label></div>
            <input onChange={changeEmail} value={email} name="email" type="email" className="fr-input fr-text--sm fr-mb-2v" placeholder="Votre adresse email (optionnelle)"  />

            <Button disabled={sending} size="small" type='submit'>{sending && <span>Envoi en cours ...</span>}{!sending && <span>Envoyer mon signalement</span>}</Button>
            {success && <div className='fr-mt-2v'><Badge small severity='success'>Signalement envoyé. Merci.</Badge></div>}            
            
        </form>
    )

}