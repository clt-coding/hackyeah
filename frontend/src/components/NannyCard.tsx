import type { Nanny } from '../types';
import '../styles/NannyCard.scss';

export default function NannyCard({ nanny }: { nanny: Nanny }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Fallback for availability since backend sends a boolean instead of an array
  const availabilityGrid = Array.isArray(nanny.availability) 
    ? nanny.availability 
    : [true, true, true, true, true, false, false]; // Default placeholder

  return (
    <article className="nanny-card">
      <div className="nanny-photo-container">
        {/* photoUrl is missing, so the default avatar will show */}
        <img src={nanny.photoUrl || "/default-avatar.jpg"} alt={nanny.user?.name || 'Nanny'} />
        <div className="photo-overlay"></div>
        
        <div className="nanny-header-text">
          {/* Mapped to backend's nested user object */}
          <span className="nanny-name">
            {nanny.user?.name} {nanny.user?.surname} {nanny.age ? `(${nanny.age})` : ''}
          </span>
        </div>
        
        {/* Fallback to false if isOnline is missing */}
        {nanny.isOnline && (
          <div className="online-badge tone-green">
            Now online
          </div>
        )}
      </div>
      
      <div className="nanny-info">
        <div className="nanny-primary-details">
          {/* Mapped to backend's hourly_wage */}
          <p className="hourly-rate">{nanny.hourly_wage} zł / hr</p>
          {/* Added a fallback for missing experience */}
          <p className="experience">{nanny.experience || 'Experience not specified'}</p>
        </div>

        {/* Mapped to backend's rating_count */}
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
            {daysOfWeek.map((day, index) => {
              const isAvailable = availabilityGrid[index];
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