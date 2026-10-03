export type Nanny = {
  id: number;
  name: string;
  age: number;
  photoUrl: string;
  isOnline: boolean;
  hourlyRate: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  availability: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
};