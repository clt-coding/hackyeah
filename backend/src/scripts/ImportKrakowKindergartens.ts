/**
 * Uruchomienie (z katalogu backend):
 *   npx tsx src/scripts/importKrakowKindergartens.ts --dry-run   # tylko podgląd
 *   npx tsx src/scripts/importKrakowKindergartens.ts             # zapis do bazy
 */
import { Temporal } from 'temporal-polyfill';
import { db } from '../libs/db.js';
import { InstitutionType } from '../types/institutions.js';

(globalThis as any).Temporal ??= Temporal;

const RESOURCE_ID = 1254769;
const API_URL = `https://api.dane.gov.pl/1.4/resources/${RESOURCE_ID}/data`;
const PER_PAGE = 100; // maksimum w API

const KINDERGARTEN_TYPE = InstitutionType.Kindergarten; // wartość kolumny `type` oznaczająca przedszkole
const COUNTRY = 'Polska';

// Warianty godzin otwarcia i zamknięcia
const WORKING_HOURS_VARIANTS = [
  { opening: '06:00:00', closing: '16:30:00' },
  { opening: '06:30:00', closing: '17:00:00' },
  { opening: '07:00:00', closing: '17:00:00' },
  { opening: '07:00:00', closing: '17:30:00' },
  { opening: '06:30:00', closing: '16:30:00' },
  { opening: '07:30:00', closing: '18:00:00' },
];

/** 
 * Przypisuje wariant godzin w sposób stały dla danego id (RSPO).
 * Dzięki temu kolejne uruchomienia skryptu nadadzą tej samej placówce te same godziny.
 */
function getWorkingHoursForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % WORKING_HOURS_VARIANTS.length;
  return WORKING_HOURS_VARIANTS[index];
}
// ------------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run');

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

type Row = Record<string, string>; // etykieta kolumny (znormalizowana) -> wartość

/** API zwraca komórki jako obiekty (np. { val, repr }), nie jako zwykły tekst. */
function cellValue(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const inner = o.val ?? o.repr ?? o.value;
    return inner == null ? JSON.stringify(v) : String(inner).trim();
  }
  return String(v).trim();
}

async function fetchPage(query: string, page: number, attempts = 4): Promise<any> {
  const url = `${API_URL}?page=${page}&per_page=${PER_PAGE}&q=${encodeURIComponent(query)}`;
  for (let i = 1; i <= attempts; i++) {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } });
    if (res.ok) return res.json();
    console.warn(`API ${res.status} (próba ${i}/${attempts}) dla strony ${page}, q="${query}"`);
    if (i < attempts) await new Promise((r) => setTimeout(r, 1500 * i));
  }
  return null; // trwały błąd - wołający decyduje co dalej
}

/** Zamienia {col1: "..."} na { "numer rspo": "..." } na podstawie meta.headers_map (jeśli jest). */
function toRows(json: any): Row[] {
  const headersMap: Record<string, string> | undefined =
    json?.meta?.headers_map ?? json?.meta?.data_schema?.headers_map;

  return (json.data as any[]).map((item) => {
    const row: Row = {};
    for (const [key, value] of Object.entries(item.attributes ?? {})) {
      const label = headersMap?.[key] ?? key;
      row[norm(label)] = cellValue(value);
    }
    return row;
  });
}

/** Szuka wartości po liście kandydatów: najpierw dokładne dopasowanie etykiety, potem "zaczyna się od". */
function pick(row: Row, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const c of candidates) {
    if (c in row) return row[c];
  }
  for (const c of candidates) {
    const k = keys.find((key) => key.startsWith(c));
    if (k) return row[k];
  }
  return '';
}

function mapRow(row: Row) {
  return {
    id: pick(row, ['rspo']),
    name: pick(row, ['nazwa placowki']),
    typeLabel: pick(row, ['typ podmiotu']),
    city: pick(row, ['miejscowosc']),
    street: pick(row, ['ulica']),
    buildingNumber: pick(row, ['numer domu']),
    unitNumber: pick(row, ['numer lokalu']) || null,
    postalCode: pick(row, ['kod pocztowy']),
  };
}

function isKrakowKindergarten(r: ReturnType<typeof mapRow>) {
  // W danych miejscowość to np. "Kraków", "Kraków-Podgórze", "Kraków-Śródmieście"
  const city = norm(r.city);
  const isKrakow = city === 'krakow' || city.startsWith('krakow ');
  const type = norm(r.typeLabel);
  // "Przedszkole", "Punkt przedszkolny", "Zespół wychowania przedszkolnego"
  const isKindergarten =
    type.startsWith('przedszkol') ||
    type.startsWith('punkt przedszkoln') ||
    type.includes('wychowania przedszkolnego');
  return isKrakow && isKindergarten;
}

const QUERIES = [
  'Kraków AND przedszkole',
  'Kraków AND przedszkolny',
  'Kraków AND przedszkolnego',
];

async function main() {
  const byId = new Map<string, ReturnType<typeof mapRow>>();
  let total = 0;
  let loggedSample = false;

  for (const query of QUERIES) {
    let page = 1;
    while (true) {
      const json = await fetchPage(query, page);
      if (!json) {
        console.warn(`Przerywam q="${query}" na stronie ${page} (trwały błąd API). Zachowuję dotychczasowe wyniki.`);
        break;
      }
      const rows = toRows(json);
      if (rows.length === 0) break;

      if (!loggedSample) {
        console.log('Surowy atrybut (1. rekord):', JSON.stringify((json.data[0] as any).attributes).slice(0, 400));
        console.log('Przykładowy rekord po mapowaniu:', mapRow(rows[0]));
        loggedSample = true;
      }

      for (const row of rows) {
        const mapped = mapRow(row);
        if (mapped.id && isKrakowKindergarten(mapped)) byId.set(mapped.id, mapped);
      }
      total += rows.length;
      console.log(`q="${query}" strona ${page}: ${rows.length} rekordów (unikalnych przedszkoli: ${byId.size})`);

      if (!json?.links?.next) break;
      page++;
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const collected = [...byId.values()];
  console.log(`Pobrano ${total} rekordów, do importu: ${collected.length}`);

  if (DRY_RUN) {
    const sample = collected.slice(0, 5).map((r) => {
      const hours = getWorkingHoursForId(r.id);
      return { ...r, opening_hours: hours.opening, closing_hours: hours.closing };
    });
    console.log('DRY RUN - pierwsze 5 z przypisanymi godzinami:', sample);
    return;
  }

  let ok = 0;
  for (const r of collected) {
    const hours = getWorkingHoursForId(r.id);

    const data = {
      name: r.name,
      city: 'Kraków',
      country: COUNTRY,
      street: r.street,
      building_number: r.buildingNumber,
      unit_number: r.unitNumber,
      postalCode: r.postalCode,
      type: KINDERGARTEN_TYPE,
      // Kodek pg/time-temporal wymaga obiektów Temporal, nie stringów
      opening_hours: Temporal.PlainTime.from(hours.opening),
      closing_hours: Temporal.PlainTime.from(hours.closing),
    };

    await db.orm.public.Institution.upsert({
      create: { id: r.id, ...data },
      update: data,
    });
    ok++;
  }
  console.log(`Zapisano ${ok} placówek.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.close());