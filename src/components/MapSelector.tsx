import { type FC, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons not showing in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapSelectorProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, setPosition, onSelect }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const MapUpdater = ({ center }: { center: L.LatLng | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
};

const MapSelector: FC<MapSelectorProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter: [number, number] = [-12.04318, -77.02824]; // Lima by default

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newPos = new L.LatLng(lat, lon);
        setPosition(newPos);
        onLocationSelect(lat, lon);
      } else {
        alert('Ubicación no encontrada. Intenta con otra búsqueda.');
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      alert('Error al buscar la ubicación.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e as any);
            }
          }}
          placeholder="Buscar dirección, ciudad o lugar..."
          className="flex-1 px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-[#047D7D] text-white rounded-xl text-sm font-semibold hover:bg-[#036565] transition-smooth disabled:opacity-50"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      <div className="h-64 w-full rounded-xl overflow-hidden border border-surface-200 z-0 relative">
        <MapContainer
          center={position ? [position.lat, position.lng] : defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationSelect} />
          <MapUpdater center={position} />
        </MapContainer>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium text-surface-600 shadow-sm z-[1000] pointer-events-none">
          Haz clic en el mapa para ubicar
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
