/**
 * Reads the first sheet of an .xlsx file in the browser, with no npm package:
 * the zip entries are inflated with the built-in DecompressionStream and the
 * sheet XML is read with DOMParser. Used to check an import file before it is uploaded.
 */

/** The cells of the first sheet as text; `rows[0]` is spreadsheet row 1, `rows[r][0]` is column A. */
export type SheetRows = string[][];

export class XlsxReadError extends Error {}

const dec = new TextDecoder();

interface Entry {
  method: number;
  compressedSize: number;
  localOffset: number;
}

function readEntries(bytes: Uint8Array): Map<string, Entry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The end-of-central-directory record sits in the last 22 bytes plus an optional comment.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new XlsxReadError('The file is not a valid .xlsx workbook.');
  const count = view.getUint16(eocd + 10, true);
  let pos = view.getUint32(eocd + 16, true);
  const entries = new Map<string, Entry>();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50) throw new XlsxReadError('The file is not a valid .xlsx workbook.');
    const method = view.getUint16(pos + 10, true);
    const compressedSize = view.getUint32(pos + 20, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const name = dec.decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
    entries.set(name, { method, compressedSize, localOffset });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readText(bytes: Uint8Array, entries: Map<string, Entry>, name: string): Promise<string | null> {
  const entry = entries.get(name);
  if (!entry) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const start = entry.localOffset + 30 + view.getUint16(entry.localOffset + 26, true) + view.getUint16(entry.localOffset + 28, true);
  const raw = bytes.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return dec.decode(raw);
  if (entry.method === 8) return dec.decode(await inflate(raw));
  throw new XlsxReadError('The workbook uses an unsupported compression method.');
}

const parseXml = (text: string) => new DOMParser().parseFromString(text, 'application/xml');
/** Elements by local name, whatever namespace prefix the writer used. */
const byName = (root: Document | Element, name: string) => Array.from(root.getElementsByTagNameNS('*', name));

/** "AB12" -> 27 (zero-based column index). */
function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Path of the first sheet, read from the workbook and its relationships. */
async function firstSheetPath(bytes: Uint8Array, entries: Map<string, Entry>): Promise<string> {
  const fallback = 'xl/worksheets/sheet1.xml';
  const workbook = await readText(bytes, entries, 'xl/workbook.xml');
  const rels = await readText(bytes, entries, 'xl/_rels/workbook.xml.rels');
  if (!workbook || !rels) return fallback;
  const sheet = byName(parseXml(workbook), 'sheet')[0];
  const relId = sheet?.getAttribute('r:id') ?? sheet?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const target = byName(parseXml(rels), 'Relationship').find((r) => r.getAttribute('Id') === relId)?.getAttribute('Target');
  if (!target) return fallback;
  return target.startsWith('/') ? target.slice(1) : `xl/${target}`;
}

/** Blob.arrayBuffer is missing in some environments (jsdom); FileReader works everywhere. */
function toBytes(file: Blob): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer().then((b) => new Uint8Array(b));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(new XlsxReadError('The file could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}

export async function readFirstSheet(file: Blob): Promise<SheetRows> {
  const bytes = await toBytes(file);
  const entries = readEntries(bytes);
  const sheetXml = await readText(bytes, entries, await firstSheetPath(bytes, entries));
  if (!sheetXml) throw new XlsxReadError('The workbook has no sheet.');

  const sharedXml = await readText(bytes, entries, 'xl/sharedStrings.xml');
  const shared = sharedXml
    ? byName(parseXml(sharedXml), 'si').map((si) => byName(si, 't').map((t) => t.textContent ?? '').join(''))
    : [];

  const rows: SheetRows = [];
  for (const row of byName(parseXml(sheetXml), 'row')) {
    const r = Number(row.getAttribute('r')) - 1;
    if (!(r >= 0)) continue;
    const cells: string[] = [];
    for (const c of byName(row, 'c')) {
      const ref = c.getAttribute('r');
      const col = ref ? columnIndex(ref) : cells.length;
      const type = c.getAttribute('t');
      const v = byName(c, 'v')[0]?.textContent ?? '';
      let text: string;
      if (type === 's') text = shared[Number(v)] ?? '';
      else if (type === 'inlineStr') text = byName(c, 't').map((t) => t.textContent ?? '').join('');
      else if (type === 'b') text = v === '1' ? 'TRUE' : 'FALSE';
      else text = v;
      while (cells.length < col) cells.push('');
      cells[col] = text;
    }
    while (rows.length < r) rows.push([]);
    rows[r] = cells;
  }
  return rows;
}
