// src/modules/advising/utils/ticketLink.ts
// Helpers to turn a notification `actionUrl` into a link that opens a ticket.
//
// The backend stores an in-app path in `notifications.action_url`. Depending on the
// notification kind it can look like:
//   /advisor/advising-requests?id=<ticketId>
//   /advisor/advising-requests/<ticketId>
//   /advisor/advising-requests?requestId=<ticketId>
//
// All of them must open the Advisor ticket list AND open the matching ticket modal.

/** Path of the advisor ticket list. */
export const ADVISOR_REQUESTS_PATH = '/advisor/advising-requests';

const UUID_RE = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/**
 * Extract the advising ticket id from a notification actionUrl.
 * Returns null when the URL does not point at an advising request.
 */
export function ticketIdFromActionUrl(actionUrl: string | null | undefined): string | null {
  if (!actionUrl) return null;

  // Relative in-app path.
  const path = actionUrl.startsWith('http') ? safePath(actionUrl) : actionUrl.split('?')[0];
  if (!path) return null;

  // Only advising-request URLs are relevant.
  if (!path.startsWith(ADVISOR_REQUESTS_PATH)) return null;

  // 1) Query parameter form: ?id=… / ?requestId=…
  const query = actionUrl.includes('?') ? actionUrl.split('?')[1] : '';
  if (query) {
    const params = new URLSearchParams(query);
    const fromQuery = params.get('id') ?? params.get('requestId') ?? params.get('advisingRequestId');
    if (fromQuery) return fromQuery;
  }

  // 2) Path segment form: /advisor/advising-requests/<id>
  const segment = path.slice(ADVISOR_REQUESTS_PATH.length).split('/').filter(Boolean)[0];
  if (segment) return segment;

  // 3) Last resort: a bare UUID anywhere in the URL.
  const uuid = actionUrl.match(new RegExp(UUID_RE, 'i'));
  return uuid ? uuid[0] : null;
}

/** Build the URL that opens the ticket list with the given ticket's modal. */
export function advisorRequestLink(ticketId: string): string {
  return `${ADVISOR_REQUESTS_PATH}?id=${encodeURIComponent(ticketId)}`;
}

/** Extract only the path of an absolute URL (never throws). */
function safePath(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}
