import { describe, expect, it } from 'vitest';
import {
  ADVISOR_APPOINTMENTS_PATH,
  STUDENT_APPOINTMENTS_PATH,
  advisingRequestIdFromParams,
  advisorSchedulingLink,
  studentBookingLink,
} from './appointmentLink';

describe('studentBookingLink', () => {
  it('builds the student booking URL carrying the ticket id', () => {
    expect(studentBookingLink('ticket-1')).toBe(
      `${STUDENT_APPOINTMENTS_PATH}?advisingRequestId=ticket-1`,
    );
  });

  it('encodes the ticket id so it is safe in a query string', () => {
    expect(studentBookingLink('a b&c')).toBe(
      `${STUDENT_APPOINTMENTS_PATH}?advisingRequestId=a%20b%26c`,
    );
  });

  it('returns null when there is no ticket to link', () => {
    expect(studentBookingLink(null)).toBeNull();
    expect(studentBookingLink(undefined)).toBeNull();
    expect(studentBookingLink('')).toBeNull();
  });
});

describe('advisorSchedulingLink', () => {
  it('builds the advisor scheduling URL carrying the ticket id', () => {
    expect(advisorSchedulingLink('ticket-9')).toBe(
      `${ADVISOR_APPOINTMENTS_PATH}?advisingRequestId=ticket-9`,
    );
  });

  it('returns null when there is no ticket to link', () => {
    expect(advisorSchedulingLink(null)).toBeNull();
  });
});

describe('advisingRequestIdFromParams', () => {
  it('reads the ticket id out of the search params', () => {
    expect(advisingRequestIdFromParams(new URLSearchParams('advisingRequestId=ticket-1'))).toBe(
      'ticket-1',
    );
  });

  it('returns null when the param is missing', () => {
    expect(advisingRequestIdFromParams(new URLSearchParams(''))).toBeNull();
  });

  it('returns null when the param is blank', () => {
    expect(advisingRequestIdFromParams(new URLSearchParams('advisingRequestId=%20%20'))).toBeNull();
  });
});
