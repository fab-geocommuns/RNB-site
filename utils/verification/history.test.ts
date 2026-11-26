import { describe, expect, it } from 'vitest';
import type { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import {
  databaseLabel,
  describeHistory,
  findValidationEvent,
} from '@/utils/verification/history';

function item(
  overrides: Omit<Partial<ApiHistoryItem>, 'event'> & {
    event: Partial<ApiHistoryItem['event']>;
  },
): ApiHistoryItem {
  return {
    rnb_id: 'GRYZSDSES5JJ',
    is_active: true,
    shape: null,
    status: 'constructed',
    point: { coordinates: [0, 0] },
    ext_ids: [],
    updated_at: '2026-11-23T06:55:08Z',
    addresses: [],
    validated_by: [],
    ...overrides,
    event: {
      id: 'e',
      type: 'update',
      author: null,
      origin: { type: 'contribution', id: 1, details: {} },
      details: null,
      ...overrides.event,
    },
  } as ApiHistoryItem;
}

const author = {
  id: 708,
  username: 'validatrice',
  first_name: '',
  last_name: '',
  organization_name: null,
  organization_short_name: null,
};

describe('describeHistory', () => {
  it('raconte un historique validation, import, création', () => {
    const entries = describeHistory([
      item({
        validated_by: [
          {
            id: '708',
            username: 'validatrice',
            organization_name: '',
            organization_short_name: null,
          },
        ],
        event: {
          author,
          details: { updated_fields: ['validated_by'] },
        },
      }),
      item({
        updated_at: '2023-12-24T12:56:47Z',
        event: {
          origin: {
            type: 'import',
            id: 1,
            details: { imported_database: 'bdtopo_2023_09' },
          },
          details: { updated_fields: ['ext_ids', 'addresses'] },
        },
      }),
      item({
        updated_at: '2023-12-11T22:01:03Z',
        event: {
          type: 'creation',
          origin: {
            type: 'import',
            id: 2,
            details: { imported_database: 'bdnb_2023_01' },
          },
        },
      }),
    ]);
    expect(
      entries.map(({ title, tone, lines }) => ({ title, tone, lines })),
    ).toEqual([
      { title: 'Validation', tone: 'validation', lines: ['par validatrice'] },
      {
        title: 'Modification',
        tone: 'change',
        lines: [
          'Import BD Topo (2023-09)',
          'Modifié : identifiants externes, adresses',
        ],
      },
      {
        title: 'Création',
        tone: 'creation',
        lines: ['Import BDNB (2023-01)', 'Statut : Construit'],
      },
    ]);
    expect(entries[0].date).toBe('23 nov. 2026');
  });

  it('signale un changement de statut et une démolition', () => {
    const [entry] = describeHistory([
      item({
        status: 'demolished',
        event: { author, details: { updated_fields: ['status'] } },
      }),
      item({ event: { type: 'creation' } }),
    ]);
    expect(entry.tone).toBe('removal');
    expect(entry.lines).toEqual([
      'par validatrice',
      'Statut : Construit → Démoli',
    ]);
  });

  it("n'appelle pas désactivation une modification d'un bâtiment déjà inactif", () => {
    const [entry] = describeHistory([
      item({
        is_active: false,
        event: { details: { updated_fields: ['shape'] } },
      }),
      item({ is_active: false, event: { type: 'deactivation' } }),
    ]);
    expect(entry.title).toBe('Modification');
  });

  it('nomme les bases importées', () => {
    expect(databaseLabel('bdtopo_2023_09')).toBe('BD Topo (2023-09)');
    expect(databaseLabel('cadastre')).toBe('cadastre');
  });
});

describe('findValidationEvent', () => {
  const validator = {
    id: '708',
    username: 'validatrice',
    organization_name: '',
    organization_short_name: null,
  };

  it("retrouve l'événement qui a posé la validation actuelle", () => {
    const validation = item({
      validated_by: [validator],
      event: { id: 'validation', author },
    });
    const later = item({
      validated_by: [validator],
      event: { id: 'ext-ids', details: { updated_fields: ['ext_ids'] } },
    });
    const creation = item({ event: { id: 'creation', type: 'creation' } });
    expect(findValidationEvent([later, validation, creation])?.event.id).toBe(
      'validation',
    );
  });

  it("renvoie null si le bâtiment n'est pas validé", () => {
    expect(findValidationEvent([item({ event: {} })])).toBeNull();
  });
});
