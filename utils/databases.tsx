import { DiffusionDatabase } from '@/components/diffusionDatabase.type';

export async function getDatabases(): Promise<DiffusionDatabase[]> {
  let result = [];

  if (!process.env.CI) {
    const url = process.env.NEXT_PUBLIC_API_BASE + '/diffusion_databases';
    const res = await fetch(url);
    const data = await res.json();
    result = data.sort(
      (a: DiffusionDatabase, b: DiffusionDatabase) =>
        a.display_order - b.display_order,
    );
  }

  return result;
}
