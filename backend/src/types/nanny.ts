export interface CreateNannyInput {
  userId: string;
  phone_number: string;
  hourly_wage?: number;
  availability?: boolean;
}

// userId się nie zmienia, a rating/rating_count liczy się z opinii, nie ręcznie
export type UpdateNannyInput = Partial<Omit<CreateNannyInput, 'userId'>>;

export interface ListNanniesFilters {
  availableOnly: boolean;
  limit: number;
  offset: number;
}