import { ForbiddenException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { RoleName } from '../constants/roles.js';

export type BranchActor = {
  userAID: string;
  roles: readonly string[];
  branchAID: string | null;
  branchID?: string | null;
};

export function isAdmin(roles: readonly string[]): boolean {
  return roles.includes(RoleName.ADMIN);
}

/**
 * ADMIN: no branch filter (null).
 * MANAGER/STAFF: must belong to a branch; that AID is the scope.
 */
export function scopedBranchAID(actor: BranchActor): string | null {
  if (isAdmin(actor.roles)) return null;
  if (!actor.branchAID) {
    throw new ForbiddenException('Account is not assigned to a branch');
  }
  return actor.branchAID;
}

export function assertBranchAccess(
  actor: BranchActor,
  resourceBranchAID: string,
): void {
  const scope = scopedBranchAID(actor);
  if (scope && scope !== resourceBranchAID) {
    throw new ForbiddenException('Resource is outside your branch');
  }
}

/** Customers assigned to the branch or with at least one booking there. */
export function customersInBranchWhere(
  branchAID: string,
): Prisma.UserWhereInput {
  return {
    role: RoleName.CUSTOMER,
    OR: [{ branchAID }, { appointments: { some: { branchAID } } }],
  };
}

/** MANAGER/STAFF/ADMIN accounts whose workplace is this branch. */
export function assignedToBranchWhere(
  branchAID: string,
  roles: readonly RoleName[],
): Prisma.UserWhereInput {
  return { role: { in: [...roles] }, branchAID };
}

/** Staff of the branch plus customers who belong or booked there. */
export function usersInBranchWhere(
  branchAID: string,
  roles: readonly RoleName[],
): Prisma.UserWhereInput {
  const parts: Prisma.UserWhereInput[] = [];
  const assignedRoles = roles.filter((role) => role !== RoleName.CUSTOMER);
  if (assignedRoles.length > 0) {
    parts.push(assignedToBranchWhere(branchAID, assignedRoles));
  }
  if (roles.includes(RoleName.CUSTOMER)) {
    parts.push(customersInBranchWhere(branchAID));
  }
  if (parts.length === 0) {
    return { userAID: { in: [] } };
  }
  return parts.length === 1 ? parts[0] : { OR: parts };
}
