import RNBHeader from '@/components/RNBHeader';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader withNavigation={false} />
      <StartDsfrOnHydration />
      {children}
    </>
  );
}
