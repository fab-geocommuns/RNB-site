import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HistoryClient from './HistoryClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface ApiHistoryItem {
  rnb_id: string;
  is_active: boolean;
  shape: GeoJSON.Geometry | null;
  status: string;
  point: {
    coordinates: number[];
  };
  event: {
    id: string;
    type: string;
    author: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      organizations_names: string | null;
    } | null;
    origin: {
      type: string;
      id: number;
      details: {
        description?: string;
        imported_database?: string;
      };
    };
    details: {
      updated_fields: string[];
      merge_parents?: string[];
      merge_child?: string;
      merge_role?: string;
      split_role?: string;
      split_children?: string[];
      split_parent?: string;
    } | null;
  };
  ext_ids: Array<{
    id: string;
    source: string;
    created_at: string;
    source_version: string;
  }>;
  updated_at: string;
  addresses: Array<{
    id: string;
    source: string;
    street_number: string;
    street_rep: string;
    street: string;
    city_name: string;
    city_zipcode: string;
    city_insee_code: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Historique du bâtiment - ${id}`,
    description: `Historique et évolution du bâtiment ${id}`,
  };
}
async function fetchBuildingHistory(
  id: string,
): Promise<ApiHistoryItem[] | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${id}/history/`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch building history');
    }
    const apiData: ApiHistoryItem[] = await response.json();
    return apiData;
  } catch (error) {
    console.error('Error fetching building history:', error);
    return null;
  }
}

export default async function BuildingHistoryDetail({ params }: PageProps) {
  const { id } = await params;
  const buildingData = await fetchBuildingHistory(id);
  if (!buildingData) notFound();
  return <HistoryClient buildingData={buildingData} id={id} />;
}
