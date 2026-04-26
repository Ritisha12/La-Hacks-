import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Clock, MapPin } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  onBack: () => void;
  onFindRoute: (dest: [number, number], name: string) => void;
}

const DESTINATIONS: { name: string; coords: [number, number] }[] = [
  { name: 'LAX Airport',           coords: [33.9416, -118.4085] },
  { name: 'Crypto.com Arena',      coords: [34.0430, -118.2673] },
  { name: 'Dodger Stadium',        coords: [34.0739, -118.2400] },
  { name: 'Santa Monica Pier',     coords: [34.0096, -118.4974] },
  { name: 'Griffith Observatory',  coords: [34.1184, -118.3004] },
  { name: 'SoFi Stadium',          coords: [33.9534, -118.3392] },
];

export function SearchScreen({ onBack, onFindRoute }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        countrycodes: 'us',
        viewbox: '-118.95,33.70,-117.65,34.82',
        bounded: '1',
      });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { 'Accept-Language': 'en' },
        });
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95 transition-transform">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center gap-3 p-3 bg-gray-100 rounded-2xl">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Where to?"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Destinations */}
      <div className="bg-white px-4 py-4 flex-1 overflow-auto">
        {suggestions.length > 0 ? (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-3">Results</p>
            <div className="space-y-1">
              {suggestions.map((s) => {
                const shortName = s.display_name.split(',').slice(0, 2).join(',');
                return (
                  <button
                    key={s.place_id}
                    onClick={() => onFindRoute([parseFloat(s.lat), parseFloat(s.lon)], shortName)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl active:scale-95 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">{shortName}</p>
                      <p className="text-xs text-gray-500 truncate">{s.display_name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-3">Popular</p>
            <div className="space-y-1">
              {DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => onFindRoute(dest.coords, dest.name)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{dest.name}</p>
                    <p className="text-xs text-gray-500">Los Angeles, CA</p>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}