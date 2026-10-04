import { apiCall } from "./client";

interface Nanny {
  id: string;
  userId: string;
  phone_number: string;
  hourly_wage: number;
  availability: boolean;
  rating: number | null;
  user: { id: string; name: string; surname: string } | null;
}

export async function getNannies(): Promise<Nanny[]> {
  const data = await apiCall("/api/nannies");
  return data.nannies;
}
