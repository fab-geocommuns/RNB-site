'use client'

import { useSession } from 'next-auth/react';

export default function LoginBtn() {

    const { data: session } = useSession()

    if (session) {
    return (
        <div>
        <a href="/api/auth/signout" className="fr-btn fr-btn--secondary">Déco</a>
        </div>
    )
    } else {
    return (
        <a href="/api/auth/signin" className="fr-btn fr-btn--secondary">Se connecter</a>
    )
    }
}