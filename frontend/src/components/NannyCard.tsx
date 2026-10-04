import { memo, useState, useCallback } from 'react';
import type { Nanny } from '../types';
import '../styles/NannyCard.scss';

const photoSrc = "/nannies/photo.jpg";

const NannyCard = memo(({ nanny }: { nanny: Nanny }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handlePhoneClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPhoneModal(true);
  }, []);

  const closeModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPhoneModal(false);
  }, []);

  return (
    <article className="nanny-card">
      <div className="nanny-photo-container">
        
        {photoSrc ? (
          <img 
            src={photoSrc} 
            alt={nanny.user?.name || 'Nanny'} 
            loading="lazy"
            decoding="async" 
          />
        ) : (
          <div className="no-photo-placeholder" style={{ width: '100%', height: '100%', backgroundColor: '#b6a999' }}></div>
        )}
        
        <div className="photo-overlay"></div>
        
        <div className="nanny-header-text">
          <span className="nanny-name">
            {nanny.user?.name} {nanny.user?.surname} {nanny.age ? `(${nanny.age})` : ''}
          </span>
        </div>
        
        {nanny.availability && (
          <div className="online-badge tone-green">
            Now online
          </div>
        )}
      </div>
      
      <div className="nanny-info">
        <div className="nanny-primary-details flex-row">
          <p className="hourly-rate">{nanny.hourly_wage} zł / hr</p>
          
          <button 
            className="phone-btn" 
            onClick={handlePhoneClick}
            aria-label="Show phone number"
          >
            <i className="fa-sharp fa-solid fa-phone"></i>
          </button>
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
      </div>

      {showPhoneModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Contact {nanny.user?.name}</h3>
            <p className="phone-number">
              <i className="fa-sharp fa-solid fa-phone"></i> {nanny.phone_number || "No phone number provided"}
            </p>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </article>
  );
});

export default NannyCard;