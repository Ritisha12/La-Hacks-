import { Search, Navigation } from 'lucide-react';

interface Props {
  onSearchRoute: () => void;
}

export function HomeScreen({ onSearchRoute }: Props) {
  const currentPreferences = ['Metro', 'Bus', 'Bike'];

  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      {/* Map Background — fills entire screen */}
      <div className="absolute inset-0 bg-[#E8EDE3]">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(145, 168, 137, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0" y1="200" x2="100%" y2="200" stroke="#666" strokeWidth="2" />
          <line x1="0" y1="350" x2="100%" y2="350" stroke="#666" strokeWidth="2" />
          <line x1="150" y1="0" x2="150" y2="100%" stroke="#666" strokeWidth="2" />
          <line x1="280" y1="0" x2="280" y2="100%" stroke="#666" strokeWidth="2" />
        </svg>

        {/* "You are here" pin — sits in the open map area above the cards */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 w-20 h-20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
              <div className="w-full h-full rounded-full bg-[#0099D8] opacity-20 animate-ping" />
            </div>
            <div className="relative w-14 h-14 rounded-full bg-[#0099D8] shadow-xl flex items-center justify-center border-4 border-white">
              <Navigation className="w-7 h-7 text-white" />
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-md">
                <p className="text-xs font-semibold text-gray-900">You are here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Transit Indicators */}
        <div className="absolute top-1/4 left-1/4">
          <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-md flex items-center justify-center">
            <span className="text-lg">🚇</span>
          </div>
        </div>
        <div className="absolute top-[45%] right-1/4">
          <div className="w-8 h-8 rounded-full bg-orange-600 shadow-md flex items-center justify-center">
            <span className="text-lg">🚌</span>
          </div>
        </div>
      </div>

      {/* Content overlay — title top, cards pinned to bottom */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Title at the top */}
        <div className="px-6 pt-14 pb-2">
          <h1 className="text-3xl font-bold text-[#E95A2B] drop-shadow-sm">LA Multimodal</h1>
          <p className="text-gray-700 text-sm font-medium drop-shadow-sm">Smart transit for a car-free LA</p>
        </div>

        {/* Spacer — lets the map show through */}
        <div className="flex-1" />

        {/* Search card + Active Modes pinned to the bottom */}
        <div className="px-6 mb-3">
          <button
            onClick={onSearchRoute}
            className="w-full bg-white rounded-3xl shadow-xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
          >
            <Search className="w-6 h-6 text-gray-400" />
            <span className="text-lg text-gray-400">Where to?</span>
          </button>
        </div>

        <div className="px-6 pb-6">
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
