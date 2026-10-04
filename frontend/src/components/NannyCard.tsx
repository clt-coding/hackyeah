import type { Nanny } from '../types';
import '../styles/NannyCard.scss';

export default function NannyCard({ nanny }: { nanny: Nanny }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <article className="nanny-card">
      <div className="nanny-photo-container">
        <img src={nanny.photoUrl || "/default-avatar.jpg"} alt={nanny.name} />
        <div className="photo-overlay"></div>
        
        <div className="nanny-header-text">
          <span className="nanny-name">{nanny.name} ({nanny.age})</span>
        </div>
        
        {nanny.isOnline && (
          <div className="online-badge tone-green">
            Now online
          </div>
        )}
      </div>
      
      <div className="nanny-info">
        <div className="nanny-primary-details">
          <p className="hourly-rate">{nanny.hourlyRate}</p>
          <p className="experience">{nanny.experience}</p>
        </div>

        {nanny.reviewsCount > 0 && (
          <div className="nanny-ratings">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={i < Math.floor(nanny.rating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                ></i>
              ))}
            </div>
            <span className="reviews-text">{nanny.reviewsCount} opinions</span>
          </div>
        )}

        <div className="nanny-availability">
          <p className="availability-label">Availability:</p>
          <div className="availability-grid">
            {daysOfWeek.map((day, index) => {
              const isAvailable = nanny.availability[index];
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