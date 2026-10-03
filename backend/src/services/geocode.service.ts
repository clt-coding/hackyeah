export async function geocodeAddress(
  street: string,
  houseNumber: string,
  city: string,
) {
  const url = new URL(
    "https://api.openrouteservice.org/geocode/search/structured",
  );
  url.searchParams.set("api_key", process.env.ORS_API_KEY!);
  url.searchParams.set("address", `${street} ${houseNumber}`);
  url.searchParams.set("locality", city);
  url.searchParams.set("country", "PL");
  url.searchParams.set("size", "1");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`ORS error ${res.status}`);

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null; // nie znaleziono adresu

  const [lng, lat] = feature.geometry.coordinates; // uwaga: lng jest PIERWSZE
  return { lat, lng };
}
