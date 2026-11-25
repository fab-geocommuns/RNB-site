// Met l'historique d'un bâtiment (`buildings/<id>/history/`) en phrases
// courtes, pour une lecture rapide dans l'outil de vérification.

import type { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';

export type HistoryTone = 'creation' | 'validation' | 'change' | 'removal';

export type HistoryEntry = {
  key: string;
  title: string;
  date: string;
  tone: HistoryTone;
  lines: string[];
};

const FIELD_LABELS: Record<string, string> = {
  shape: 'forme',
  point: 'position',
  status: 'statut',
  addresses: 'adresses',
  ext_ids: 'identifiants externes',
  is_active: 'activation',
  validated_by: 'validation',
  parent_buildings: 'bâtiments parents',
};

const DATABASE_LABELS: Record<string, string> = {
  bdtopo: 'BD Topo',
  bdnb: 'BDNB',
  ban: 'BAN',
};

function statusLabel(status: string): string {
  return BuildingStatusMap[status as keyof typeof BuildingStatusMap] ?? status;
}

// « bdtopo_2023_09 » → « BD Topo (2023-09) ».
export function databaseLabel(name: string): string {
  const [source, ...version] = name.split('_');
  const label = DATABASE_LABELS[source.toLowerCase()] ?? source;
  return version.length ? `${label} (${version.join('-')})` : label;
}

export function formatHistoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function whoDidIt(event: ApiHistoryItem['event']): string | null {
  if (event.author) {
    const org =
      event.author.organization_short_name ?? event.author.organization_name;
    return `par ${event.author.username}${org ? ` (${org})` : ''}`;
  }
  const database = event.origin?.details?.imported_database;
  if (database) return `Import ${databaseLabel(database)}`;
  const description = event.origin?.details?.description;
  return description ?? null;
}

// `items` va du plus récent au plus ancien, comme l'API.
export function describeHistory(items: ApiHistoryItem[]): HistoryEntry[] {
  return items.map((item, i) => {
    const { event } = item;
    const older = items[i + 1];
    const fields = event.details?.updated_fields ?? [];
    const lines: string[] = [];
    let title: string;
    let tone: HistoryTone = 'change';

    const who = whoDidIt(event);
    if (who) lines.push(who);

    const validationOnly = fields.length === 1 && fields[0] === 'validated_by';
    if (event.type === 'creation') {
      title = 'Création';
      tone = 'creation';
      lines.push(`Statut : ${statusLabel(item.status)}`);
    } else if (event.type === 'merge') {
      title = 'Fusion';
      const parents = event.details?.merge_parents;
      if (parents?.length) lines.push(`De ${parents.join(', ')}`);
    } else if (event.type === 'split') {
      title = 'Scission';
      const children = event.details?.split_children;
      const parent = event.details?.split_parent;
      if (children?.length) lines.push(`En ${children.join(', ')}`);
      else if (parent) lines.push(`Issu de ${parent}`);
    } else if (
      event.type === 'deactivation' ||
      (older?.is_active && !item.is_active)
    ) {
      title = 'Désactivation';
      tone = 'removal';
    } else if (event.type === 'reactivation') {
      title = 'Réactivation';
    } else if (validationOnly) {
      const before = older?.validated_by?.length ?? 0;
      const removed = (item.validated_by?.length ?? 0) < before;
      title = removed ? 'Validation retirée' : 'Validation';
      tone = removed ? 'removal' : 'validation';
    } else {
      title = event.type === 'update' ? 'Modification' : event.type;
    }

    if (older && older.status !== item.status && event.type !== 'creation') {
      lines.push(
        `Statut : ${statusLabel(older.status)} → ${statusLabel(item.status)}`,
      );
      if (item.status === 'demolished') tone = 'removal';
    }
    const changed = fields
      .filter(
        (f) => f !== 'status' && !(validationOnly && f === 'validated_by'),
      )
      .map((f) => FIELD_LABELS[f] ?? f);
    if (changed.length) lines.push(`Modifié : ${changed.join(', ')}`);

    const annotations = event.annotations?.length ?? 0;
    if (annotations) {
      lines.push(`${annotations} annotation${annotations > 1 ? 's' : ''}`);
    }

    return {
      key: `${event.id}-${item.updated_at}`,
      title,
      date: formatHistoryDate(item.updated_at),
      tone,
      lines,
    };
  });
}

// Événement qui a posé la validation actuelle : le plus récent où un
// validateur s'ajoute à `validated_by`. `items` va du plus récent au plus
// ancien, comme l'API.
export function findValidationEvent(
  items: ApiHistoryItem[],
): ApiHistoryItem | null {
  for (let i = 0; i < items.length; i++) {
    const current = new Set((items[i].validated_by ?? []).map((u) => u.id));
    if (current.size === 0) return null;
    const before = new Set((items[i + 1]?.validated_by ?? []).map((u) => u.id));
    if (Array.from(current).some((id) => !before.has(id))) return items[i];
  }
  return null;
}
