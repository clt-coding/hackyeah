import { apiCall } from "./client";

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocode(
  street: string,
  houseNumber: string,
  city = "Kraków",
): Promise<GeocodeResult> {
  const params = new URLSearchParams({ street, houseNumber, city });
  return apiCall(`/api/geocode?${params}`);
}
