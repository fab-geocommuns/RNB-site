export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={'fr-container fr-py-8v'}>{children}</div>
    </>
  );
}
