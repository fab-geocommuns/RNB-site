// Comps
import ADSForm from '@/components/ADSForm';
import Link from 'next/link';

// Auth
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';

async function fetchADSDetail(file_number: string) {
  const url =
    process.env.NEXT_PUBLIC_API_BASE + '/ads/' + file_number + '?from=site';
  const res = await fetch(url, { cache: 'no-cache' });
  const data = await res.json();
  return data;
}

export default async function ADSDetail({ params }: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/ads');
  }

  const ads = await fetchADSDetail(params.file_number);

  return (
    <>
      <p>
        <Link href={`/ads`}>&larr; retour</Link>
      </p>
      <h1>{ads.file_number}</h1>
      <ADSForm data={ads} />
    </>
  );
}
