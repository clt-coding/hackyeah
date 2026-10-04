// src/prisma/db.ts
import 'dotenv/config';
import { Temporal } from '@js-temporal/polyfill';

import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../prisma/contract.d.ts';
import contractJson from '../prisma/contract.json' with { type: 'json' };

if (!(globalThis as any).Temporal) {
    (globalThis as any).Temporal = Temporal;
}

export const db = postgres<Contract>({
    contractJson,
    url: process.env['DATABASE_URL']!,
});
