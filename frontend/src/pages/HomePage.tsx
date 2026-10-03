import { useState, type SubmitEvent } from "react";
import CategoryCard from "../components/CategoryCard";
import '../styles/HomePage.scss';

const TIMES = ["8 AM", "9 AM", "10 AM", "11 AM", "12 AM", "1 PM","2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM"];


export default function HomePage() {
  // tutaj bedzie sie aktualizowalo z wpisywaniem i powinnismy moc to wyslac
  // do backendu -> pls look into jak serio to bedzie dzialac oki?
  const [location, setLocation] = useState("");
  // tu tak samo, tylko narazie mam mockniete placeholdery, zeby mi nie wyawalalo
  const [time, setTime] = useState(TIMES[0]);

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log(
      "This will call the api and navigate us to the map with the props",
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
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </span>
          <span className="search-field-text">
            <span className="field-label">UNTIL</span>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
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
        />
        <CategoryCard
          tone="green"
          icon="building"
          title="Find daycares"
          subtitle="Verified centers near work"
        />
        <CategoryCard
          tone="purple"
          icon="palette"
          title="Find activities"
          subtitle="After-school enrichment"
        />
      </div>
    </div>
  );
}
