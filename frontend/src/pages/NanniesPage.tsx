import NannyCard from '../components/NannyCard';
import '../styles/NanniesPage.scss';
import type { Nanny } from '../types';

const nanniesData: Nanny[] = [
  {
    id: 1,
    name: 'Margaret',
    age: 47,
    photoUrl: '/agnieszka.jpg',
    isOnline: true,
    hourlyRate: '$15 - $20 / hr',
    experience: '5+ years of experience',
    rating: 5.0,
    reviewsCount: 12,
    availability: [true, true, true, true, true, false, false],
  },
  {
    id: 2,
    name: 'Nicole',
    age: 21,
    photoUrl: '/agnieszka.jpg',
    isOnline: true,
    hourlyRate: 'Negotiable',
    experience: '1 year of experience',
    rating: 4.5,
    reviewsCount: 4,
    availability: [true, true, true, true, true, false, false],
  },
  {
    id: 3,
    name: 'Caroline',
    age: 22,
    photoUrl: '/agnieszka.jpg',
    isOnline: true,
    hourlyRate: '$15 - $20 / hr',
    experience: '2 years of experience',
    rating: 4.8,
    reviewsCount: 8,
    availability: [true, false, true, true, true, true, true],
  },
  {
    id: 4,
    name: 'Victoria',
    age: 24,
    photoUrl: '/agnieszka.jpg',
    isOnline: true,
    hourlyRate: '$10 - $15 / hr',
    experience: 'No experience',
    rating: 0,
    reviewsCount: 0,
    availability: [true, true, true, true, true, true, true],
  }
];

export default function NanniesPage() {
  return (
    <div className="nannies-page">
      <h2 className="page-title">Find your perfect nanny</h2>
      
      <div className="nannies-list">
        {nanniesData.map((nanny) => (
          <NannyCard key={nanny.id} nanny={nanny} />
        ))}
      </div>
    </div>
  );
}
