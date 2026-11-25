// Session de vérification : un CSV importé, une ligne par cas, un verdict et un
// commentaire par ligne. La session est gardée dans le localStorage du
// navigateur, une entrée par nom de fichier, pour survivre à un rechargement.

import { CsvTable, parseCsv, toCsv } from '@/utils/verification/csv';

// Verdicts proposés par défaut ; la liste est modifiable dans la page et
// gardée avec la session. Au plus 9, pour les raccourcis 1 à 9.
export const DEFAULT_VERDICTS = ['demoli', 'debout', 'doute'];
export const MAX_VERDICTS = 9;

// « bon, mauvais , doute » → ['bon', 'mauvais', 'doute'] (sans doublon ni vide).
export function parseVerdictList(text: string): string[] {
  const values = text
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, MAX_VERDICTS);
}

export type CaseResult = { verdict: string; commentaire: string };

export type VerificationSession = {
  fileName: string;
  table: CsvTable;
  results: CaseResult[];
  current: number;
  verdicts: string[];
};

const RNB_ID = 'rnb_id';
const VERDICT = 'verdict';
const COMMENT = 'commentaire';

export function columnIndex(table: CsvTable, name: string): number {
  return table.header.findIndex((h) => h.trim().toLowerCase() === name);
}

export function rnbIdOf(session: VerificationSession, row: number): string {
  return (
    session.table.rows[row]?.[columnIndex(session.table, RNB_ID)] ?? ''
  ).trim();
}

function sameCases(a: VerificationSession, b: VerificationSession): boolean {
  return (
    a.table.rows.length === b.table.rows.length &&
    a.table.rows.every((_, i) => rnbIdOf(a, i) === rnbIdOf(b, i))
  );
}

// Crée la session depuis le texte du CSV. Si une session sauvegardée porte le
// même nom de fichier et les mêmes cas, les verdicts déjà saisis l'emportent.
export function createSession(
  fileName: string,
  text: string,
  saved: VerificationSession | null,
): VerificationSession {
  const table = parseCsv(text);
  if (columnIndex(table, RNB_ID) === -1) {
    throw new Error('Le fichier doit contenir une colonne « rnb_id ».');
  }
  if (table.rows.length === 0) {
    throw new Error('Le fichier ne contient aucune ligne.');
  }
  const verdictIdx = columnIndex(table, VERDICT);
  const commentIdx = columnIndex(table, COMMENT);
  const fromFile: CaseResult[] = table.rows.map((row) => ({
    verdict: verdictIdx === -1 ? '' : (row[verdictIdx] ?? '').trim(),
    commentaire: commentIdx === -1 ? '' : (row[commentIdx] ?? ''),
  }));

  const session: VerificationSession = {
    fileName,
    table,
    results: fromFile,
    current: 0,
    verdicts: saved?.verdicts ?? DEFAULT_VERDICTS,
  };
  if (saved && saved.fileName === fileName && sameCases(saved, session)) {
    session.results = fromFile.map((result, i) => {
      const previous = saved.results[i];
      return previous && (previous.verdict || previous.commentaire)
        ? previous
        : result;
    });
    session.current = saved.current;
  }
  // Un verdict déjà présent dans le fichier reste proposé.
  const known = new Set(session.verdicts);
  const extra = session.results
    .map((r) => r.verdict)
    .filter((v) => v && !known.has(v) && known.add(v));
  session.verdicts = [...session.verdicts, ...extra].slice(0, MAX_VERDICTS);
  return session;
}

// CSV d'origine, colonnes et ordre conservés, verdict et commentaire remplis
// (colonnes ajoutées à la fin si absentes).
export function exportSession(session: VerificationSession): string {
  const header = [...session.table.header];
  let verdictIdx = columnIndex(session.table, VERDICT);
  let commentIdx = columnIndex(session.table, COMMENT);
  if (verdictIdx === -1) verdictIdx = header.push(VERDICT) - 1;
  if (commentIdx === -1) commentIdx = header.push(COMMENT) - 1;

  const rows = session.table.rows.map((row, i) => {
    const out = [...row];
    while (out.length < header.length) out.push('');
    out[verdictIdx] = session.results[i].verdict;
    out[commentIdx] = session.results[i].commentaire;
    return out;
  });
  return toCsv({ delimiter: session.table.delimiter, header, rows });
}

export function exportFileName(fileName: string): string {
  return fileName.replace(/(\.csv)?$/i, '-verifie.csv');
}

// --- Stockage navigateur ---

const STORAGE_PREFIX = 'rnb-verification-batiments:';
const LAST_KEY = `${STORAGE_PREFIX}dernier-fichier`;

export function loadSession(fileName?: string): VerificationSession | null {
  try {
    const name = fileName ?? localStorage.getItem(LAST_KEY);
    if (!name) return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + name);
    if (!raw) return null;
    const session = JSON.parse(raw) as VerificationSession;
    // Sessions sauvegardées avant l'ajout des verdicts éditables.
    return { ...session, verdicts: session.verdicts ?? DEFAULT_VERDICTS };
  } catch {
    return null;
  }
}

export function saveSession(session: VerificationSession): boolean {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + session.fileName,
      JSON.stringify(session),
    );
    localStorage.setItem(LAST_KEY, session.fileName);
    return true;
  } catch {
    return false;
  }
}
