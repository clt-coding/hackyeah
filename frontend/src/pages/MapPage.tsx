import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import type { Facility } from "../map-script";
import "../styles/MapPage.scss";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedCategory =
    location.pathname === "/map#daycare" ||
    location.pathname === "/map#daycares"
      ? "daycare"
      : location.pathname === "/map#institution" ||
          location.pathname === "/map#institutions"
        ? "institution"
        : null;

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );
  const [institutionsError, setInstitutionsError] = useState<string | null>(
    null,
  );

  // Stany filtrów
  const [distanceFrom, setDistanceFrom] = useState(
    searchParams.get("location") ?? "",
  );
  const [houseNumber, setHouseNumber] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [time, setTime] = useState(searchParams.get("time") ?? "");
  const [age, setAge] = useState("");
  const [showInstitutions, setShowInstitutions] = useState(
    selectedCategory !== "daycare",
  );
  const [showDaycares, setShowDaycares] = useState(
    selectedCategory !== "institution",
  );

  useEffect(() => {
    setShowInstitutions(selectedCategory !== "daycare");
    setShowDaycares(selectedCategory !== "institution");
  }, [selectedCategory]);

  // 1. Odbieranie kliknięcia z mapy
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SELECT_FACILITY") {
        setSelectedFacility(event.data.facility);
      }
      if (event.data?.type === "INSTITUTIONS_ERROR") {
        setInstitutionsError(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 2. Wysyłanie filtrów do iframe przy każdej zmianie stanu
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "APPLY_FILTERS",
          filters: {
            showInstitutions,
            showDaycares,
            searchQuery: distanceFrom,
            time,
            age: age ? Number(age) : undefined,
          },
        },
        "*",
      );
    }
  }, [showInstitutions, showDaycares, distanceFrom, time, age]);

  // 3. Wysyłane tylko po kliknięciu "Apply Filters" - geocoding jest kosztowny
  function applyWorkplaceFilter() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "APPLY_FILTERS",
          filters: {
            street: distanceFrom,
            houseNumber,
            radiusKm,
          },
        },
        "*",
      );
    }
  }

  const facilityName = selectedFacility
    ? selectedFacility.category === "INSTITUTION"
      ? selectedFacility.institution_name
      : selectedFacility.name
    : "Select a point on the map";

  const facilityAddress = selectedFacility
    ? [
        `${selectedFacility.street} ${selectedFacility.house_number}`.trim(),
        selectedFacility.city,
      ]
        .filter(Boolean)
        .join(", ")
    : "Click any marker to view full location details.";

  return (
    <main className="MainMapPage">
      {/* Lewy panel - Filtry */}
      <aside className="filters">
        <div className="filters-title">FILTERS</div>

        <fieldset className="filter-group">
          <legend>Workplace address</legend>
          <input
            type="text"
            placeholder="Street"
            value={distanceFrom}
            onChange={(e) => setDistanceFrom(e.target.value)}
          />
          <input
            type="text"
            placeholder="House number"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
          />
          <legend className="smallLegend">Radius</legend>
          <input
            type="number"
            min={1}
            max={50}
            placeholder="Radius (km)"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          />
          <button
            type="button"
            className="apply-btn"
            onClick={applyWorkplaceFilter}
          >
            Apply Filters
          </button>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Time</legend>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </fieldset>

        <fieldset className="filter-group">
          <legend>Age group</legend>
          <input
            type="number"
            min={0}
            placeholder="e.g. 2"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
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
              <span
                className={`type-tag tag-${selectedFacility.category.toLowerCase()}`}
              >
                {selectedFacility.category}
              </span>
              <span className="muted small">
                {selectedFacility.category === "INSTITUTION"
                  ? selectedFacility.type
                  : "Private"}
              </span>
            </div>

            <h2 className="details-title">{facilityName}</h2>
            <p className="details-desc">{facilityAddress}</p>

            <ul className="details-list">
              <li>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {selectedFacility.opening_hour} -{" "}
                {selectedFacility.closing_hour}
              </li>
            </ul>

            {selectedFacility.category === "INSTITUTION" &&
              selectedFacility.address_www && (
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

      {institutionsError && (
        <div
          className="modal-overlay"
          onClick={() => setInstitutionsError(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Can't search near your workplace yet</h3>
            <p>
              You need to be logged in with a home address saved to your account
              before we can search for institutions near you.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="apply-btn"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
              <button
                type="button"
                className="modal-dismiss"
                onClick={() => setInstitutionsError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
