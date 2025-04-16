export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
