import { apiCall } from "./client";
import type { Nanny } from "../types";

export async function getNannies(): Promise<Nanny[]> {
  const data = await apiCall("/api/nannies");
  return data.nannies;
}
