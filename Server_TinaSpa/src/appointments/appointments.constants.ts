import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { Roles } from '../common/decorators/roles.decorator.js';

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const APPOINTMENT_STATUSES = Object.values(AppointmentStatus);

/** Statuses that still hold a slot for the customer. */
export const OPEN_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const PHONE_PATTERN = /^(0|\+84)\d{8,10}$/;

const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const ManageAppointments = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.STAFF),
  );

/** Current date (YYYY-MM-DD) and time (HH:mm) at the spa, independent of the server time zone. */
export function businessNow(now = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

/** `@db.Date` columns are read and written as UTC midnight. */
export function toDateOnly(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || formatDateOnly(date) !== value
    ? null
    : date;
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
