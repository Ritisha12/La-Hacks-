import { ArrowLeft, Navigation, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { RouteOption } from './RouteResults';

interface Props {
  onBack: () => void;
  route: RouteOption;
  destinationName: string;
}

export function NavigationView({ onBack, route, destinationName }: Props) {
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
          <span className="text-sm font-medium text-gray-700">{destinationName}</span>
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

      {/* Decorative Map */}
      <div className="h-44 relative bg-[#E8EDE3] overflow-hidden flex-shrink-0">
        {safetyHeatMapEnabled && (
          <>
            <div className="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-br from-green-500/20 to-transparent rounded-br-[100px] transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-orange-400/25 to-transparent rounded-bl-[80px] transition-opacity duration-300" />
            <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-red-500/20 to-transparent rounded-tl-[60px] transition-opacity duration-300" />
            <div className="absolute top-4 right-1/4 z-10 animate-fadeIn">
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
            <div className="absolute top-8 left-28 z-10 animate-fadeIn">
              <div className="bg-red-600/20 border-2 border-red-600/50 rounded-full p-1.5 backdrop-blur-sm">
                <AlertTriangle className="w-3 h-3 text-red-700" />
              </div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-red-600 px-1.5 py-0.5 rounded-md shadow-md">
                  <p className="text-xs font-medium text-white">2 incidents</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-16 z-10 animate-fadeIn">
              <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-full p-1.5 backdrop-blur-sm">
                <AlertTriangle className="w-3 h-3 text-orange-700" />
              </div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-orange-600 px-1.5 py-0.5 rounded-md shadow-md">
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

        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
          <path
            d="M 40 120 Q 100 90, 160 60 T 340 30"
            stroke="#0099D8" strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray="10,5"
          />
        </svg>

        {/* Start pin */}
        <div className="absolute top-20 left-6 z-10">
          <div className="w-10 h-10 rounded-full bg-[#0099D8] shadow-lg flex items-center justify-center border-2 border-white">
            <Navigation className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="absolute top-20 left-6 z-0">
          <div className="w-10 h-10 rounded-full bg-[#0099D8] opacity-20 animate-ping" />
        </div>

        {/* Destination pin */}
        <div className="absolute top-4 right-8 z-10">
          <div className="w-10 h-10 rounded-full bg-[#E91C77] shadow-lg flex items-center justify-center border-2 border-white">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Safety Legend */}
        {safetyHeatMapEnabled && (
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow">
            <div className="flex gap-2">
              {[['bg-green-500/40', 'Safe'], ['bg-orange-400/40', 'Moderate'], ['bg-red-500/40', 'Caution']].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${bg}`} />
                  <span className="text-[10px] text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step-by-step directions */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step-by-step</p>
        </div>
        <div className="px-4 pb-2">
          {route.steps.map((step, i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {step.icon}
                </div>
                {i < route.steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[20px]" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{step.location}</span>
                  <span className="text-xs text-[#0099D8] font-medium">{step.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{step.instruction}</p>
              </div>
            </div>
          ))}
          {/* Destination row */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E91C77]/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#E91C77]" />
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm font-semibold text-[#E91C77]">{destinationName}</span>
              <p className="text-xs text-gray-400 mt-0.5">Arrive in {route.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Route Ready</span>
          </div>
          <span className="text-xs text-gray-500">{route.cost} total</span>
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-[#E91C77] to-[#E95A2B] text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform">
          Start Navigation
        </button>
      </div>
    </div>
  );
}
