import { Temporal } from 'temporal-polyfill';
import { all, and } from '@prisma/orm-postgres/orm-client';
import { db } from '../libs/db.js';

(globalThis as any).Temporal ??= Temporal;

import type {
  CreateAddressInput,
  UpdateAddressInput,
  ListAddressesFilters,
} from '../types/address.js';

export class AddressError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Zamienia email z tokenu na id użytkownika. */
export async function findUserIdByEmail(email: string): Promise<string> {
  const user = await db.orm.public.User.first({ email });
  if (!user) {
    throw new AddressError('Unauthorized', 401);
  }
  return user.id;
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  return db.orm.public.Address.create({
    userId,
    type: input.type,
    name: input.name,
    country: input.country ?? 'Polska',
    postalCode: input.postalCode,
    city: input.city,
    street: input.street,
    building_number: input.building_number,
    ...(input.unit_number !== undefined && { unit_number: input.unit_number }),
    ...(input.lat !== undefined && { lat: input.lat }),
    ...(input.lng !== undefined && { lng: input.lng }),
  });
}

export async function getAddresses(userId: string, filters: ListAddressesFilters) {
  return db.orm.public.Address.where((a) =>
    and(
      a.userId.eq(userId),
      filters.type !== undefined ? a.type.eq(filters.type) : all(),
    ),
  )
    .orderBy([(a) => a.createdAt.desc(), (a) => a.id.asc()])
    .limit(filters.limit)
    .offset(filters.offset)
    .all();
}

export async function getAddressById(userId: string, id: string) {
  // Filtr po userId: cudzy adres wygląda tak samo jak nieistniejący (404)
  const address = await db.orm.public.Address.first({ id, userId });
  if (!address) {
    throw new AddressError('Address not found', 404);
  }
  return address;
}

export async function updateAddress(userId: string, id: string, input: UpdateAddressInput) {
  const data = {
    ...(input.type !== undefined && { type: input.type }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.country !== undefined && { country: input.country }),
    ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
    ...(input.city !== undefined && { city: input.city }),
    ...(input.street !== undefined && { street: input.street }),
    ...(input.building_number !== undefined && { building_number: input.building_number }),
    ...(input.unit_number !== undefined && { unit_number: input.unit_number }),
    ...(input.lat !== undefined && { lat: input.lat }),
    ...(input.lng !== undefined && { lng: input.lng }),
    // `updatedAt` ma w bazie tylko default przy INSERT, więc odświeżamy go ręcznie
    updatedAt: Temporal.Now.instant(),
  };

  const updated = await db.orm.public.Address.where({ id, userId }).update(data);
  if (!updated) {
    throw new AddressError('Address not found', 404);
  }
  return updated;
}

export async function deleteAddress(userId: string, id: string) {
  const deleted = await db.orm.public.Address.where({ id, userId }).delete();
  if (!deleted) {
    throw new AddressError('Address not found', 404);
  }
  return deleted;
}