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
