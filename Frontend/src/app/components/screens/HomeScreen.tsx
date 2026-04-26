import { Search } from 'lucide-react';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  coords: [number, number];
  gpsFixed: boolean;
  onSearchRoute: () => void;
}

// Custom "You are here" marker — blue circle matching the design system
const userIcon = L.divIcon({
  className: '',
  iconSize: [56, 56],
  iconAnchor: [28, 28],
  html: `
    <div style="position:relative;width:56px;height:56px">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:#0099D8;
        opacity:0.25;
        animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        transform:scale(1.5);
      "></div>
      <div style="
        position:relative;
        width:56px;height:56px;
        background:#0099D8;
        border-radius:50%;
        border:4px solid white;
        box-shadow:0 8px 24px rgba(0,153,216,0.45);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      </div>
    </div>
  `,
});

/** Smoothly re-centers the map whenever coords update. */
function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 15, { animate: true });
  }, [lat, lon, map]);
  return null;
}

export function HomeScreen({ coords, gpsFixed, onSearchRoute }: Props) {

  const currentPreferences = ['Metro', 'Bus', 'Bike'];

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/* ── Live Leaflet map fills the entire background ── */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={coords}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={coords[0]} lon={coords[1]} />
          <Marker position={coords} icon={userIcon} />
        </MapContainer>
      </div>

      {/* ── Content overlay — pointer-events-none so map stays draggable ── */}
      <div className="relative z-10 h-full flex flex-col pointer-events-none">

        {/* GPS debug chip — remove once GPS is confirmed working */}
        <div className="px-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <div className={`w-2 h-2 rounded-full ${gpsFixed ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
            <span className="text-white text-xs font-mono">
              {gpsFixed ? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` : 'locating…'}
            </span>
          </div>
        </div>

        {/* Spacer — open map visible here */}
        <div className="flex-1" />

        {/* Search card */}
        <div className="px-6 mb-3 pointer-events-auto">
          <button
            onClick={onSearchRoute}
            className="w-full bg-white rounded-3xl shadow-xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
          >
            <Search className="w-6 h-6 text-gray-400" />
            <span className="text-lg text-gray-400">Where to?</span>
          </button>
        </div>

        {/* Active Modes */}
        <div className="px-6 pb-6 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Modes</p>
              <span className="text-xs text-[#0099D8] font-medium">{currentPreferences.length} enabled</span>
            </div>
            <div className="flex gap-2">
              {currentPreferences.map((pref) => (
                <div
                  key={pref}
                  className={`px-3 py-2 rounded-full text-xs font-medium shadow-sm ${
                    pref === 'Metro' ? 'bg-indigo-600 text-white' :
                    pref === 'Bus'   ? 'bg-orange-600 text-white' :
                                       'bg-green-600 text-white'
                  }`}
                >
                  {pref === 'Metro' ? '🚇' : pref === 'Bus' ? '🚌' : '🚴'} {pref}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
