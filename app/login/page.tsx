'use client'

import LoginForm from "@/components/LoginForm"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {

    const params = useSearchParams()
    const redirectUrl = params.has('redirect') ? params.get('redirect') : '/'

    return (
        <>
        <LoginForm redirectUrl={redirectUrl} />
        </>
    )

}