// DSFR and styles
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getColorSchemeHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes";
import StartDsfr from "./StartDsfr";
import { defaultColorScheme } from "./defaultColorScheme";
import  "./global.css";

// Auth
import RNBSessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Components
import RNBHeader from "@/components/RNBHeader";
import { Analytics } from '@vercel/analytics/react';


export const metadata = {
  title: 'Référentiel National des Bâtiments',
  description: '...',
}




export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  const session = await getServerSession(authOptions)

  const loginQuickAccessItem = session ? {
    iconId: 'fr-icon-lock-line',
    linkProps: {
      href: '/api/auth/signout'
    },
    text: 'Se déconnecter'
  } : {
    iconId: 'fr-icon-lock-line',
    linkProps: {
      href: '/login'
    },
    text: 'Se connecter'
  }

  return (    
    
    <html lang="fr" {...getColorSchemeHtmlAttributes({ defaultColorScheme })} >
      <head>
        <StartDsfr />
        <DsfrHead defaultColorScheme={defaultColorScheme} />
      </head>
      <body>
        <RNBSessionProvider>
        <DsfrProvider defaultColorScheme={defaultColorScheme}>
          <RNBHeader />

          
          
          {children}
          
        

        </DsfrProvider>
        </RNBSessionProvider>
        <Analytics />
        </body>
    </html>
    
  )
}



