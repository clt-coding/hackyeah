import { apiCall } from "./client";

export interface Institution {
  id: string;
  name: string;
  type: 0 | 1; // 0 = Kindergarten, 1 = Nursery
  country: string;
  postalCode: string;
  city: string;
  street: string;
  building_number: string;
  unit_number: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: string;
  closing_hours: string;
}

export async function getAllInstitutions(): Promise<Institution[]> {
  const data = await apiCall("/api/institutions");
  return data.institutions;
}

export function ageToInstitutionType(age: number): 0 | 1 {
  return age < 3 ? 1 : 0; // under 3 -> Nursery, 3+ -> Kindergarten
}
