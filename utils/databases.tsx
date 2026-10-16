import { DiffusionDatabase } from '@/components/diffusionDatabase.type';
import { rnbApi } from '@/utils/rnbApi';

export async function getDatabases(): Promise<DiffusionDatabase[]> {
  const data = await rnbApi.get<DiffusionDatabase[]>('/diffusion_databases');
  return data.sort(
    (a: DiffusionDatabase, b: DiffusionDatabase) =>
      a.display_order - b.display_order,
  );
}
