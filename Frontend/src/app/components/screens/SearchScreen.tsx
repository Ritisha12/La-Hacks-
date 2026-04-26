import { ArrowLeft, Search, Clock, MapPin } from 'lucide-react';

interface Props {
  onBack: () => void;
  onFindRoute: () => void;
}

export function SearchScreen({ onBack, onFindRoute }: Props) {
  const recentLocations = [
    'LAX Airport',
    'Crypto.com Arena',
    'Dodger Stadium',
    'Santa Monica Pier',
    'Griffith Observatory',
  ];

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header with Search */}
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
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Recents */}
      <div className="bg-white px-4 py-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Recent</p>
        <div className="space-y-1">
          {recentLocations.map((location) => (
            <button
              key={location}
              onClick={onFindRoute}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{location}</p>
                <p className="text-xs text-gray-500">Los Angeles, CA</p>
              </div>
              <MapPin className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 bg-[#E8EDE3] relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(145, 168, 137, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#0099D8] shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm text-gray-600">📍 Current location</p>
          </div>
        </div>
      </div>
    </div>
  );
}
