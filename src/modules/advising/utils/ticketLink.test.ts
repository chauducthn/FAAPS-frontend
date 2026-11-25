import { describe, expect, it } from 'vitest';
import { advisorRequestLink, ticketIdFromActionUrl } from './ticketLink';

describe('ticketIdFromActionUrl', () => {
  it('reads the id from the query string', () => {
    expect(ticketIdFromActionUrl('/advisor/advising-requests?id=123')).toBe('123');
  });

  it('reads the id from a requestId query param', () => {
    expect(ticketIdFromActionUrl('/advisor/advising-requests?requestId=abc-42')).toBe('abc-42');
  });

  it('reads the id from the path segment', () => {
    expect(ticketIdFromActionUrl('/advisor/advising-requests/123')).toBe('123');
  });

  it('reads the id from an absolute URL', () => {
    expect(ticketIdFromActionUrl('https://app.example.com/advisor/advising-requests?id=123')).toBe('123');
  });

  it('ignores unrelated paths', () => {
    expect(ticketIdFromActionUrl('/advisor/students')).toBeNull();
    expect(ticketIdFromActionUrl('/student/advising-requests?id=123')).toBeNull();
  });

  it('ignores empty / missing urls', () => {
    expect(ticketIdFromActionUrl(null)).toBeNull();
    expect(ticketIdFromActionUrl(undefined)).toBeNull();
    expect(ticketIdFromActionUrl('')).toBeNull();
  });

  it('returns null when the request list has no id at all', () => {
    expect(ticketIdFromActionUrl('/advisor/advising-requests')).toBeNull();
  });
});

describe('advisorRequestLink', () => {
  it('builds the deep-link that opens the ticket modal', () => {
    expect(advisorRequestLink('123')).toBe('/advisor/advising-requests?id=123');
  });

  it('encodes ids that need escaping', () => {
    expect(advisorRequestLink('a b')).toBe('/advisor/advising-requests?id=a%20b');
  });
});
