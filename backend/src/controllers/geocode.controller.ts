import { Request, Response } from "express";
import { geocodeAddress } from "../services/geocode.service.js";

export async function getGeocode(req: Request, res: Response) {
  try {
    const { street, houseNumber, city } = req.query as {
      street?: string;
      houseNumber?: string;
      city?: string;
    };
    const geocode = await geocodeAddress(
      street ?? "",
      houseNumber ?? "",
      city ?? "",
    );
    if (!geocode) {
      return res.status(400).json({ error: "Address not found" });
    }
    return res.status(200).json({ lat: geocode.lat, lng: geocode.lng });
  } catch (error) {
    console.error("Error in getGeocode:", error);
    return res.status(500).json({ error: "Geocode error" });
  }
}
