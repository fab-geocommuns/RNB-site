import { DiffusionDatabase } from '@/components/diffusionDatabase.type';
import { rnbApi } from '@/utils/rnbApi';

// `revalidate` (seconds) caches the response in the Next.js data cache
export async function getDatabases(
  revalidate?: number,
): Promise<DiffusionDatabase[]> {
  const data = await rnbApi.get<DiffusionDatabase[]>(
    '/diffusion_databases',
    revalidate !== undefined ? { next: { revalidate } } : undefined,
  );
  return data.sort(
    (a: DiffusionDatabase, b: DiffusionDatabase) =>
      a.display_order - b.display_order,
  );
}
