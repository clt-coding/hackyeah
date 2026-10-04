import { Request, Response } from 'express';
import * as daycareService from '../services/daycare.service.js';
import { DaycareError } from '../services/daycare.service.js';
import type { CreateDaycareInput, UpdateDaycareInput } from '../types/daycare.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const REQUIRED_STRINGS = ['name', 'postalCode', 'city', 'street', 'building_number'] as const;
const OPTIONAL_STRINGS = ['country'] as const;

function handleError(res: Response, error: unknown) {
  if (error instanceof DaycareError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Daycare controller error:', error);
  return res.status(500).json({ error: 'Internal Server Error' });
}

const isNonEmptyString = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/**
 * Waliduje pola, które są obecne w body. Przy tworzeniu (requireAll) wymaga też pól obowiązkowych.
 * Zwraca komunikat błędu albo null.
 */
function validate(body: Record<string, unknown>, requireAll: boolean): string | null {
  for (const field of REQUIRED_STRINGS) {
    if (body[field] === undefined) {
      if (requireAll) return `${field} is required`;
    } else if (!isNonEmptyString(body[field])) {
      return `${field} must be a non-empty string`;
    }
  }
  for (const field of OPTIONAL_STRINGS) {
    if (body[field] !== undefined && !isNonEmptyString(body[field])) {
      return `${field} must be a non-empty string`;
    }
  }

  for (const field of ['opening_hours', 'closing_hours'] as const) {
    if (body[field] === undefined) {
      if (requireAll) return `${field} is required`;
    } else if (typeof body[field] !== 'string' || !TIME_REGEX.test(body[field] as string)) {
      return `${field} must be in HH:MM or HH:MM:SS format`;
    }
  }

  //unit_number, lat, lng mogą być pominięte albo null (null czyści wartość)
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

export async function createDaycare(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const invalid = validate(body, true);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    const daycare = await daycareService.createDaycare(body as unknown as CreateDaycareInput);
    return res.status(201).json({ message: 'Daycare created', daycare });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getDaycares(req: Request, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const city = typeof req.query.city === 'string' && req.query.city.trim() ? req.query.city.trim() : undefined;
  const search = typeof req.query.search === 'string' && req.query.search.trim() ? req.query.search.trim() : undefined;

  try {
    const daycares = await daycareService.getDaycares({ city, search, limit, offset });
    return res.status(200).json({ daycares, limit, offset });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getDaycare(req: Request, res: Response) {
  try {
    const daycare = await daycareService.getDaycareById(req.params.id as string);
    return res.status(200).json({ daycare });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateDaycare(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const invalid = validate(body, false);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  //przepuszczamy tylko znane pola (id, createdAt itd. nie można zmienić przez API)
  const allowed = [
    'name', 'country', 'postalCode', 'city', 'street', 'building_number',
    'unit_number', 'lat', 'lng', 'opening_hours', 'closing_hours',
  ];
  const input = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => allowed.includes(key) && value !== undefined),
  ) as UpdateDaycareInput;

  if (Object.keys(input).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  try {
    const daycare = await daycareService.updateDaycare(req.params.id as string, input);
    return res.status(200).json({ message: 'Daycare updated', daycare });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteDaycare(req: Request, res: Response) {
  try {
    await daycareService.deleteDaycare(req.params.id as string);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}