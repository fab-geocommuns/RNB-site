import RNBHeader from '@/components/RNBHeader';

export default function NoFooterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader />
      {children}
    </>
  );
}
