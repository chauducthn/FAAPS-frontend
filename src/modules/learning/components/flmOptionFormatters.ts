export interface SimpleOption {
  code: string;
  label: string;
}

function stripPrefixCode(code: string, label: string): string {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return label.replace(new RegExp(`^${escaped}\\s*[—–:-]\\s*`, 'i'), '').trim();
}

function cleanBilingualTopic(raw: string): string {
  let s = raw
    .replace(/^topic\s+on\s+/i, '')
    .replace(/^topic\s*[:–—-]\s*/i, '')
    .replace(/^chủ\s+đề\s+(?:về\s+)?/i, '')
    .trim();
  // Drop Vietnamese duplicate or cohort suffix after "_" (e.g. "_Chủ đề...", "_Phát triển...", "_K19A")
  const underIdx = s.indexOf('_');
  if (underIdx > 0) s = s.slice(0, underIdx).trim();
  // Drop trailing FLM cohort tags like "BIT_SE_K15B" or "K15B"
  s = s.replace(/\s+(?:BIT\b.*|K\d{2}[A-Z]?(?:,\s*K\d{2}[A-Z]?)*)$/i, '').trim();
  if (!s) return raw.trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatComboLabels<T extends SimpleOption>(combos: T[]): Map<string, string> {
  const base = combos.map((c) => ({
    code: c.code,
    topic: cleanBilingualTopic(stripPrefixCode(c.code, c.label)),
  }));
  const counts = new Map<string, number>();
  for (const item of base) {
    const key = item.topic.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const result = new Map<string, string>();
  for (const item of base) {
    const isDup = (counts.get(item.topic.toLowerCase()) ?? 0) > 1;
    result.set(item.code, isDup ? `${item.topic} (${item.code})` : item.topic);
  }
  return result;
}

const ENGLISH_LEVEL_ALIASES: Record<string, string> = {
  PEN101: 'Level 1 (LUK1 → LUK5 → TRS601)',
  PEN201: 'Level 2 (LUK2 → LUK5 → TRS601)',
  PEN301: 'Level 3 (LUK3 → LUK5 → TRS601)',
  PEN401: 'Level 4 (TRS401 → TRS601)',
  PEN501: 'Level 5 (TRS501 → TRS601)',
  PEN601: 'Level 6 (TRS601)',
};

export function formatEnglishLabel(opt: SimpleOption): string {
  const upper = opt.code.trim().toUpperCase();
  if (upper === 'EXEMPT') return 'Exempt (IELTS ≥ 6.0)';
  if (ENGLISH_LEVEL_ALIASES[upper]) return ENGLISH_LEVEL_ALIASES[upper];
  const rest = cleanBilingualTopic(stripPrefixCode(opt.code, opt.label));
  return rest && rest.toUpperCase() !== upper ? `${opt.code} · ${rest}` : opt.code;
}

export function formatPeLabel(opt: SimpleOption): string {
  const cleaned = cleanBilingualTopic(stripPrefixCode(opt.code, opt.label))
    .replace(/^physical\s+education\s*[-–—:]\s*/i, '')
    .trim();
  return cleaned || opt.code;
}

export function formatInstrumentLabel(opt: SimpleOption): string {
  const cleaned = cleanBilingualTopic(stripPrefixCode(opt.code, opt.label).normalize('NFC'))
    .replace(/^(?:traditional\s+musical\s+instrument|nhạc\s+cụ\s+truyền\s+thống)\s*[-–—:]?\s*/i, '')
    .trim();
  return cleaned || opt.code;
}
