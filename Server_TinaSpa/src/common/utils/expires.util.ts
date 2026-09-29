const UNIT_TO_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

export type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

export function asJwtExpiresIn(expiresIn: string): JwtExpiresIn {
  if (!/^(\d+)([smhd])$/.test(expiresIn)) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  return expiresIn as JwtExpiresIn;
}

export function expiresInToMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(asJwtExpiresIn(expiresIn));
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const value = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_TO_MS;
  return value * UNIT_TO_MS[unit];
}

export function expiresAtFromNow(expiresIn: string): Date {
  return new Date(Date.now() + expiresInToMs(expiresIn));
}
