export const RoleName = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];
