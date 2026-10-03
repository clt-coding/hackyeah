import { db } from "../libs/db.js";
import { geocodeAddress } from "../services/geocode.service.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const all: any[] = await db.orm.public.Institution.all();
let todo = all.filter((i) => i.lat == null);

console.log(`Zapytań do ORS: ${todo.length}`);

for (const i of todo) {
  try {
    const c = await geocodeAddress(i.street, i.building_number, i.city);
    console.log(i.name, "->", c);

    if (c) {
      await db.orm.public.Institution.where({ id: i.id }).update({
        lat: Number(c.lat.toFixed(6)),
        lng: Number(c.lng.toFixed(6)),
      });
    }
  } catch (e) {
    console.error(i.name, "błąd:", String(e));
    if (/40[39]/.test(String(e))) break;
  }
  await sleep(200);
}

await db.close();
