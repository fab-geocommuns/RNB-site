// Lecture et écriture de CSV (RFC 4180) pour l'outil de vérification de bâtiments.
// Séparateur détecté sur la ligne d'en-tête (virgule ou point-virgule).

export type CsvTable = {
  delimiter: ',' | ';';
  header: string[];
  rows: string[][];
};

function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const commas = firstLine.split(',').length;
  const semicolons = firstLine.split(';').length;
  return semicolons > commas ? ';' : ',';
}

export function parseCsv(input: string): CsvTable {
  const text = input.replace(/^﻿/, '');
  const delimiter = detectDelimiter(text);
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      record.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => r.some((value) => value !== ''));
  const [header = [], ...rows] = nonEmpty;
  return { delimiter, header, rows };
}

function escapeField(value: string, delimiter: string): string {
  if (
    value.includes('"') ||
    value.includes(delimiter) ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv({ delimiter, header, rows }: CsvTable): string {
  return (
    [header, ...rows]
      .map((r) =>
        r.map((value) => escapeField(value, delimiter)).join(delimiter),
      )
      .join('\n') + '\n'
  );
}
