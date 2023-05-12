"use client";

import { use, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function LoginForm({redirectUrl = ''}) {

    const username = useRef('')
    const password = useRef('')

    const [loginError, setLoginError] = useState(false)

    
    const handleSubmit = async (e: any) => {
        e.preventDefault()

        setLoginError(false)

        const result = await signIn('credentials', {
            redirect: redirectUrl.length > 0 ? true : false,
            callbackUrl: redirectUrl,
            username: username.current,
            password: password.current
        })

        if (result?.error) {
            setLoginError(true)
        } else {
            
        }
            

    }

    
    

    return (
        <>
        
        {loginError && <p>Vos identifiants sont incorrects</p>}

        <form action="api/auth/callback/credentials" method="post" onSubmit={handleSubmit} >
        <label htmlFor="username">Identifiant</label>    
        <input 
        onChange={(e) => {username.current = e.target.value}}
        type="text" 
        name="username" 
        id="username" />

        <label htmlFor="password">Mot de passe</label>
        <input 
        onChange={(e) => {password.current = e.target.value}}
        type="password" 
        name="password" 
        id="password" />

        <button type="submit">Se connecter</button>

        </form>


        </>
    )

}