import { bdgApiUrl } from '@/stores/map/map-slice';
import { SelectedBuilding } from '@/stores/map/map-slice';

export async function fetchBuilding(rnbId: string) {
  const url = bdgApiUrl(rnbId + '?from=site&withPlots=1');
  const rnbResponse = await fetch(url);
  if (rnbResponse.ok) {
    const rnbData = (await rnbResponse.json()) as SelectedBuilding;
    const selectedBuilding = {
      ...rnbData,
      _type: 'building',
    } satisfies SelectedBuilding;
    return selectedBuilding;
  }
}
