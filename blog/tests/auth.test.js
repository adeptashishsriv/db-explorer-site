/**
 * Property-based tests for auth module logic.
 *
 * Property 8: isAdmin is true only for the designated admin email
 * Validates: Requirements 9.1, 9.9
 *
 * Note: isAdmin is a pure function with no Firebase dependencies.
 * It is tested via the blog.js export (identical implementation) to avoid
 * CDN import issues in the Node.js test environment.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isAdmin } from '../js/blog.js';

// ---------------------------------------------------------------------------
// Property 8: isAdmin is true only for the designated admin email
// Validates: Requirements 9.1, 9.9
// ---------------------------------------------------------------------------

describe('isAdmin', () => {
  /**
   * Property 8: isAdmin is true only for the designated admin email
   * Validates: Requirements 9.1, 9.9
   *
   * For any user object, isAdmin(user) SHALL return true if and only if
   * user.email === 'adeptashish@gmail.com' AND user.emailVerified === true.
   * For all other inputs (including null, different emails, or unverified
   * emails), isAdmin(user) SHALL return false.
   */
  it('Property 8: isAdmin is true only for the designated admin email — Validates: Requirements 9.1, 9.9', () => {
    // Arbitrary user objects with random emails and emailVerified values
    const userArb = fc.record({
      email: fc.emailAddress(),
      emailVerified: fc.boolean(),
    });

    // Also include the exact admin email as a special case to ensure coverage
    const adminEmailUserArb = fc.record({
      email: fc.constant('adeptashish@gmail.com'),
      emailVerified: fc.boolean(),
    });

    // Test with random user objects
    fc.assert(
      fc.property(userArb, (user) => {
        const result = isAdmin(user);
        const expected =
          user.email === 'adeptashish@gmail.com' && user.emailVerified === true;
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );

    // Test with admin email specifically (ensures both true and false cases are hit)
    fc.assert(
      fc.property(adminEmailUserArb, (user) => {
        const result = isAdmin(user);
        const expected = user.emailVerified === true;
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );

    // null input must always return false
    expect(isAdmin(null)).toBe(false);

    // undefined input must always return false
    expect(isAdmin(undefined)).toBe(false);

    // Non-admin email with emailVerified true must return false
    expect(isAdmin({ email: 'other@example.com', emailVerified: true })).toBe(false);

    // Admin email with emailVerified false must return false
    expect(isAdmin({ email: 'adeptashish@gmail.com', emailVerified: false })).toBe(false);

    // Admin email with emailVerified true must return true
    expect(isAdmin({ email: 'adeptashish@gmail.com', emailVerified: true })).toBe(true);
  });
});
