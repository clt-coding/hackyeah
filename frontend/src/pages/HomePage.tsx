import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import '../styles/HomePage.scss';

const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function HomePage() {
  const navigate = useNavigate();
  // tutaj bedzie sie aktualizowalo z wpisywaniem i powinnismy moc to wyslac
  // do backendu -> pls look into jak serio to bedzie dzialac oki?
  const [location, setLocation] = useState("");
  // tu tak samo, tylko narazie mam mockniete placeholdery, zeby mi nie wyawalalo
  const [fromTime, setFromTime] = useState(TIMES[0]);
  const [untilTime, setUntilTime] = useState(TIMES[0]);

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    navigate(
      `/map?location=${encodeURIComponent(location)}&time=${encodeURIComponent(fromTime)}&untilTime=${encodeURIComponent(untilTime)}`,
    );
  }

  return (
    <div className="mainHomeContainer">
      <p className="littleText">I'm a working mom and...</p>
      <h1 className="titleText">I'm looking for childcare.</h1>

      <form className="search-card" onSubmit={onSubmit}>
        <label className="search-field grow">
          <i
            className="fa-solid fa-location-dot search-field-icon"
            aria-hidden="true"
          />
          <span className="search-field-text">
            <span className="field-label">LOCATION</span>
            <input
              placeholder="Workplace address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </span>
        </label>

        <span className="search-divider" aria-hidden="true" />
        <span className="search-sep">at</span>
        <span className="search-divider" aria-hidden="true" />

        <label className="search-field">
          <i
            className="fa-solid fa-clock search-field-icon"
            aria-hidden="true"
          />
          <span className="search-field-text">
            <span className="field-label">FROM</span>
            <select
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            >
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </span>
          <span className="search-field-text">
            <span className="field-label">UNTIL</span>
            <select
              value={untilTime}
              onChange={(e) => setUntilTime(e.target.value)}
            >
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-primary btn-pill search-submit"
        >
          Locate <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </form>

      <div className="category-grid">
        <CategoryCard
          tone="pink"
          icon="face-smile"
          title="Find nannies"
          subtitle="Flexible one-to-one care"
          onClick={() => navigate("/nannies")}
        />
        <CategoryCard
          tone="green"
          icon="building"
          title="Find daycares"
          subtitle="Verified centers near work"
          onClick={() => navigate("/map#daycare")}
        />
        <CategoryCard
          tone="purple"
          icon="palette"
          title="Find activities"
          subtitle="After-school enrichment"
          onClick={() => navigate("/map#institutions")}
        />
      </div>
    </div>
  );
}
