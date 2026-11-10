/**
 * Minimal dependency-free XLSX writer (stored ZIP, no compression).
 * Produces a real .xlsx file Excel/LibreOffice can open — no npm package needed.
 */

function crc32(data: Uint8Array): number {
  const table = CRC_TABLE;
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const enc = new TextEncoder();

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colName(i: number): string {
  let n = i + 1;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export type XlsxRow = (string | number)[];

function sheetXml(rows: XlsxRow[]): string {
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((v, c) => {
          const ref = `${colName(c)}${r + 1}`;
          if (typeof v === 'number') return `<c r="${ref}" s="1"><v>${v}</v></c>`;
          return `<c r="${ref}" s="${r === 0 ? 2 : 1}" t="inlineStr"><is><t>${escapeXml(String(v))}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');
  const lastCol = colName(Math.max(...rows.map((r) => r.length)) - 1);
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="A1:${lastCol}${rows.length}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>` +
    `<sheetFormat defaultRowHeight="18"/>` +
    `<cols><col min="1" max="1" width="14"/><col min="2" max="2" width="16"/><col min="3" max="3" width="42"/><col min="4" max="4" width="12"/><col min="5" max="5" width="30"/></cols>` +
    `<sheetData>${body}</sheetData></worksheet>`
  );
}

const CONTENT_TYPES =
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
  `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
  `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
  `</Types>`;

const RELS =
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
  `</Relationships>`;

const WORKBOOK =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
  `<sheets><sheet name="Study Plan" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const WORKBOOK_RELS =
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<fonts><font><sz val="11"/><name val="Calibri"/></font><font><sz val="11"/><b/><name val="Calibri"/></font></fonts>` +
  `<fills><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFF26F21"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders><border><left/><right/><top/><bottom/><diagonal/></border></border>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="3">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1"/>` +
  `</cellXfs></styleSheet>`;

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function buildZip(entries: ZipEntry[]): Blob {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const pushU16 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff);
  };
  const pushU32 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  };

  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const crc = crc32(e.data);
    const local: number[] = [];
    pushU32(local, 0x04034b50);
    pushU16(local, 20);
    pushU16(local, 0x0800); // UTF-8 flag
    pushU16(local, 0); // stored
    pushU16(local, 0);
    pushU16(local, 0);
    pushU32(local, crc);
    pushU32(local, e.data.length);
    pushU32(local, e.data.length);
    pushU16(local, nameBytes.length);
    pushU16(local, 0);
    const localHeader = new Uint8Array(local);
    chunks.push(localHeader, nameBytes, e.data);

    const cen: number[] = [];
    pushU32(cen, 0x02014b50);
    pushU16(cen, 20);
    pushU16(cen, 20);
    pushU16(cen, 0x0800);
    pushU16(cen, 0);
    pushU16(cen, 0);
    pushU16(cen, 0);
    pushU32(cen, crc);
    pushU32(cen, e.data.length);
    pushU32(cen, e.data.length);
    pushU16(cen, nameBytes.length);
    pushU16(cen, 0);
    pushU16(cen, 0);
    pushU16(cen, 0);
    pushU16(cen, 0);
    pushU32(cen, 0);
    pushU32(cen, offset);
    central.push(new Uint8Array(cen), nameBytes);
    offset += localHeader.length + nameBytes.length + e.data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const c of central) centralSize += c.length;
  const end: number[] = [];
  pushU32(end, 0x06054b50);
  pushU16(end, 0);
  pushU16(end, 0);
  pushU16(end, entries.length);
  pushU16(end, entries.length);
  pushU32(end, centralSize);
  pushU32(end, centralStart);
  pushU16(end, 0);

  return new Blob([...chunks, ...central, new Uint8Array(end)] as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function buildStudyPlanXlsx(rows: XlsxRow[]): Blob {
  return buildZip([
    { name: '[Content_Types].xml', data: enc.encode(CONTENT_TYPES) },
    { name: '_rels/.rels', data: enc.encode(RELS) },
    { name: 'xl/workbook.xml', data: enc.encode(WORKBOOK) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(WORKBOOK_RELS) },
    { name: 'xl/styles.xml', data: enc.encode(STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheetXml(rows)) },
  ]);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
