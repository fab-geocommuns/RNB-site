import { SelectedBuilding } from '@/stores/map/map-slice';
import { Report } from '@/types/report';
import { rnbApi, RnbApiError } from '@/utils/rnbApi';

// Renvoie `undefined` si l'API répond en erreur (bâtiment inconnu…) : l'appelant
// signale alors un identifiant RNB inconnu.
export async function fetchBuilding(rnbId: string) {
  try {
    const rnbData = await rnbApi.get<SelectedBuilding>(`/buildings/${rnbId}/`, {
      query: { withPlots: 1 },
    });
    return { ...rnbData, _type: 'building' } satisfies SelectedBuilding;
  } catch (err) {
    if (err instanceof RnbApiError) return undefined;
    throw err;
  }
}

export async function fetchReport(reportId: number) {
  return rnbApi.get<Report>(`/reports/${reportId}/`);
}
