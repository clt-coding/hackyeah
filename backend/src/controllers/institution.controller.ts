import { Request, Response } from "express";
import * as institutionService from "../services/institution.service.js";
import { geocodeAddress } from "../services/geocode.service.js";
import { getUserHomeLocation } from "../services/user.service.js";
import jwt from "jsonwebtoken";

export async function getNearbyInstitutions(req: Request, res: Response) {
  try {
    const { street, houseNumber, radius } = req.query as {
      street?: string;
      houseNumber?: string;
      radius?: string;
    };
    const token = req.cookies.token;
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    const radiusKm = parseFloat(radius ?? "");
    if (
      !street ||
      !houseNumber ||
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 50
    ) {
      return res
        .status(400)
        .json({ error: "Required: street, houseNumber, radius (0-50 km)" });
    }

    const workGeocode = await geocodeAddress(street, houseNumber, "Kraków");
    if (!workGeocode) {
      return res.status(400).json({ error: "Work address not found" });
    }

    const homeLocation = await getUserHomeLocation(userId);
    if (!homeLocation) {
      return res
        .status(400)
        .json({ error: "User does not have a home location set" });
    }

    const [nearbyWork, nearbyHome] = await Promise.all([
      institutionService.getNearbyInstitutions(
        workGeocode.lat,
        workGeocode.lng,
        radiusKm,
      ),
      institutionService.getNearbyInstitutions(
        homeLocation.lat,
        homeLocation.lng,
        radiusKm,
      ),
    ]);

    const all = [
      ...nearbyHome,
      ...nearbyWork.filter((w) => !nearbyHome.some((h) => h.id === w.id)),
    ];

    return res.json(
      all.sort((a, b) => a.distance_in_meters - b.distance_in_meters),
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
