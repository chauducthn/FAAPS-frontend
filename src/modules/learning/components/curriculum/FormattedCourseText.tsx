type TextBlock =
  | { kind: 'section'; title: string; body?: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'numbered'; badge: string; text: string }
  | { kind: 'paragraph'; text: string };

function normalizeRawText(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n').replace(/\s+:/g, ':').trim();
  text = text.replace(/\s*\*\s+(?=[\p{Lu}0-9])/gu, '\n* ');
  text = text.replace(/\s*[\u2022\u25aa\u25e6]\s+/g, '\n- ');
  text = text.replace(/(?:^|\s)(\d+\))\s+(?=[\p{Lu}])/gu, '\n$1 ');
  text = text.replace(/(?<=[.:;!?])\s+(\d+\.)\s+(?=[\p{Lu}])/gu, '\n$1 ');
  text = text.replace(/\s+((?:C?LO|PO|PLO)\d+\s*[:.-])\s+/gi, '\n$1 ');

  const dashCount = (text.match(/\s+-\s+(?=[\p{Lu}])/gu) ?? []).length;
  if (dashCount >= 2) {
    text = text.replace(/\s+-\s+(?=[\p{Lu}])/gu, '\n- ');
  } else {
    text = text.replace(/(?<=[.:;!?])\s+-\s+(?=[\p{Lu}])/gu, '\n- ');
  }

  text = text.replace(/\s+((?:Main activities|Objectives|Course objectives)[^:\n]{0,60}:)/gi, '\n$1');
  return text;
}

function parseBlocks(raw: string): TextBlock[] {
  const lines = normalizeRawText(raw)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: TextBlock[] = [];
  for (const line of lines) {
    if (line.startsWith('* ')) {
      const rest = line.slice(2).trim();
      const colonIdx = rest.indexOf(':');
      if (colonIdx > 0 && colonIdx <= 36) {
        blocks.push({ kind: 'section', title: rest.slice(0, colonIdx).trim(), body: rest.slice(colonIdx + 1).trim() || undefined });
      } else {
        blocks.push({ kind: 'section', title: rest });
      }
      continue;
    }
    if (/^[-–—]\s+/.test(line)) {
      blocks.push({ kind: 'bullet', text: line.replace(/^[-–—]\s+/, '').trim() });
      continue;
    }
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      blocks.push({ kind: 'numbered', badge: numMatch[1], text: numMatch[2].trim() });
      continue;
    }
    const cloMatch = line.match(/^((?:C?LO|PO|PLO)\d+)\s*[:.-]\s*(.+)$/i);
    if (cloMatch) {
      blocks.push({ kind: 'numbered', badge: cloMatch[1].toUpperCase(), text: cloMatch[2].trim() });
      continue;
    }
    blocks.push({ kind: 'paragraph', text: line });
  }
  return blocks;
}

export function FormattedCourseText({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2 text-[12.5px] leading-relaxed text-gray-600">
      {blocks.map((block, idx) => {
        if (block.kind === 'section') {
          return (
            <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/70 px-2.5 py-1.5">
              <span className="font-semibold text-gray-900">{block.title}</span>
              {block.body && <span className="text-gray-600">: {block.body}</span>}
            </div>
          );
        }
        if (block.kind === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#F26F21]/70" />
              <span>{block.text}</span>
            </div>
          );
        }
        if (block.kind === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex min-w-5 shrink-0 items-center justify-center rounded-md bg-orange-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#C2410C]">
                {block.badge}
              </span>
              <span>{block.text}</span>
            </div>
          );
        }
        const isLeadIn = block.text.endsWith(':') && block.text.length <= 90;
        return (
          <p key={idx} className={isLeadIn ? 'pt-0.5 font-semibold text-gray-800' : ''}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
