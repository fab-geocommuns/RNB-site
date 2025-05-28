import RNBHeader from '@/components/RNBHeader';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';

export default function NoFooterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader />
      <StartDsfrOnHydration />
      {children}
    </>
  );
}
