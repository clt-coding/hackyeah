import { db } from "../libs/db.js";

const all: any[] = await db.orm.public.Institution.all();

for (const i of all) {
  if (!i.street) continue;

  const street = i.street.replace(/^\s*(os|ul|al|pl)\.?\s+/i, "").trim();
  if (street === i.street) continue;

  await db.orm.public.Institution.where({ id: i.id }).update({ street });
  console.log(`${i.street} -> ${street}`);
}

await db.close();
