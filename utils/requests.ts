import { bdgApiUrl } from '@/stores/map/map-slice';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { throwErrorMessageForHumans } from '@/components/contribution/toaster';

export async function fetchBuilding(rnbId: string) {
  const url = bdgApiUrl(`${rnbId}/?from=site&withPlots=1`);
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

export async function fetchReport(reportId: number) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE}/reports/${reportId}/?from=site`;
  const rnbResponse = await fetch(url);
  if (rnbResponse.ok) {
    return await rnbResponse.json();
  } else {
    // throws an error
    await throwErrorMessageForHumans(rnbResponse);
  }
}
