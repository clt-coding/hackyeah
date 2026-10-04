export enum AddressType {
  Home = 1,
  WorkMom = 2,
  WorkDad = 3,
  Other = 4,
}

export interface CreateAddressInput {
  type: AddressType; //typ adresu (Home, WorkMom, WorkDad, Other)
  name: string; //custom nazwa adresu
  country?: string;
  postalCode: string;
  city: string;
  street: string;
  building_number: string;
  unit_number?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;

export interface ListAddressesFilters {
  type?: AddressType;
  limit: number;
  offset: number;
}