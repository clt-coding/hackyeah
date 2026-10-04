//godziny przyjmujemy jako "HH:MM" albo "HH:MM:SS" (stringi), serwis zamienia je na Temporal.PlainTime
export interface CreateDaycareInput {
  name: string;
  country?: string;
  postalCode: string;
  city: string;
  street: string;
  building_number: string;
  unit_number?: string | null;
  lat?: number | null;
  lng?: number | null;
  opening_hours: string;
  closing_hours: string;
}

export type UpdateDaycareInput = Partial<CreateDaycareInput>;

export interface ListDaycaresFilters {
  city?: string;
  search?: string;
  limit: number;
  offset: number;
}