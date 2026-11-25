'use client';

import { useEffect, useState } from 'react';
import { ApiBuilding } from '@/components/verification/useCaseGeometries';

const BAN_LOOKUP = 'https://plateforme.adresse.data.gouv.fr/lookup/';
const BAN_REVERSE = 'https://data.geopf.fr/geocodage/reverse';

// Rayon dans lequel on cherche des adresses BAN non liées au bâtiment.
export const NEARBY_ADDRESSES_RADIUS_M = 50;

export type LinkedAddress = {
  id: string;
  label: string;
  // Détail BAN (null tant qu'il charge, ou si l'adresse n'existe plus).
  certified: boolean | null;
  sources: string[];
  updatedAt: string | null;
  position: [number, number] | null;
  distance: number | null;
  missing: boolean;
};

export type NearbyAddress = {
  id: string;
  label: string;
  position: [number, number];
  distance: number;
};

export type BuildingAddresses = {
  loading: boolean;
  linked: LinkedAddress[];
  nearby: NearbyAddress[];
};

type BanLookup = {
  certifie?: boolean;
  sources?: string[];
  dateMAJ?: string;
  lon?: number;
  lat?: number;
};

type BanReverse = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { id: string; label: string; type: string; distance: number }
>;

export function distanceMeters(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
) {
  const dx = (lon2 - lon1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
  const dy = (lat2 - lat1) * 110540;
  return Math.hypot(dx, dy);
}

async function lookup(id: string, signal: AbortSignal) {
  const response = await fetch(BAN_LOOKUP + encodeURIComponent(id), {
    signal,
  });
  if (!response.ok) return null;
  return (await response.json()) as BanLookup;
}

async function reverse([lon, lat]: [number, number], signal: AbortSignal) {
  const url = new URL(BAN_REVERSE);
  url.search = new URLSearchParams({
    lon: String(lon),
    lat: String(lat),
    index: 'address',
    limit: '20',
  }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as BanReverse;
  return data.features.filter((f) => f.properties.type === 'housenumber');
}

// Adresses liées au bâtiment (détail BAN : certification, sources, position)
// et adresses BAN proches qui ne lui sont pas liées.
export function useBuildingAddresses(
  building: ApiBuilding | null,
  center: [number, number] | null,
): BuildingAddresses {
  const [state, setState] = useState<BuildingAddresses>({
    loading: false,
    linked: [],
    nearby: [],
  });

  useEffect(() => {
    if (!building || !center) {
      setState({ loading: false, linked: [], nearby: [] });
      return;
    }
    const controller = new AbortController();
    const base: LinkedAddress[] = building.addresses.map((a) => ({
      id: a.id,
      label: [
        a.street_number,
        a.street_rep,
        a.street,
        a.city_zipcode,
        a.city_name,
      ]
        .filter(Boolean)
        .join(' '),
      certified: null,
      sources: [],
      updatedAt: null,
      position: null,
      distance: null,
      missing: false,
    }));
    setState({ loading: true, linked: base, nearby: [] });

    Promise.all([
      Promise.all(
        base.map(async (address) => {
          const detail = await lookup(address.id, controller.signal).catch(
            () => null,
          );
          if (!detail) return { ...address, missing: true };
          const position: [number, number] | null =
            detail.lon !== undefined && detail.lat !== undefined
              ? [detail.lon, detail.lat]
              : null;
          return {
            ...address,
            certified: detail.certifie ?? null,
            sources: detail.sources ?? [],
            updatedAt: detail.dateMAJ ?? null,
            position,
            distance: position ? distanceMeters(center, position) : null,
          };
        }),
      ),
      reverse(center, controller.signal).catch(() => []),
    ]).then(([linked, found]) => {
      if (controller.signal.aborted) return;
      const linkedIds = new Set(linked.map((a) => a.id));
      const nearby = found
        .filter((f) => !linkedIds.has(f.properties.id))
        .map((f) => {
          const position = f.geometry.coordinates as [number, number];
          return {
            id: f.properties.id,
            label: f.properties.label,
            position,
            distance: distanceMeters(center, position),
          };
        })
        .filter((a) => a.distance <= NEARBY_ADDRESSES_RADIUS_M)
        .sort((a, b) => a.distance - b.distance);
      setState({ loading: false, linked, nearby });
    });

    return () => controller.abort();
  }, [building, center]);

  return state;
}

// Couche à superposer sur une carte : adresses liées (certifiées ou non), traits
// bâtiment → adresse liée, adresses proches non liées.
export function addressesOverlay(
  center: [number, number] | null,
  addresses: BuildingAddresses,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const a of addresses.linked) {
    if (!a.position) continue;
    if (center) {
      features.push({
        type: 'Feature',
        properties: { kind: 'link' },
        geometry: { type: 'LineString', coordinates: [center, a.position] },
      });
    }
    features.push({
      type: 'Feature',
      properties: {
        kind: a.certified ? 'linked-certified' : 'linked',
        label: a.label.split(' ')[0],
      },
      geometry: { type: 'Point', coordinates: a.position },
    });
  }
  for (const a of addresses.nearby) {
    features.push({
      type: 'Feature',
      properties: { kind: 'nearby', label: a.label.split(' ')[0] },
      geometry: { type: 'Point', coordinates: a.position },
    });
  }
  return { type: 'FeatureCollection', features };
}
