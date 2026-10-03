// import { db } from "./../libs/db.js";
// //SPRAWDZIC CZY DZIALA!!!
// export interface InstitutionResult {
//   name: string;
//   address: string;
//   lat: number;
//   lng: number;
//   distance_in_meters: number;
// }

// export async function getNearbyInstitutions(
//   homeLat: number,
//   homeLng: number,
//   radiusInKm: number,
// ): Promise<InstitutionResult[]> {
//   const radiusInMeters = radiusInKm * 1000;
//   //
//   // db.raw.sql wywołujemy bezpośrednio z grawisami `` (jako template literal)
//   const rawResult = await db.raw.sql`
//     SELECT
//       i.name,
//       i.city,
//       i.type,
//       i.opening_hours,
//       i.closing_hours,
//       i.lat,
//       i.lng,
//       ST_Distance(
//         ST_SetSRID(ST_MakePoint(${homeLng},${homeLat}), 4326)::geography,
//         ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography
//       ) AS distance_in_meters
//     FROM "Institution" i
//     WHERE ST_DWithin(
//       ST_SetSRID(ST_MakePoint(${homeLng},${homeLat}), 4326)::geography,
//       ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography,
//       ${radiusInMeters}
//     )
//     ORDER BY distance_in_meters ASC;
//   `;

//   // Bezpieczna obsługa wyniku – zależnie od tego, czy sterownik zwraca tablicę bezpośrednio, czy w polu .rows
//   const rows = Array.isArray(rawResult)
//     ? rawResult
//     : (rawResult as any)?.rows || [];

//   return rows as InstitutionResult[];
// }

import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function getNearbyInstitutions(
  homeLat: number,
  homeLng: number,
  radiusInKm: number,
) {
  const { rows } = await pool.query(
    `
    SELECT
      i.id,
      i.name,
      concat_ws(' ', i.street, i.building_number) || ', ' || i.city AS address,
      i.type, i.opening_hours, i.closing_hours, i.lat, i.lng,
      ST_Distance(
        ST_SetSRID(ST_MakePoint($1::float8, $2::float8), 4326)::geography,
        ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography
      ) AS distance_in_meters
    FROM institution i
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint($1::float8, $2::float8), 4326)::geography,
      ST_SetSRID(ST_MakePoint(i.lng, i.lat), 4326)::geography,
      $3::float8
    )
    ORDER BY distance_in_meters ASC
    `,
    [homeLng, homeLat, radiusInKm * 1000],
  );

  return rows.map((r) => ({
    ...r,
    distance_in_meters: Number(r.distance_in_meters),
  }));
}
