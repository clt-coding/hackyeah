import { Request, Response } from 'express';
import * as nannyService from '../services/nanny.service.js';
import { NannyError } from '../services/nanny.service.js';

interface NannyBody {
  phone_number?: string;
  hourly_wage?: number;
  availability?: boolean;
}

/**
 * authenticateToken zapisuje zdekodowany payload JWT w req.user.
 * Obecnie generateJWT wpisuje do pola `email` to, co dostanie od kontrolera auth:
 *  - zwykły email (string)                   -> szukamy użytkownika po emailu,
 *  - cały obiekt użytkownika (aktualnie tak) -> bierzemy z niego `id`.
 */
async function currentUserId(req: Request): Promise<string> {
  const claim = (req as any).user?.email;

  if (typeof claim === 'string' && claim) {
    return nannyService.findUserIdByEmail(claim);
  }
  if (claim && typeof claim === 'object' && typeof claim.id === 'string' && claim.id) {
    return claim.id;
  }
  throw new NannyError('Unauthorized', 401);
}

function handleError(res: Response, error: unknown) {
  if (error instanceof NannyError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Nanny controller error:', error);
  return res.status(500).json({ error: 'Internal Server Error' });
}

/** Zwraca komunikat błędu albo null, jeśli pola opcjonalne są poprawne. */
function validateOptionalFields(body: NannyBody): string | null {
  const { phone_number, hourly_wage, availability } = body;

  if (phone_number !== undefined && (typeof phone_number !== 'string' || !phone_number.trim())) {
    return 'phone_number must be a non-empty string';
  }
  if (
    hourly_wage !== undefined &&
    (typeof hourly_wage !== 'number' || !Number.isFinite(hourly_wage) || hourly_wage < 0)
  ) {
    return 'hourly_wage must be a non-negative number';
  }
  if (availability !== undefined && typeof availability !== 'boolean') {
    return 'availability must be a boolean';
  }
  return null;
}

export async function createNanny(req: Request, res: Response) {
  const body = req.body as NannyBody;

  if (!body.phone_number) {
    return res.status(400).json({ error: 'phone_number is required' });
  }
  const invalid = validateOptionalFields(body);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  try {
    // userId zawsze z tokenu - nie przyjmujemy go z body
    const userId = await currentUserId(req);
    const nanny = await nannyService.createNanny({
      userId,
      phone_number: body.phone_number.trim(),
      hourly_wage: body.hourly_wage,
      availability: body.availability,
    });
    return res.status(201).json({ message: 'Nanny created', nanny });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getNannies(req: Request, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const availableOnly = req.query.availableOnly === 'true';

  try {
    const nannies = await nannyService.getNannies({ availableOnly, limit, offset });
    return res.status(200).json({ nannies, limit, offset });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getNanny(req: Request, res: Response) {
  try {
    const nanny = await nannyService.getNannyById(req.params.id as string);
    return res.status(200).json({ nanny });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateNanny(req: Request, res: Response) {
  const body = req.body as NannyBody;

  const invalid = validateOptionalFields(body);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  if (
    body.phone_number === undefined &&
    body.hourly_wage === undefined &&
    body.availability === undefined
  ) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  try {
    const nanny = await nannyService.updateNanny(req.params.id as string, {
      phone_number: body.phone_number?.trim(),
      hourly_wage: body.hourly_wage,
      availability: body.availability,
    });
    return res.status(200).json({ message: 'Nanny updated', nanny });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteNanny(req: Request, res: Response) {
  try {
    await nannyService.deleteNanny(req.params.id as string);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}