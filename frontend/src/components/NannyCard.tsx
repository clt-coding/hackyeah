import type { Nanny } from '../types';
import '../styles/NannyCard.scss';

export default function NannyCard({ nanny, index = 0 }: { nanny: Nanny, index?: number }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const localPhotos = [
    "/nannies/photo1.jpg",
    "/nannies/photo2.jpg",
    "/nannies/photo3.jpg",
    "/nannies/photo4.jpg",
    "/nannies/photo5.jpg",
    "/nannies/photo6.jpg",
    "/nannies/photo7.jpg",
    "/nannies/photo8.jpg",
    "/nannies/photo9.jpg",
    "/nannies/photo10.jpg"
  ];
  const photoSrc = localPhotos[index % localPhotos.length];
  
  const availabilityGrid = Array.isArray(nanny.availability) 
    ? nanny.availability 
    : [true, true, true, true, true, false, false]; 

  return (
    <article className="nanny-card">
      <div className="nanny-photo-container">
        <img src={photoSrc} alt={nanny.user?.name || 'Nanny'} />
        <div className="photo-overlay"></div>
        
        <div className="nanny-header-text">
          <span className="nanny-name">
            {nanny.user?.name} {nanny.user?.surname} {nanny.age ? `(${nanny.age})` : ''}
          </span>
        </div>
        
        {nanny.isOnline && (
          <div className="online-badge tone-green">
            Now online
          </div>
        )}
      </div>
      
      <div className="nanny-info">
        <div className="nanny-primary-details">
          <p className="hourly-rate">{nanny.hourly_wage} zł / hr</p>
          <p className="experience">{nanny.experience || 'Experience not specified'}</p>
        </div>

        {(nanny.rating_count ?? 0) > 0 && (
          <div className="nanny-ratings">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={i < Math.floor(nanny.rating ?? 0) ? "fa-solid fa-star" : "fa-regular fa-star"}
                ></i>
              ))}
            </div>
            <span className="reviews-text">{nanny.rating_count} opinions</span>
          </div>
        )}

        <div className="nanny-availability">
          <p className="availability-label">Availability:</p>
          <div className="availability-grid">
            {daysOfWeek.map((day, dayIndex) => {
              const isAvailable = availabilityGrid[dayIndex];
              return (
                <div 
                  key={day} 
                  className={`day-box ${isAvailable ? 'available' : 'unavailable'}`}
                >
                  <span className="day-name">{day}</span>
                  <i className={isAvailable ? "fa-utility-fill fa-semibold fa-check" : "fa-solid fa-xmark"}></i>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}