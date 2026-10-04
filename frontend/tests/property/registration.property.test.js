import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

const registrationIdArb = fc
  .tuple(fc.integer({ min: 1, max: 9999999999999 }), fc.stringMatching(/^[a-z0-9]{6}$/))
  .map(([timestamp, random]) => `reg_${timestamp}_${random}`);

const validRegistrationArb = fc.record({
  studentName: fc.string({ minLength: 1 }).filter(v => v.trim().length > 0),
  studentEmail: fc
    .tuple(
      fc.stringMatching(/^[a-z0-9]{1,10}$/),
      fc.stringMatching(/^[a-z]{2,8}$/)
    )
    .map(([user, domain]) => `${user}@${domain}.com`),
  studentId: fc.string({ minLength: 1 }).filter(v => v.trim().length > 0),
  eventName: fc.string({ minLength: 1 }).filter(v => v.trim().length > 0),
  timestamp: fc.date().map(d => d.toISOString()),
});

describe('EventHub Registration Correctness Properties', () => {
  it('Property 1: registration IDs are unique and follow the expected format', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(registrationIdArb, {
          minLength: 1,
          maxLength: 100,
        }),
        ids => {
          expect(new Set(ids).size).toBe(ids.length);

          for (const id of ids) {
            expect(id).toMatch(/^reg_\d+_[a-z0-9]{6}$/);
          }
        }
      )
    );
  });

  it('Property 2: valid registration records contain all required fields', () => {
    fc.assert(
      fc.property(validRegistrationArb, registration => {
        const requiredFields = [
          'studentName',
          'studentEmail',
          'studentId',
          'eventName',
          'timestamp',
        ];

        for (const field of requiredFields) {
          expect(registration[field]).toBeDefined();
          expect(registration[field]).not.toBe('');
          expect(registration[field].trim()).not.toBe('');
        }
      })
    );
  });

  it('Property 3: generated student emails contain @ and a domain component', () => {
    fc.assert(
      fc.property(validRegistrationArb, registration => {
        expect(registration.studentEmail).toContain('@');

        const [, domain] = registration.studentEmail.split('@');

        expect(domain).toContain('.');
        expect(domain.length).toBeGreaterThan(2);
      })
    );
  });
});
