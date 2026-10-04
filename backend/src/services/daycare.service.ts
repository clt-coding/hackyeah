import { Temporal } from 'temporal-polyfill';
import { all, and } from '@prisma/orm-postgres/orm-client';
import { db } from '../libs/db.js';

(globalThis as any).Temporal ??= Temporal;

import type {
  CreateDaycareInput,
  UpdateDaycareInput,
  ListDaycaresFilters,
} from '../types/daycare.js';

export class DaycareError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** "07:30" -> "07:30:00" -> Temporal.PlainTime (kodek pg/time-temporal wymaga obiektu Temporal) */
function toTime(value: string) {
  const full = value.length === 5 ? `${value}:00` : value;
  return Temporal.PlainTime.from(full);
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

export async function createDaycare(input: CreateDaycareInput) {
  const opening = toTime(input.opening_hours);
  const closing = toTime(input.closing_hours);
  if (Temporal.PlainTime.compare(opening, closing) >= 0) {
    throw new DaycareError('opening_hours must be earlier than closing_hours', 400);
  }

  return db.orm.public.Daycare.create({
    name: input.name,
    country: input.country ?? 'Polska',
    postalCode: input.postalCode,
    city: input.city,
    street: input.street,
    building_number: input.building_number,
    ...(input.unit_number !== undefined && { unit_number: input.unit_number }),
    ...(input.lat !== undefined && { lat: input.lat }),
    ...(input.lng !== undefined && { lng: input.lng }),
    opening_hours: opening,
    closing_hours: closing,
  });
}

export async function getDaycares(filters: ListDaycaresFilters) {
  return db.orm.public.Daycare.where((d) =>
    and(
      filters.city ? d.city.ilike(escapeLike(filters.city)) : all(),
      filters.search ? d.name.ilike(`%${escapeLike(filters.search)}%`) : all(),
    ),
  )
    .orderBy([(d) => d.name.asc(), (d) => d.id.asc()]) //stabilna kolejność przy stronicowaniu
    .limit(filters.limit)
    .offset(filters.offset)
    .all();
}

export async function getDaycareById(id: string) {
  const daycare = await db.orm.public.Daycare.where({ id }).first();
  if (!daycare) {
    throw new DaycareError('Daycare not found', 404);
  }
  return daycare;
}

export async function updateDaycare(id: string, input: UpdateDaycareInput) {
  const existing = await db.orm.public.Daycare.where({ id }).first();
  if (!existing) {
    throw new DaycareError('Daycare not found', 404);
  }

  const opening = input.opening_hours !== undefined ? toTime(input.opening_hours) : undefined;
  const closing = input.closing_hours !== undefined ? toTime(input.closing_hours) : undefined;

  //przy zmianie tylko jednej godziny porównujemy ją z tą, która już jest w bazie
  if (opening || closing) {
    const effectiveOpening = opening ?? Temporal.PlainTime.from(existing.opening_hours);
    const effectiveClosing = closing ?? Temporal.PlainTime.from(existing.closing_hours);
    if (Temporal.PlainTime.compare(effectiveOpening, effectiveClosing) >= 0) {
      throw new DaycareError('opening_hours must be earlier than closing_hours', 400);
    }
  }

  const data = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.country !== undefined && { country: input.country }),
    ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
    ...(input.city !== undefined && { city: input.city }),
    ...(input.street !== undefined && { street: input.street }),
    ...(input.building_number !== undefined && { building_number: input.building_number }),
    ...(input.unit_number !== undefined && { unit_number: input.unit_number }),
    ...(input.lat !== undefined && { lat: input.lat }),
    ...(input.lng !== undefined && { lng: input.lng }),
    ...(opening && { opening_hours: opening }),
    ...(closing && { closing_hours: closing }),
    // `updatedAt` ma w bazie tylko default przy INSERT, więc odświeżamy go ręcznie
    updatedAt: Temporal.Now.instant(),
  };

  const updated = await db.orm.public.Daycare.where({ id }).update(data);
  if (!updated) {
    throw new DaycareError('Daycare not found', 404);
  }
  return updated;
}

export async function deleteDaycare(id: string) {
  const deleted = await db.orm.public.Daycare.where({ id }).delete();
  if (!deleted) {
    throw new DaycareError('Daycare not found', 404);
  }
  return deleted;
}