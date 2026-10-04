declare const L: any;

export type FacilityCategory = 'INSTITUTION' | 'DAYCARE';

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
  category: 'INSTITUTION';
  institution_name: string;
  type: string;
  public_status: string;
  address_www?: string;
}

export interface Daycare extends BaseLocation {
  category: 'DAYCARE';
  name: string;
}

export type Facility = Institution | Daycare;

// Widok ustawiony na Kraków
const map = L.map('map').setView([50.0647, 19.9450], 13);

// Kafelki CartoDB Voyager z poprawnym adresem URL
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map); 

const markersGroup = L.layerGroup().addTo(map);

// Przykładowe obiekty ze zaktualizowanymi współrzędnymi w Krakowie
const mockData: Facility[] = [
  {
    id: 'inst-1',
    category: 'INSTITUTION',
    institution_name: 'Przedszkole Samorządowe Nr 5',
    type: 'Przedszkole',
    public_status: 'Publiczne',
    city: 'Kraków',
    street: 'ul. Stachiewicza',
    house_number: '14',
    opening_hour: '07:00',
    closing_hour: '17:00',
    address_www: 'https://przedszkole5.krakow.pl',
    lat: 50.0812,
    lng: 19.9142
  },
  {
    id: 'daycare-1',
    category: 'DAYCARE',
    name: 'Żłobek Tuptusie',
    city: 'Kraków',
    street: 'ul. Długa',
    house_number: '32',
    opening_hour: '08:00',
    closing_hour: '16:00',
    lat: 50.0685,
    lng: 19.9380
  },
  {
    id: 'inst-2',
    category: 'INSTITUTION',
    institution_name: 'Przedszkole Samorządowe Nr 76',
    type: 'Przedszkole',
    public_status: 'Publiczne',
    city: 'Kraków',
    street: 'ul. Emaus',
    house_number: '12',
    opening_hour: '06:30',
    closing_hour: '17:30',
    address_www: 'https://p76krakow.pl',
    lat: 50.0589,
    lng: 19.9125
  },
  {
    id: 'daycare-2',
    category: 'DAYCARE',
    name: 'Kącik Malucha',
    city: 'Kraków',
    street: 'ul. Starowiślna',
    house_number: '45',
    opening_hour: '07:30',
    closing_hour: '17:00',
    lat: 50.0541,
    lng: 19.9472
  }
];

let currentFilters = {
  showInstitutions: true,
  showDaycares: true,
  searchQuery: "",
};

function renderMarkers() {
  markersGroup.clearLayers();

const filteredData = mockData.filter((item) => {
    // 1. Filtrowanie po kategorii
    if (item.category === 'INSTITUTION' && !currentFilters.showInstitutions) return false;
    if (item.category === 'DAYCARE' && !currentFilters.showDaycares) return false;

    // 2. Wyszukiwanie po adresie/nazwie
    if (currentFilters.searchQuery.trim() !== "") {
      const query = currentFilters.searchQuery.toLowerCase();
      const name = item.category === 'INSTITUTION' ? item.institution_name : item.name;
      const fullAddress = `${item.street} ${item.house_number} ${item.city}`.toLowerCase();

      return name.toLowerCase().includes(query) || fullAddress.includes(query);
    }

    return true;
  });

  filteredData.forEach((item) => {
    const marker = L.marker([item.lat, item.lng]);

    marker.on('click', (e: any) => {
      L.DomEvent.stopPropagation(e);

      // Przekazanie danych klikniętej placówki do nadrzędnego komponentu React (MapPage)
      if (window.parent) {
        window.parent.postMessage({ type: 'SELECT_FACILITY', facility: item }, '*');
      }
    });

    markersGroup.addLayer(marker);
  });
}

window.addEventListener('message', (event) => {
  if (event.data?.type === 'APPLY_FILTERS') {
    currentFilters = { ...currentFilters, ...event.data.filters };
    renderMarkers();
  }
});

// Inicjalne wyrenderowanie markerów
renderMarkers();

export {};