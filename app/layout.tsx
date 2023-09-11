// DSFR and styles
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getColorSchemeHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes";
import StartDsfr from "@/app/StartDsfr";
import { defaultColorScheme } from "@/app/defaultColorScheme";
import  "@/styles/global.scss";

// Auth
import RNBSessionProvider from '@/components/SessionProvider'

// Components
import RNBHeader from "@/components/RNBHeader";
import { Analytics } from '@vercel/analytics/react';
import FlashMessage from "@/components/FlashMessage";
import Script from "next/script";

// Settings
import settings from '@/logic/settings'

export const metadata = {
  title: 'Référentiel National des Bâtiments',
  description: '...',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  console.log(settings.hotjarId, settings.hotjarVersion)

  
  


  return (    
    
    <html lang="fr" {...getColorSchemeHtmlAttributes({ defaultColorScheme })} >
      <head>
        <StartDsfr />
        <DsfrHead defaultColorScheme={defaultColorScheme} />
        <Script id="hotjar">
          {`
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:3649335,hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>
      <body>
        <RNBSessionProvider>
        <DsfrProvider defaultColorScheme={defaultColorScheme}>
          <RNBHeader />
          <FlashMessage />
          {children}
          
          
          

        </DsfrProvider>
        </RNBSessionProvider>
        <Analytics />
        </body>
    </html>
    
  )
}



