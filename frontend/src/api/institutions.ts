import { apiCall } from "./client";
import type { Place } from "../types";

interface Institution {
  id: string;
  name: string;
  address: string;
  type: 0 | 1; // 0 = Kindergarten, 1 = Nursery
  opening_hours: string;
  closing_hours: string;
  lat: number;
  lng: number;
  distance_in_meters: number;
}

// nwm narazie takie cos do filtrowania, ale jak wpadnie algorytm wery to podmienimy
export async function getNearbyInstitutions(
  street: string,
  houseNumber: string,
  radiusKm: number,
): Promise<Institution[]> {
  const params = new URLSearchParams({
    street,
    houseNumber,
    radius: String(radiusKm),
  });
  return apiCall(`/api/institutions/nearby?${params}`);
}

export function ageToInstitutionType(age: number): 0 | 1 {
  return age < 3 ? 1 : 0; // under 3 -> Nursery, 3+ -> Kindergarten
}

export function institutionToPlace(institution: Institution): Place {
  return {
    id: institution.id,
    name: institution.name,
    type: "daycare",
    hours: `${institution.opening_hours} - ${institution.closing_hours}`,
    openingHours: institution.opening_hours,
    closingHours: institution.closing_hours,
    distance: `${(institution.distance_in_meters / 1000).toFixed(1)} km`,
    lat: institution.lat,
    lng: institution.lng,
  };
}
