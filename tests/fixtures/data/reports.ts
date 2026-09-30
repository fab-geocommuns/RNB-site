/**
 * Reports served both by `/reports/{id}/` and as points of the reports vector
 * tiles, all stacked on the same point.
 */
import type { Report, ReportStatus } from '@/types/report';
import type { TilePoint } from '@/tests/fixtures/utils/vector-tile';
import { buildingSegur } from '@/tests/fixtures/data/buildings';

export const REPORTS_POINT = { lng: 2.305, lat: 48.85 };

type Tag = { id: number; name: string };

// 1 and 12: a substring match on the tag ids would confuse them
const tagAddress: Tag = { id: 1, name: 'Adresse' };
const tagMissingBuilding: Tag = { id: 12, name: 'Bâtiment manquant' };

export type ReportFixture = { api: Report; text: string; tilePoint: TilePoint };

const reportFixture = ({
  id,
  status,
  tag,
  text,
}: {
  id: number;
  status: ReportStatus;
  tag: Tag;
  text: string;
}): ReportFixture => {
  const author = { id: null, username: null };
  const createdAt = '2026-09-01T10:00:00Z';
  return {
    api: {
      id,
      point: {
        type: 'Point',
        coordinates: [REPORTS_POINT.lng, REPORTS_POINT.lat],
      },
      rnb_id: buildingSegur.rnb_id,
      status,
      created_at: createdAt,
      updated_at: createdAt,
      messages: [{ id, text, created_at: createdAt, author }],
      author,
      tags: [tag.name],
    },
    text,
    // tag_ids comes as Postgres array text, like the real tiles
    tilePoint: {
      ...REPORTS_POINT,
      properties: { id, status, tag_ids: `{${tag.id}}` },
    },
  };
};

export const addressReport = reportFixture({
  id: 1,
  status: 'pending',
  tag: tagAddress,
  text: 'Le numéro de rue est faux',
});

export const missingBuildingReport = reportFixture({
  id: 2,
  status: 'pending',
  tag: tagMissingBuilding,
  text: "L'annexe au fond de la cour est absente",
});

export const closedReport = reportFixture({
  id: 3,
  status: 'fixed',
  tag: tagAddress,
  text: "L'adresse a déjà été corrigée",
});

export const newReport = reportFixture({
  id: 4,
  status: 'pending',
  tag: tagAddress,
  text: 'Signalement envoyé depuis la fiche bâtiment',
});

export const emptyReportStats = {
  closed_report_count: 0,
  total_report_count: 0,
  tag_stats: [],
};
