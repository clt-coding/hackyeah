import { db } from "./../libs/db.js";

interface UserLocation {
  lat: number;
  lng: number;
}

export async function getUserHomeLocation(
  userId: string,
  homeTypeEnum: number = 1, // Sprawdź z B1, jaki ID ma 'Dom główny'
): Promise<UserLocation | null> {
  //POBIERAMY ADRES UŻYWAJĄC SKŁADNI ORM:
  const homeAddress = await db.orm.public.Address.first({
    userId: userId,
    type: homeTypeEnum,
  });

  if (!homeAddress || homeAddress.lat === null || homeAddress.lng === null) {
    return null;
  }

  return {
    lat: Number(homeAddress.lat),
    lng: Number(homeAddress.lng),
  };
}
