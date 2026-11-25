// Minimal dependency-free stored-ZIP writer (no compression) for XLSX generation.

const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

const enc = new TextEncoder();

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

export function buildZip(entries: ZipEntry[]): Blob {
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
    pushU16(local, 0x0800);
    pushU16(local, 0);
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
