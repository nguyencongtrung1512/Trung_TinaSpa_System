import { expiresAtFromNow, expiresInToMs } from './expires.util.js';

describe('expires.util', () => {
  it('converts supported duration units', () => {
    expect(expiresInToMs('15m')).toBe(15 * 60_000);
    expect(expiresInToMs('7d')).toBe(7 * 86_400_000);
  });

  it('returns a future date from now', () => {
    const before = Date.now();
    const expiresAt = expiresAtFromNow('15m');
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + expiresInToMs('15m'));
  });

  it('rejects invalid duration format', () => {
    expect(() => expiresInToMs('15min')).toThrow('Invalid expiresIn format');
  });
});
