export type Nanny = {
  id: string;
  hourly_wage: number;
  phone_number: string;
  rating: number;
  rating_count: number;
  availability: boolean | boolean[]; // Backend gives boolean, we prefer array
  user: {
    id: string;
    name: string;
    surname: string;
  };
  userId: string;
  // Optional fields that backend isn't sending yet but frontend wants:
  age?: number;
  photoUrl?: string;
  isOnline?: boolean;
  experience?: string;
};
// to sie zmieni jak dostaniemy api, narazie jakies basic wrzucilam
// dorobimy guziki/funkcjonalnosc jak sie zlaczmy z baza danych <3

export interface Place {
  id: number;
  name: string;
  type: "daycare" | "activity";
  distance: string;
  rating: number;
  reviews: number;
  hours: string;
  description?: string;
  website?: string;
}
