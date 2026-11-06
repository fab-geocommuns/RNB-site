import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/auth';
import pageTitle from '@/utils/pageTitle';
import EditionClient from './EditionClient';

export const metadata = pageTitle("Carte d'édition");

export default async function EditionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  // Redirected before rendering: a visitor does not download the map code
  if (!session) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
      for (const v of [value ?? []].flat()) query.append(key, v);
    }
    const search = query.toString();
    const current = search ? `/edition?${search}` : '/edition';
    redirect(`/connexion?redirect=${encodeURIComponent(current)}`);
  }

  return <EditionClient />;
}
