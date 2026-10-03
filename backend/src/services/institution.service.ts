import { db } from "./../libs/db.js";
//SPRAWDZIC CZY DZIALA!!!
export interface InstitutionResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_in_meters: number;
}

export async function getNearbyInstitutions(
  homeLat: number,
  homeLng: number,
  radiusInKm: number,
): Promise<InstitutionResult[]> {
  const radiusInMeters = radiusInKm * 1000;
  //
  // db.raw.sql wywołujemy bezpośrednio z grawisami `` (jako template literal)
  const rawResult = await db.raw.sql`
    SELECT 
      i.name,
      i.city,
      i.type,
      i.opening_hours,
      i.closing_hours,
      i.lat,
      i.lng,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(${homeLng},${homeLat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography
      ) AS distance_in_meters
    FROM "institution" i
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint(${homeLng},${homeLat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography,
      ${radiusInMeters}
    )
    ORDER BY distance_in_meters ASC;
  `;

  // Bezpieczna obsługa wyniku – zależnie od tego, czy sterownik zwraca tablicę bezpośrednio, czy w polu .rows
  const rows = Array.isArray(rawResult)
    ? rawResult
    : (rawResult as any)?.rows || [];

  return rows as InstitutionResult[];
}
