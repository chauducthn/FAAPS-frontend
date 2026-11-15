// Helpers for building and downloading CSV exports.
//
// The admin exports (dashboard report, AI performance) are plain tabular
// reports, so a tiny CSV writer is enough — no external dependency needed.

export type CsvValue = string | number | boolean | null | undefined;

export interface CsvSection {
  /** Optional heading printed above the rows. */
  title?: string;
  /** First row is treated as the header of the section. */
  rows: CsvValue[][];
}

/** Escapes one CSV cell: quotes, commas and line breaks are wrapped. */
export function csvCell(value: CsvValue): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`;
  return raw;
}

/** Joins rows into a CSV body (CRLF line endings, as the RFC asks). */
export function csvRows(rows: CsvValue[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/**
 * Builds a CSV document from one or more sections.
 *
 * A section with a title gets an empty line before it so the sections stay
 * readable when the file is opened in a spreadsheet.
 */
export function buildCsv(sections: CsvSection[]): string {
  const blocks: string[] = [];
  for (const section of sections) {
    if (!section.rows.length) continue;
    const body = csvRows(section.rows);
    blocks.push(section.title ? `${csvCell(section.title)}\r\n${body}` : body);
  }
  // A BOM keeps Excel from mangling the accented names of the exported rows.
  return `﻿${blocks.join('\r\n\r\n')}`;
}

/** Offers the CSV as a download. The object URL is released right after. */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** `admin-report-2026-11-15.csv` — a filename that sorts chronologically. */
export function csvFilename(prefix: string, date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `${prefix}-${stamp}.csv`;
}
