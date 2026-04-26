import { ArrowLeft, Navigation, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onBack: () => void;
  route: { time: string; destination: string };
}

export function NavigationView({ onBack, route }: Props) {
  const [metroEnabled, setMetroEnabled]               = useState(true);
  const [busEnabled, setBusEnabled]                   = useState(true);
  const [bikeEnabled, setBikeEnabled]                 = useState(false);
  const [walkPreference, setWalkPreference]           = useState<'min' | 'max'>('min');
  const [safetyHeatMapEnabled, setSafetyHeatMapEnabled] = useState(true);
  const [metroCrimesEnabled, setMetroCrimesEnabled]   = useState(false);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md relative z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95 transition-transform">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0099D8]" />
            <span className="text-2xl font-bold text-gray-900">{route.time}</span>
          </div>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E91C77]" />
          <span className="text-sm font-medium text-gray-700">{route.destination}</span>
        </div>

        {/* Safety Toggles */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSafetyHeatMapEnabled(!safetyHeatMapEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all border ${
                safetyHeatMapEnabled
                  ? 'bg-[#91A889] text-white border-[#91A889] shadow-md'
                  : 'bg-white text-gray-400 border-gray-300 line-through'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Safety Heat Map</span>
            </button>
            <button
              onClick={() => setMetroCrimesEnabled(!metroCrimesEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all border ${
                metroCrimesEnabled
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-white text-gray-400 border-gray-300 line-through'
              }`}
            >
              <span className="text-sm">🚇</span>
              <span className="text-xs font-medium">Metro Crimes</span>
            </button>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { label: 'Metro', emoji: '🚇', enabled: metroEnabled,  set: setMetroEnabled, active: 'bg-indigo-600 border-indigo-600' },
              { label: 'Bus',   emoji: '🚌', enabled: busEnabled,    set: setBusEnabled,   active: 'bg-orange-600 border-orange-600' },
              { label: 'Bike',  emoji: '🚴', enabled: bikeEnabled,   set: setBikeEnabled,  active: 'bg-green-600  border-green-600'  },
            ].map(({ label, emoji, enabled, set, active }) => (
              <button
                key={label}
                onClick={() => set(!enabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
                  enabled
                    ? `${active} text-white shadow-md`
                    : 'bg-white text-gray-400 border-gray-300 line-through'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
            <button
              onClick={() => setWalkPreference(walkPreference === 'min' ? 'max' : 'min')}
              className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border bg-purple-600 text-white border-purple-600 shadow-md"
            >
              <span className="text-lg">🚶</span>
              <span className="text-sm font-medium">{walkPreference === 'min' ? 'Min Walk' : 'Max Walk'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative bg-[#E8EDE3] overflow-hidden">
        {safetyHeatMapEnabled && (
          <>
            <div className="absolute top-0 left-0 w-2/3 h-1/2 bg-gradient-to-br from-green-500/20 to-transparent rounded-br-[100px] transition-opacity duration-300" />
            <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-orange-400/25 to-transparent rounded-bl-[80px] transition-opacity duration-300" />
            <div className="absolute bottom-0 left-1/4 w-1/2 h-1/3 bg-gradient-to-tr from-red-500/20 to-transparent rounded-tl-[60px] transition-opacity duration-300" />
            <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-gradient-to-t from-green-500/15 to-transparent rounded-full transition-opacity duration-300" />
            <div className="absolute top-1/3 right-1/4 z-10 animate-fadeIn">
              <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Moderate Risk</span>
                </div>
              </div>
            </div>
          </>
        )}

        {metroCrimesEnabled && (
          <>
            <div className="absolute top-52 left-36 z-10 animate-fadeIn">
              <div className="bg-red-600/20 border-2 border-red-600/50 rounded-full p-2 backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 text-red-700" />
              </div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-red-600 px-2 py-1 rounded-md shadow-md">
                  <p className="text-xs font-medium text-white">2 incidents</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-40 right-24 z-10 animate-fadeIn">
              <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-full p-2 backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 text-orange-700" />
              </div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-orange-600 px-2 py-1 rounded-md shadow-md">
                  <p className="text-xs font-medium text-white">1 incident</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(145,168,137,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
          <path
            d="M 60 150 Q 150 200, 200 300 T 300 500"
            stroke="#0099D8" strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray="12,6"
          />
        </svg>

        {/* Start */}
        <div className="absolute top-32 left-12 z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#0099D8] shadow-xl flex items-center justify-center border-4 border-white">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-md">
                <p className="text-xs font-semibold text-gray-900">Start</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-12 z-0">
          <div className="w-16 h-16 rounded-full bg-[#0099D8] opacity-20 animate-ping" />
        </div>

        {/* Metro Stop */}
        <div className="absolute top-48 left-40 z-10">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center border-2 border-white">
              <span className="text-2xl">🚇</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-2 py-1 rounded-md shadow-sm">
                <p className="text-xs font-medium text-gray-700">Metro • Safe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Point */}
        <div className="absolute top-80 left-48 z-10">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-orange-600 shadow-lg flex items-center justify-center border-2 border-white">
              <span className="text-xl">🚌</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-2 py-1 rounded-md shadow-sm">
                <p className="text-xs font-medium text-gray-700">Bus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="absolute bottom-32 right-20 z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#E91C77] shadow-xl flex items-center justify-center border-4 border-white">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-md">
                <p className="text-xs font-semibold text-gray-900">Destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Legend */}
        {safetyHeatMapEnabled && (
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg animate-fadeIn">
            <p className="text-xs font-semibold text-gray-700 mb-2">Safety Levels</p>
            <div className="space-y-1.5">
              {[['bg-green-500/40', 'High Safety'], ['bg-orange-400/40', 'Moderate'], ['bg-red-500/40', 'Caution']].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${bg}`} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {metroCrimesEnabled && (
          <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg animate-fadeIn">
            <p className="text-xs font-semibold text-gray-700 mb-2">Metro Incidents</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-600">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">Low Risk</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Route Ready</span>
          </div>
          <span className="text-xs text-gray-500">Updated now</span>
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-[#E91C77] to-[#E95A2B] text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform">
          Start
        </button>
      </div>
    </div>
  );
}
