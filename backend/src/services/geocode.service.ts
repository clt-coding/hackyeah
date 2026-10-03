export async function geocodeAddress(
  street: string,
  houseNumber: string,
  city: string,
) {
  const url = new URL("https://services.gugik.gov.pl/uug/");
  url.searchParams.set("request", "GetAddress");
  url.searchParams.set("address", `${city}, ${street} ${houseNumber}`);
  url.searchParams.set("srid", "4326");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`UUG error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const r = data.results?.["1"];
  if (!r) return null; // nie znaleziono adresu

  return { lat: Number(r.y), lng: Number(r.x) };
}
