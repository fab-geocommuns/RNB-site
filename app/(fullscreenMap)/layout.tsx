import RNBHeader from '@/components/RNBHeader';

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader withNavigation={false} />
      {children}
    </>
  );
}
