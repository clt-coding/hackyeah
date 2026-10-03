import type { Nanny } from '../types';
import Icon from './Icon';

export default function NannyCard({ nanny }: { nanny: Nanny }) {
  return (
    <article className="nanny-card">
      <div className="nanny-top">
        <div className="avatar photo-placeholder">photo</div>
        <span className="verified-badge"><Icon name="verified" size={16} filled />Verified Profile</span>
      </div>
      <h3 className="nanny-name">{nanny.name}</h3>
      <p className="nanny-desc">{nanny.description}</p>
      <div className="nanny-metrics">
        <span className="rating"><Icon name="star" size={18} filled className="star" /><strong>{nanny.rating}</strong></span>
        <span className="muted"><strong className="ink">${nanny.hourlyRate}</strong>/hr</span>
      </div>
      <div className="availability">
        {nanny.availableNow ? 'AVAILABLE RIGHT NOW' : 'Available from ' + nanny.availableFrom}
      </div>
      <button className="btn btn-outline">VIEW FULL PROFILE</button>
    </article>
  );
}