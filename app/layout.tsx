// DSFR and styles
import {
  getHtmlAttributes,
  DsfrHead,
} from '../dsfr-bootstrap/server-only-index';
import { DsfrProvider } from '../dsfr-bootstrap';
import { defaultColorScheme } from '../dsfr-bootstrap/defaultColorScheme';
import '@/styles/global.scss';

// Auth
import RNBSessionProvider from '@/components/SessionProvider';

// Components
import { Analytics } from '@vercel/analytics/react';
import FlashMessage from '@/components/FlashMessage';
import Script from 'next/script';

// Settings
import settings from '@/logic/settings';
import { Suspense } from 'react';
import { Providers } from '@/stores/provider';
import { Alerts } from '@/components/Alerts';

export const metadata = {
  title: 'Référentiel National des Bâtiments',
  description: '...',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = 'fr';
  return (
    <html lang={lang} {...getHtmlAttributes({ lang })}>
      <head>
        <DsfrHead />
        <Script id="heap">
          {`
window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
heap.load("${settings.heapId}");
          `}
        </Script>
      </head>
      <body>
        <Suspense>
          <Providers>
            <RNBSessionProvider>
              <DsfrProvider lang={lang}>
                <FlashMessage />
                <Alerts />
                {children}
              </DsfrProvider>
            </RNBSessionProvider>
          </Providers>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
