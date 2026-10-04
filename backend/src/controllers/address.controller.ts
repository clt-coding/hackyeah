import { Request, Response } from 'express';
import * as addressService from '../services/address.service.js';
import { AddressError } from '../services/address.service.js';
import { AddressType } from '../types/address.js';
import type { CreateAddressInput, UpdateAddressInput } from '../types/address.js';

const REQUIRED_STRINGS = ['name', 'postalCode', 'city', 'street', 'building_number'] as const;
const ALLOWED_FIELDS = [
  'type', 'name', 'country', 'postalCode', 'city', 'street',
  'building_number', 'unit_number', 'lat', 'lng',
];
const ALLOWED_TYPES = Object.values(AddressType).filter((v): v is number => typeof v === 'number');

const isNonEmptyString = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/**
 * authenticateToken zapisuje zdekodowany payload JWT w req.user.
 * Obecnie generateJWT wpisuje do pola `email` to, co dostanie od kontrolera auth:
 *  - zwykły email (string)                   -> szukamy użytkownika po emailu,
 *  - cały obiekt użytkownika (aktualnie tak) -> bierzemy z niego `id`.
 * Obie wersje są obsłużone, więc po ewentualnej poprawce generateJWT nic się nie zepsuje.
 */
async function currentUserId(req: Request): Promise<string> {
  const claim = (req as any).user?.email;

  if (typeof claim === 'string' && claim) {
    return addressService.findUserIdByEmail(claim);
  }
  if (claim && typeof claim === 'object' && typeof claim.id === 'string' && claim.id) {
    return claim.id;
  }
  throw new AddressError('Unauthorized', 401);
}

function handleError(res: Response, error: unknown) {
  if (error instanceof AddressError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Address controller error:', error);
  return res.status(500).json({ error: 'Internal Server Error' });
}

/**
 * Waliduje pola obecne w body. Przy tworzeniu (requireAll) wymaga też pól obowiązkowych.
 * Zwraca komunikat błędu albo null.
 */
function validate(body: Record<string, unknown>, requireAll: boolean): string | null {
  if (body.type === undefined) {
    if (requireAll) return 'type is required';
  } else if (typeof body.type !== 'number' || !ALLOWED_TYPES.includes(body.type)) {
    return `type must be one of: ${ALLOWED_TYPES.join(', ')}`;
  }

  for (const field of REQUIRED_STRINGS) {
    if (body[field] === undefined) {
      if (requireAll) return `${field} is required`;
    } else if (!isNonEmptyString(body[field])) {
      return `${field} must be a non-empty string`;
    }
  }
  if (body.country !== undefined && !isNonEmptyString(body.country)) {
    return 'country must be a non-empty string';
  }

  // unit_number, lat, lng mogą być pominięte albo null (null czyści wartość)
  const unit = body.unit_number;
  if (unit !== undefined && unit !== null && !isNonEmptyString(unit)) {
    return 'unit_number must be a non-empty string or null';
  }
  const lat = body.lat;
  if (lat !== undefined && lat !== null && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    return 'lat must be a number between -90 and 90, or null';
  }
  const lng = body.lng;
  if (lng !== undefined && lng !== null && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
    return 'lng must be a number between -180 and 180, or null';
  }
  return null;
}

/** Zostawia tylko znane pola - userId, id, createdAt nie mogą przyjść z body. */
function pickAllowed(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) => ALLOWED_FIELDS.includes(key) && value !== undefined),
  );
}

export async function createAddress(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const invalid = validate(body, true);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    const userId = await currentUserId(req);
    const address = await addressService.createAddress(
      userId,
      pickAllowed(body) as unknown as CreateAddressInput,
    );
    return res.status(201).json({ message: 'Address created', address });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getAddresses(req: Request, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  let type: AddressType | undefined;
  if (req.query.type !== undefined) {
    const parsed = Number(req.query.type);
    if (!ALLOWED_TYPES.includes(parsed)) {
      return res.status(400).json({ error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` });
    }
    type = parsed as AddressType;
  }

  try {
    const userId = await currentUserId(req);
    const addresses = await addressService.getAddresses(userId, { type, limit, offset });
    return res.status(200).json({ addresses, limit, offset });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getAddress(req: Request, res: Response) {
  try {
    const userId = await currentUserId(req);
    const address = await addressService.getAddressById(userId, req.params.id as string);
    return res.status(200).json({ address });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateAddress(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const invalid = validate(body, false);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  const input = pickAllowed(body) as UpdateAddressInput;
  if (Object.keys(input).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  try {
    const userId = await currentUserId(req);
    const address = await addressService.updateAddress(userId, req.params.id as string, input);
    return res.status(200).json({ message: 'Address updated', address });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteAddress(req: Request, res: Response) {
  try {
    const userId = await currentUserId(req);
    await addressService.deleteAddress(userId, req.params.id as string);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}