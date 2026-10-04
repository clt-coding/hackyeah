import { getUserHomeLocation } from "./services/user.service.js";
import { getNearbyInstitutions } from "./services/institution.service.js";

const userHome = await getUserHomeLocation(
  "c0a80101-0000-4000-8000-000000000100",
);
if (!userHome) {
  throw new Error("Użytkownik nie ma ustawionej lokalizacji domowej");
} else {
  const institutions = await getNearbyInstitutions(
    userHome.lat,
    userHome.lng,
    2,
  );
  console.log("Nearby institutions:", institutions);
}
