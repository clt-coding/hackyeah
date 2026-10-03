import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { places } from "../data/places";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const selected = places[0];
  // idzie od homepage distance i time
  const [distanceFrom, setDistanceFrom] = useState(
    searchParams.get("location") ?? "",
  );
  const [time, setTime] = useState(searchParams.get("time") ?? "");
  const [kidsCount, setKidsCount] = useState(1);

  return (
    <main className="MainMapPage">
      <aside className="filters">
        <div className="filters-title">FILTERS</div>

        <fieldset className="filter-group">
          <legend>Distance from</legend>
          <input
            type="text"
            placeholder="Workplace address"
            value={distanceFrom}
            onChange={(e) => setDistanceFrom(e.target.value)}
          />
        </fieldset>

        <fieldset className="filter-group">
          <legend>Time</legend>
          <input
            type="text"
            placeholder="8:30 AM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </fieldset>

        <fieldset className="filter-group">
          <legend>Age group</legend>
          <input type="text" placeholder="e.g. 2 years" />
        </fieldset>

        <fieldset className="filter-group">
          <legend>Availability</legend>
          <div className="adder">
            <span className="adder-value">{kidsCount}</span>
            <button
              type="button"
              className="adder-btn"
              aria-label="Decrease number of kids"
              onClick={() => setKidsCount(Math.max(1, kidsCount - 1))}
            >
              <i className="fa-solid fa-minus" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="adder-btn"
              aria-label="Increase number of kids"
              onClick={() => setKidsCount(kidsCount + 1)}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" />
            </button>
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Care type</legend>
          <div className="chip-row">
            <label className="check">
              <input type="checkbox" />
              placeholder 1
            </label>
            <label className="check">
              <input type="checkbox" />
              placeholder 2
            </label>
            <label className="check">
              <input type="checkbox" />
              placeholder 3
            </label>
          </div>
        </fieldset>
      </aside>
      {/* miejsce na asiora mapka mam nadzieje ze to jest okay */}
      <section className="map-place">
        <iframe className="map-frame" src="about:blank" title="Map" />
      </section>

      <aside className="details">
        <div className="filters-title">DETAILS</div>
        <div className="details-photo">photo placeholder</div>
        <div className="details-meta">
          <span className={`type-tag tag-${selected.type}`}>
            {/*To sie zmieni jak dostaniemy dokładnie jakie dane mamy i jak sie nazywaja wsm, do 
              dogadania z backendem :P */}
            {selected.type === "daycare" ? "DAYCARE" : "ACTIVITY"}
          </span>
          <span className="muted small">{selected.distance}</span>
        </div>
        <h2 className="details-title">{selected.name}</h2>
        <ul className="details-list">
          <li>
            <i className="fa-regular fa-clock" aria-hidden="true" />
            {selected.hours}
          </li>
        </ul>
        {selected.description && (
          <p className="details-desc">{selected.description}</p>
        )}
        {selected.website && (
          <a
            href={selected.website}
            target="_blank"
            rel="noreferrer"
            className="details-link"
          >
            Visit website
          </a>
        )}
      </aside>
    </main>
  );
}
