import { apiCall } from "./client";
import type { Place } from "../types";

export interface Daycare {
  id: string;
  name: string;
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

export async function getDaycares(): Promise<Daycare[]> {
  const data = await apiCall("/api/daycares");
  return data.daycares;
}

export function daycareToPlace(daycare: Daycare): Place {
  return {
    id: daycare.id,
    name: daycare.name,
    type: "daycare",
    hours: `${daycare.opening_hours} - ${daycare.closing_hours}`,
    openingHours: daycare.opening_hours,
    closingHours: daycare.closing_hours,
    lat: daycare.lat ?? undefined,
    lng: daycare.lng ?? undefined,
  };
}
