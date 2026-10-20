import { DiffusionDatabase } from '@/components/diffusionDatabase.type';

// `revalidate` (seconds) caches the response in the Next.js data cache
export async function getDatabases(
  revalidate?: number,
): Promise<DiffusionDatabase[]> {
  const url = process.env.NEXT_PUBLIC_API_BASE + '/diffusion_databases';
  const res = await fetch(
    url,
    revalidate !== undefined ? { next: { revalidate } } : undefined,
  );
  if (!res.ok) {
    throw new Error(`GET ${url} failed with ${res.status}`);
  }
  const data = await res.json();
  return data.sort(
    (a: DiffusionDatabase, b: DiffusionDatabase) =>
      a.display_order - b.display_order,
  );
}
