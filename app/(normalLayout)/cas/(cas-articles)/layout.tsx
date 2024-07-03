// Comps
import AboutCol from '@/components/AboutCol';

export default function CasLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
        <div className="fr-col-12 fr-col-md-8">{children}</div>
        <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
          <div>
            <AboutCol />
          </div>
        </div>
      </div>
    </div>
  );
}
