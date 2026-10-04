import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.scss';

type Address = {
  street: string;
  building_number: string;
  unit_number?: string;
  city: string;
  postalCode: string;
  country: string;
};

type NannyDetails = {
  phone_number: string;
  hourly_wage: number;
  availability: boolean;
  rating: number;
  rating_count: number;
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  surname: string;
  type: number;
  address?: Address; // Assuming your backend returns the nested address
  nanny?: NannyDetails; // Assuming your backend returns the nested nanny profile
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login');
            return;
          }
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Failed to load profile (Status: ${res.status})`);
        }

        const data = await res.json();
        setProfile(data.user); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading your profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="dashboard-error">
        <p>Error: {error || "Could not load profile"}</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="logged-in-page">
      <div className="dashboard-header">
        <h1 className="greeting">Welcome back, {profile.name}!</h1>
        <button onClick={handleLogout} className="btn-logout">Log Out</button>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <h2 className="card-title">Personal Details</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{profile.name} {profile.surname}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{profile.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Account Type:</span>
              <span className="value">
                {profile.type === 1 ? 'Parent' : profile.type === 0 ? 'Nanny' : `Type ${profile.type}`}
              </span>
            </div>
          </div>
        </section>

        {profile.address && (
          <section className="dashboard-card">
            <h2 className="card-title">Address</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Street:</span>
                <span className="value">{profile.address.street} {profile.address.building_number}{profile.address.unit_number ? `/${profile.address.unit_number}` : ''}</span>
              </div>
              <div className="info-item">
                <span className="label">City:</span>
                <span className="value">{profile.address.postalCode} {profile.address.city}</span>
              </div>
              <div className="info-item">
                <span className="label">Country:</span>
                <span className="value">{profile.address.country}</span>
              </div>
            </div>
          </section>
        )}

        {profile.nanny && (
          <section className="dashboard-card highlight-card">
            <h2 className="card-title">Professional Nanny Profile</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Hourly Wage:</span>
                <span className="value">{profile.nanny.hourly_wage} zł/hr</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{profile.nanny.phone_number}</span>
              </div>
              <div className="info-item">
                <span className="label">Availability:</span>
                <span className="value">
                  <span className={`status-badge ${profile.nanny.availability ? 'available' : 'unavailable'}`}>
                    {profile.nanny.availability ? 'Available' : 'Unavailable'}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="label">Rating:</span>
                <span className="value">{profile.nanny.rating} ({profile.nanny.rating_count} reviews)</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}