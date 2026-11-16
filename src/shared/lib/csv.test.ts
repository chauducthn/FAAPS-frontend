import { describe, expect, it } from 'vitest';
import { buildCsv, csvCell, csvFilename, csvRows } from './csv';

describe('csvCell', () => {
  it('leaves plain values untouched', () => {
    expect(csvCell('hello')).toBe('hello');
    expect(csvCell(42)).toBe('42');
    expect(csvCell(true)).toBe('true');
  });

  it('renders empty strings for null and undefined', () => {
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
  });

  it('quotes values that contain a comma, a quote or a line break', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('csvRows', () => {
  it('joins the cells of every row with commas and CRLF', () => {
    expect(csvRows([['a', 'b'], ['c', 'd']])).toBe('a,b\r\nc,d');
  });
});

describe('buildCsv', () => {
  it('writes the sections one after the other with a blank line between them', () => {
    const csv = buildCsv([
      { title: 'Totals', rows: [['Metric', 'Value'], ['Students', 3]] },
      { title: 'Monthly', rows: [['Month', 'Count'], ['2025-07', 2]] },
    ]);

    expect(csv).toContain('Totals\r\nMetric,Value\r\nStudents,3');
    expect(csv).toContain('\r\n\r\nMonthly\r\nMonth,Count\r\n2025-07,2');
  });

  it('skips a section without rows', () => {
    const csv = buildCsv([
      { title: 'Empty', rows: [] },
      { title: 'Full', rows: [['A', 'B']] },
    ]);

    expect(csv).not.toContain('Empty');
    expect(csv).toContain('Full');
  });

  it('starts with a BOM so Excel keeps the accented characters', () => {
    expect(buildCsv([{ rows: [['A']] }]).charCodeAt(0)).toBe(0xfeff);
  });
});

describe('csvFilename', () => {
  it('appends the date so the files sort chronologically', () => {
    expect(csvFilename('admin-report', new Date('2026-11-15T08:00:00Z'))).toBe(
      'admin-report-2026-11-15.csv',
    );
  });
});
