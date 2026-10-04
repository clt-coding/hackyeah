import { getDaycares, type Daycare as RawDaycare } from "./api/daycares";
import {
  getAllInstitutions,
  ageToInstitutionType,
  type Institution as RawInstitution,
} from "./api/institutions";
import { geocode } from "./api/geocode";

declare const L: any;

export type FacilityCategory = "INSTITUTION" | "DAYCARE";

export interface BaseLocation {
  id: string;
  category: FacilityCategory;
  city: string;
  street: string;
  house_number: string;
  unit_number?: string;
  opening_hour: string;
  closing_hour: string;
  lat: number;
  lng: number;
}

export interface Institution extends BaseLocation {
  category: "INSTITUTION";
  institution_name: string;
  type: string;
  public_status?: string;
  address_www?: string;
}

export interface Daycare extends BaseLocation {
  category: "DAYCARE";
  name: string;
}

export type Facility = Institution | Daycare;

// Widok ustawiony na Kraków
const map = L.map("map").setView([50.0647, 19.945], 13);

// Kafelki CartoDB Voyager z poprawnym adresem URL
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const markersGroup = L.markerClusterGroup().addTo(map);

// zostawiamy instytucje zmockowane az nie dzialaja, daycares sa prawdziwe
const mockInstitutions: Facility[] = [
  {
    id: "inst-1",
    category: "INSTITUTION",
    institution_name: "Przedszkole Samorządowe Nr 5",
    type: "Kindergarten",
    public_status: "Publiczne",
    city: "Kraków",
    street: "ul. Stachiewicza",
    house_number: "14",
    opening_hour: "07:00",
    closing_hour: "17:00",
    address_www: "https://przedszkole5.krakow.pl",
    lat: 50.0812,
    lng: 19.9142,
  },
  {
    id: "inst-2",
    category: "INSTITUTION",
    institution_name: "Przedszkole Samorządowe Nr 76",
    type: "Kindergarten",
    public_status: "Publiczne",
    city: "Kraków",
    street: "ul. Emaus",
    house_number: "12",
    opening_hour: "06:30",
    closing_hour: "17:30",
    address_www: "https://p76krakow.pl",
    lat: 50.0589,
    lng: 19.9125,
  },
];

let allData: Facility[] = [...mockInstitutions];
let realDaycares: Facility[] = [];
// null = not loaded yet (or load failed) -> fall back to mockInstitutions
let realInstitutions: Facility[] | null = null;

function rebuildData() {
  allData = [...(realInstitutions ?? mockInstitutions), ...realDaycares];
}

function daycareToFacility(daycare: RawDaycare): Facility | null {
  if (daycare.lat == null || daycare.lng == null) return null;
  return {
    id: daycare.id,
    category: "DAYCARE",
    name: daycare.name,
    city: daycare.city,
    street: daycare.street,
    house_number: daycare.building_number,
    unit_number: daycare.unit_number ?? undefined,
    opening_hour: daycare.opening_hours,
    closing_hour: daycare.closing_hours,
    lat: daycare.lat,
    lng: daycare.lng,
  };
}

const INSTITUTION_TYPE_LABEL: Record<0 | 1, string> = {
  0: "Kindergarten",
  1: "Nursery",
};

function institutionToFacility(institution: RawInstitution): Facility | null {
  if (institution.lat == null || institution.lng == null) return null;
  return {
    id: institution.id,
    category: "INSTITUTION",
    institution_name: institution.name,
    type: INSTITUTION_TYPE_LABEL[institution.type],
    city: institution.city,
    street: institution.street,
    house_number: institution.building_number,
    unit_number: institution.unit_number ?? undefined,
    opening_hour: institution.opening_hours,
    closing_hour: institution.closing_hours,
    lat: institution.lat,
    lng: institution.lng,
  };
}

getDaycares().then((daycares) => {
  realDaycares = daycares
    .map(daycareToFacility)
    .filter((f): f is Facility => f !== null);
  rebuildData();
  renderMarkers();
});

getAllInstitutions()
  .then((institutions) => {
    realInstitutions = institutions
      .map(institutionToFacility)
      .filter((f): f is Facility => f !== null);
    rebuildData();
    renderMarkers();
  })
  .catch((err) => {
    // Keep showing mockInstitutions if this fails (e.g. not logged in).
    console.warn("Could not load institutions:", err.message);
    if (window.parent) {
      window.parent.postMessage(
        { type: "INSTITUTIONS_ERROR", message: err.message },
        "*",
      );
    }
  });

let currentFilters: {
  showInstitutions: boolean;
  showDaycares: boolean;
  searchQuery: string;
  time: string;
  age?: number;
} = {
  showInstitutions: true,
  showDaycares: true,
  searchQuery: "",
  time: "",
};

let workCenter: { lat: number; lng: number } | null = null;
let workRadiusMeters: number | null = null;
let radiusCircle: any = null;
let lastGeocodeQuery = "";

function maybeGeocodeWorkplace(
  street: string,
  houseNumber: string,
  radiusKm: number,
) {
  if (!street || !houseNumber || !radiusKm) return;

  const queryKey = `${street}|${houseNumber}|${radiusKm}`;
  if (queryKey === lastGeocodeQuery) return;
  lastGeocodeQuery = queryKey;

  geocode(street, houseNumber)
    .then((location) => {
      workCenter = location;
      workRadiusMeters = radiusKm * 1000;

      if (radiusCircle) map.removeLayer(radiusCircle);
      radiusCircle = L.circle([workCenter.lat, workCenter.lng], {
        radius: workRadiusMeters,
      }).addTo(map);
      map.setView([workCenter.lat, workCenter.lng], 13);

      renderMarkers();
    })
    .catch((err) => {
      console.warn("Could not geocode workplace address:", err.message);
      if (window.parent) {
        window.parent.postMessage(
          { type: "GEOCODE_ERROR", message: err.message },
          "*",
        );
      }
    });
}

function renderMarkers() {
  markersGroup.clearLayers();

  const filteredData = allData.filter((item: Facility) => {
    // 1. Filtrowanie po kategorii
    if (item.category === "INSTITUTION" && !currentFilters.showInstitutions)
      return false;
    if (item.category === "DAYCARE" && !currentFilters.showDaycares)
      return false;

    // 2. Wyszukiwanie po adresie/nazwie
    if (currentFilters.searchQuery.trim() !== "") {
      const query = currentFilters.searchQuery.toLowerCase();
      const name =
        item.category === "INSTITUTION" ? item.institution_name : item.name;
      const fullAddress =
        `${item.street} ${item.house_number} ${item.city}`.toLowerCase();

      if (!name.toLowerCase().includes(query) && !fullAddress.includes(query)) {
        return false;
      }
    }

    // 3. Filtrowanie po godzinie otwarcia
    if (currentFilters.time) {
      const opening = item.opening_hour.slice(0, 5);
      const closing = item.closing_hour.slice(0, 5);
      if (currentFilters.time < opening || currentFilters.time > closing) {
        return false;
      }
    }

    // 4. Filtrowanie po wieku dziecka (tylko instytucje maja ten podzial)
    if (currentFilters.age !== undefined && item.category === "INSTITUTION") {
      const expectedType =
        INSTITUTION_TYPE_LABEL[ageToInstitutionType(currentFilters.age)];
      if (item.type !== expectedType) return false;
    }

    // 5. Filtrowanie po promieniu od adresu pracy
    if (workCenter && workRadiusMeters !== null) {
      const distance = L.latLng(workCenter.lat, workCenter.lng).distanceTo(
        L.latLng(item.lat, item.lng),
      );
      if (distance > workRadiusMeters) return false;
    }

    return true;
  });

  filteredData.forEach((item) => {
    const marker = L.marker([item.lat, item.lng]);

    marker.on("click", (e: any) => {
      L.DomEvent.stopPropagation(e);

      // Przekazanie danych klikniętej placówki do nadrzędnego komponentu React (MapPage)
      if (window.parent) {
        window.parent.postMessage(
          { type: "SELECT_FACILITY", facility: item },
          "*",
        );
      }
    });

    markersGroup.addLayer(marker);
  });
}

// TODO: once GET /api/geocode exists, geocode street/houseNumber here and
// filter allData by L.latLng(center).distanceTo(...) <= radiusKm * 1000.
window.addEventListener("message", (event) => {
  if (event.data?.type === "APPLY_FILTERS") {
    currentFilters = { ...currentFilters, ...event.data.filters };

    const { street, houseNumber, radiusKm } = event.data.filters;
    if (street !== undefined && houseNumber !== undefined && radiusKm !== undefined) {
      maybeGeocodeWorkplace(street, houseNumber, radiusKm);
    }

    renderMarkers();
  }
});

// Inicjalne wyrenderowanie markerów
renderMarkers();

export {};
