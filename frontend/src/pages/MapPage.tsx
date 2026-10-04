import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Facility } from "../map-script";
import '../styles/MapPage.scss';

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Stany filtrów
  const [distanceFrom, setDistanceFrom] = useState(searchParams.get("location") ?? "");
  const [time, setTime] = useState(searchParams.get("time") ?? "");
  const [kidsCount, setKidsCount] = useState(1);
  const [showInstitutions, setShowInstitutions] = useState(true);
  const [showDaycares, setShowDaycares] = useState(true);

  // 1. Odbieranie kliknięcia z mapy
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_FACILITY') {
        setSelectedFacility(event.data.facility);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 2. Wysyłanie filtrów do iframe przy każdej zmianie stanu
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'APPLY_FILTERS',
        filters: {
          showInstitutions,
          showDaycares,
          searchQuery: distanceFrom,
        }
      }, '*');
    }
  }, [showInstitutions, showDaycares, distanceFrom]);

  const facilityName = selectedFacility
    ? (selectedFacility.category === 'INSTITUTION' ? selectedFacility.institution_name : selectedFacility.name)
    : "Select a point on the map";

  const facilityAddress = selectedFacility
    ? `${selectedFacility.street} ${selectedFacility.house_number}, ${selectedFacility.city}`
    : "Click any marker to view full location details.";

  return (
    <main className="MainMapPage">
      {/* Lewy panel - Filtry */}
      <aside className="filters">
        <div className="filters-title">FILTERS</div>

        <fieldset className="filter-group">
          <legend>Distance from</legend>
          <input
            type="text"
            placeholder="Workplace address / street"
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
              <input
                type="checkbox"
                checked={showInstitutions}
                onChange={(e) => setShowInstitutions(e.target.checked)}
              />
              Institutions
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={showDaycares}
                onChange={(e) => setShowDaycares(e.target.checked)}
              />
              Daycares
            </label>
          </div>
        </fieldset>
      </aside>

      {/* Środkowy panel - Interaktywna mapa */}
      <section className="map-place">
        <iframe 
          ref={iframeRef}
          className="map-frame" 
          src="/map/map.html" 
          title="MomWork Interactive Map" 
        />
      </section>

      {/* Prawy panel - Szczegóły wybranego punktu */}
      <aside className="details">
        <div className="filters-title">DETAILS</div>
        <div className="details-photo">
          {selectedFacility ? "Image Preview" : "No place selected"}
        </div>

        {selectedFacility ? (
          <>
            <div className="details-meta">
              <span className={`type-tag tag-${selectedFacility.category.toLowerCase()}`}>
                {selectedFacility.category}
              </span>
              <span className="muted small">
                {selectedFacility.category === 'INSTITUTION' ? selectedFacility.type : 'Private'}
              </span>
            </div>

            <h2 className="details-title">{facilityName}</h2>
            <p className="details-desc">{facilityAddress}</p>

            <ul className="details-list">
              <li>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {selectedFacility.opening_hour} - {selectedFacility.closing_hour}
              </li>
            </ul>

            {selectedFacility.category === 'INSTITUTION' && selectedFacility.address_www && (
              <a
                href={selectedFacility.address_www}
                target="_blank"
                rel="noreferrer"
                className="details-link"
              >
                Visit website
              </a>
            )}
          </>
        ) : (
          <p className="details-desc" style={{ marginTop: "20px" }}>
            {facilityAddress}
          </p>
        )}
      </aside>
    </main>
  );
}