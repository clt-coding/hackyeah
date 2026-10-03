import { db }from './../libs/db.js';

import { all } from '@prisma/orm-postgres/orm-client';

import type {
  CreateNannyInput,
  UpdateNannyInput,
  ListNanniesFilters,
} from '../types/nanny.js';

export class NannyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function toPublicNanny<
  T extends { user?: { id: string; name: string; surname: string } | null },
>(nanny: T) {
  const { user, ...rest } = nanny;
  return {
    ...rest,
    user: user ? { id: user.id, name: user.name, surname: user.surname } : null,
  };
}

export async function createNanny(input: CreateNannyInput) {
  const user = await db.orm.public.User.first({ id: input.userId });
  if (!user) {
    throw new NannyError('User not found', 404);
  }

  const existing = await db.orm.public.Nanny.first({ userId: input.userId });
  if (existing) {
    throw new NannyError('Nanny profile already exists for this user', 409);
  }

  //pola z wartością domyślną w kontrakcie (hourly_wage, availability) można pominąć
  return db.orm.public.Nanny.create({
    userId: input.userId,
    phone_number: input.phone_number,
    ...(input.hourly_wage !== undefined && { hourly_wage: input.hourly_wage }),
    ...(input.availability !== undefined && { availability: input.availability }),
  });
}

export async function getNannies(filters: ListNanniesFilters) {
  const nannies = await db.orm.public.Nanny.include('user')
    .where((n) => (filters.availableOnly ? n.availability.eq(true) : all()))
    .orderBy([
      (n) => n.rating.desc({ nulls: 'last' }),
      (n) => n.id.asc(), //stabilna kolejność przy stronicowaniu
    ])
    .limit(filters.limit)
    .offset(filters.offset)
    .all();

  return nannies.map(toPublicNanny);
}

export async function getNannyById(id: string) {
  const nanny = await db.orm.public.Nanny.include('user').where({ id }).first();
  if (!nanny) {
    throw new NannyError('Nanny not found', 404);
  }
  return toPublicNanny(nanny);
}

export async function updateNanny(id: string, input: UpdateNannyInput) {
  const data: UpdateNannyInput = {};
  if (input.phone_number !== undefined) data.phone_number = input.phone_number;
  if (input.hourly_wage !== undefined) data.hourly_wage = input.hourly_wage;
  if (input.availability !== undefined) data.availability = input.availability;

  const updated = await db.orm.public.Nanny.where({ id }).update(data);
  if (!updated) {
    throw new NannyError('Nanny not found', 404);
  }
  return updated;
}

export async function deleteNanny(id: string) {
  const deleted = await db.orm.public.Nanny.where({ id }).delete();
  if (!deleted) {
    throw new NannyError('Nanny not found', 404);
  }
  return deleted;
}