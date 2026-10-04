import type { Place } from "../types";

/// plik ogolnie do wyjebania, tylko musze sobie mocknac troche miejsc
// do ui-a, jak dostaniemy api to wyrzucimy.
export const places: Place[] = [
  {
    id: "1",
    name: "Place 1",
    type: "daycare",
    distance: "0.6 km",
    rating: 4.5,
    reviews: 111,
    hours: "7:00am - 8:00pm",
    description: "opis miejsca 1 placeholder blah blah blah blah balh",
  },
  {
    id: "2",
    name: "Place 2",
    type: "activity",
    distance: "1.2 km",
    rating: 4.8,
    reviews: 67,
    hours: "9:00am - 4:00pm",
    description: "opis miejsca 2 placeholder blah blah blah blah balh",
  },
  {
    id: "3",
    name: "Place 3",
    type: "daycare",
    distance: "6.9 km ",
    rating: 4.2,
    reviews: 420,
    hours: "6:30am - 6:30pm",
    description: "opis miejsca 3 placeholder blah blah blah blah balh",
  },
];
