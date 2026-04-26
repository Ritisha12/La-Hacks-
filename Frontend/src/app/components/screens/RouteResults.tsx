import { ArrowLeft, Clock, DollarSign, Navigation, Shield, Users, Zap, Star, AlertTriangle, MapPin, Sparkles, Timer, Coins, Bike, Footprints, Car } from 'lucide-react';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import * as React from 'react';
import { queryRoutes, uiPrefsToApiPrefs } from '../../../api/routes';
import type { RouteQueryResult } from '../../../api/routes';

interface RouteStep {
  mode: string;
  icon: string;
  location: string;
  time: string;
  instruction: string;
}

export interface RouteOption {
  id: number;
  steps: RouteStep[];
  time: string;
  timeMinutes: number;
  cost: string;
  costValue: number;
  transfers: number;
  safety: 'high' | 'medium' | 'low';
  crowdLevel: 'low' | 'medium' | 'high';
  isRecommended?: boolean;
  savingsInfo?: string;
  walkingMinutes: number;
  generalizedCost: number;
  hasBiking: boolean;
  hasMetro: boolean;
  hasBus: boolean;
  hasWaymo: boolean;
}

type SortType = 'ai' | 'fastest' | 'cheapest' | 'safest';
type PreferenceType = 'metro' | 'bus' | 'bike' | 'waymo' | 'less-walking' | 'more-walking';

interface SortOption {
  id: SortType;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  bgColor: string;
}

interface PreferenceOption {
  id: PreferenceType;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  bgColor: string;
}

interface Props {
  origin: [number, number];
  destination: [number, number];
  destinationName: string;
  onBack: () => void;
  onShowInsights: () => void;
  onStartNavigation: (route: RouteOption) => void;
}

export function RouteResults({ origin, destination, destinationName, onBack, onShowInsights, onStartNavigation }: Props) {
  const [sortBy, setSortBy] = React.useState<SortType>('ai');
  const [preferences, setPreferences] = React.useState<Set<PreferenceType>>(new Set(['metro', 'bus', 'bike', 'waymo']));
  const [expandedRoute, setExpandedRoute] = React.useState<number | null>(null);
  const [liveData, setLiveData] = React.useState<RouteQueryResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-fetch from the backend whenever the mode preferences change
  React.useEffect(() => {
    const metro = preferences.has('metro');
    const bus   = preferences.has('bus');
    const bike  = preferences.has('bike');
    const waymo = preferences.has('waymo');

    const prefs = uiPrefsToApiPrefs(metro, bus, bike, waymo);
    console.log('[query_routes] request:', { origin, destination, preferences: prefs });

    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });
    queryRoutes(origin, destination, prefs)
      .then(result => {
        console.log('[query_routes] response:', result);
        setLiveData(result);
        if (!result.all.length) setError('No live routes returned from backend.');
      })
      .catch(err => {
        console.error('[query_routes] failed:', err);
        setError('Backend request failed. Check /api/query_routes in Network tab.');
        setLiveData({ all: [], fastest: null, cheapest: null, safest: null });
      })
      .finally(() => setLoading(false));
  }, [preferences, origin, destination]);

  const sortOptions: SortOption[] = [
    { id: 'ai',       label: 'AI Pick',  icon: <Sparkles className="w-4 h-4" />, color: 'text-[#0099D8]',  activeColor: 'bg-[#0099D8]',  bgColor: 'bg-[#0099D8]/10'  },
    { id: 'fastest',  label: 'Fastest',  icon: <Timer     className="w-4 h-4" />, color: 'text-[#E95A2B]',  activeColor: 'bg-[#E95A2B]',  bgColor: 'bg-[#E95A2B]/10'  },
    { id: 'safest',   label: 'Safest',   icon: <Shield    className="w-4 h-4" />, color: 'text-[#91A889]',  activeColor: 'bg-[#91A889]',  bgColor: 'bg-[#91A889]/10'  },
    { id: 'cheapest', label: 'Cheapest', icon: <Coins     className="w-4 h-4" />, color: 'text-[#E91C77]',  activeColor: 'bg-[#E91C77]',  bgColor: 'bg-[#E91C77]/10'  },
  ];

  const preferenceOptions: PreferenceOption[] = [
    { id: 'metro',        label: 'Metro',    icon: <span className="text-sm">🚇</span>,          color: 'text-indigo-600',  activeColor: 'bg-indigo-600',  bgColor: 'bg-indigo-50'  },
    { id: 'bus',          label: 'Bus',      icon: <span className="text-sm">🚌</span>,          color: 'text-orange-600',  activeColor: 'bg-orange-600',  bgColor: 'bg-orange-50'  },
    { id: 'bike',         label: 'Bike',     icon: <Bike        className="w-3.5 h-3.5" />,      color: 'text-green-600',   activeColor: 'bg-green-600',   bgColor: 'bg-green-50'   },
    { id: 'waymo',        label: 'Waymo',    icon: <Car         className="w-3.5 h-3.5" />,      color: 'text-sky-600',     activeColor: 'bg-sky-600',     bgColor: 'bg-sky-50'     },
    { id: 'less-walking', label: 'Min Walk', icon: <Footprints  className="w-3.5 h-3.5" />,      color: 'text-purple-600',  activeColor: 'bg-purple-600',  bgColor: 'bg-purple-50'  },
    { id: 'more-walking', label: 'Max Walk', icon: <Footprints  className="w-3.5 h-3.5" />,      color: 'text-blue-600',    activeColor: 'bg-blue-600',    bgColor: 'bg-blue-50'    },
  ];

  const togglePreference = (pref: PreferenceType) => {
    setPreferences(prev => {
      const next = new Set(prev);
      if (next.has(pref)) {
        next.delete(pref);
      } else {
        if (pref === 'less-walking' || pref === 'more-walking') {
          next.delete('less-walking');
          next.delete('more-walking');
        }
        next.add(pref);
      }
      return next;
    });
  };

  const getDisplayRoutes = (): RouteOption[] => {
    const pool = liveData?.all ?? [];
    const anyModeOn = preferences.has('metro') || preferences.has('bus') || preferences.has('bike') || preferences.has('waymo');

    let filtered = pool.filter(r => {
      // Hide routes that include a disabled transit mode
      if (!preferences.has('metro') && r.hasMetro)  return false;
      if (!preferences.has('bus')   && r.hasBus)    return false;
      if (!preferences.has('bike')  && r.hasBiking) return false;
      if (!preferences.has('waymo') && r.hasWaymo)  return false;
      // When transit modes are enabled, hide pure walk-only routes
      if (anyModeOn && !r.hasMetro && !r.hasBus && !r.hasBiking && !r.hasWaymo) return false;
      return true;
    });

    // Walking sort overrides tab sort when active
    if (preferences.has('less-walking')) {
      filtered = [...filtered].sort((a, b) => a.walkingMinutes - b.walkingMinutes);
    } else if (preferences.has('more-walking')) {
      filtered = [...filtered].sort((a, b) => b.walkingMinutes - a.walkingMinutes);
    } else {
      switch (sortBy) {
        case 'fastest':
          filtered = [...filtered].sort((a, b) => a.timeMinutes - b.timeMinutes);
          break;
        case 'cheapest':
          filtered = [...filtered].sort((a, b) => a.costValue - b.costValue);
          break;
        case 'safest': {
          const backendSafest = liveData?.safest;
          if (backendSafest) {
            // Put the backend-chosen safest route first, rest follow
            const rest = filtered.filter(r => r.id !== backendSafest.id);
            filtered = [backendSafest, ...rest];
          } else {
            const s = { high: 3, medium: 2, low: 1 } as const;
            filtered = [...filtered].sort((a, b) => s[b.safety] - s[a.safety]);
          }
          break;
        }
        default: // ai — lowest generalizedCost first
          filtered = [...filtered].sort((a, b) => a.generalizedCost - b.generalizedCost);
      }
    }

    return filtered.map((r, i) => ({ ...r, isRecommended: i === 0 }));
  };

  const routes = getDisplayRoutes();

  const safetyClass = (s: string) =>
    s === 'high'   ? 'bg-[#91A889]/10 text-[#91A889]' :
    s === 'medium' ? 'bg-[#E95A2B]/10 text-[#E95A2B]' :
                     'bg-[#E91C77]/10 text-[#E91C77]';

  const crowdClass = (c: string) =>
    c === 'low'    ? 'bg-[#0099D8]/10 text-[#0099D8]' :
    c === 'medium' ? 'bg-[#E95A2B]/10 text-[#E95A2B]' :
                     'bg-[#E91C77]/10 text-[#E91C77]';

  return (
    <div className="h-full w-full bg-white overflow-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-500">From: Current Location</p>
            <p className="text-sm font-semibold text-gray-900">To: {destinationName}</p>
          </div>
          <Navigation className="w-5 h-5 text-[#0099D8]" />
        </div>

        {/* Sort Pills */}
        <div className="px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {sortOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                  sortBy === opt.id
                    ? `${opt.activeColor} text-white shadow-lg`
                    : `${opt.bgColor} ${opt.color} hover:shadow-md`
                }`}
              >
                {opt.icon}
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preference Pills */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 mb-2">Tap to exclude modes • Active modes are included</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
              {preferenceOptions.map(opt => {
                const included = preferences.has(opt.id);
                const isTransit = opt.id === 'metro' || opt.id === 'bus' || opt.id === 'bike';
                return (
                  <button
                    key={opt.id}
                    onClick={() => togglePreference(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 border ${
                      included
                        ? `${opt.activeColor} text-white border-transparent shadow-md`
                        : isTransit
                        ? 'bg-white text-gray-400 border-gray-300'
                        : `${opt.bgColor} ${opt.color} border-gray-200 hover:border-gray-300`
                    }`}
                  >
                    {opt.icon}
                    <span className={`text-xs font-medium ${!included && isTransit ? 'line-through' : ''}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {preferences.size < 4 && (
              <button
                onClick={() => setPreferences(new Set(['metro', 'bus', 'bike', 'waymo']))}
                className="px-3 py-1.5 text-xs font-medium text-[#0099D8] hover:text-[#0077B6] whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Debug: live data status */}
      <div className="mx-6 mt-3 rounded-xl bg-gray-100 p-3 text-xs text-gray-700">
        <p><b>Origin:</b> {origin[0].toFixed(5)}, {origin[1].toFixed(5)}</p>
        <p><b>Destination:</b> {destination[0].toFixed(5)}, {destination[1].toFixed(5)}</p>
        <p><b>Data:</b> {liveData ? `Live backend routes (${liveData.all.length})` : 'No live data yet'}</p>
      </div>

      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Smart Insights Banner */}
      <div className="px-6 pt-2 pb-2">
        <button
          onClick={onShowInsights}
          className="w-full bg-gradient-to-r from-[#E91C77] to-[#E95A2B] rounded-xl p-3 text-white shadow-md active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <p className="text-xs font-semibold flex-1 text-left">Smart Insights Available</p>
            <span className="text-xs opacity-75">→</span>
          </div>
        </button>
      </div>

      {/* Route Cards */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Finding routes…' : `${routes.length} ${routes.length === 1 ? 'Route' : 'Routes'}`}
            </h2>
            {!loading && preferences.size !== 3 && (
              <span className="px-2 py-0.5 bg-[#0099D8]/10 text-[#0099D8] text-xs rounded-full font-medium">
                Filtered
              </span>
            )}
            {loading && (
              <span className="px-2 py-0.5 bg-[#0099D8]/10 text-[#0099D8] text-xs rounded-full font-medium animate-pulse">
                Live
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{liveData ? 'Live data' : 'vs 45 min driving'}</span>
        </div>

        {routes.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No routes available</p>
            <p className="text-xs text-gray-500 mb-4">Try including more transit modes</p>
            <button
              onClick={() => setPreferences(new Set(['metro', 'bus', 'bike']))}
              className="px-4 py-2 bg-[#0099D8] text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              Include All Modes
            </button>
          </div>
        )}

        {routes.map((route: RouteOption) => (
          <div
            key={route.id}
            className={`relative bg-white rounded-2xl overflow-hidden transition-all ${
              route.isRecommended ? 'ring-2 ring-[#0099D8] shadow-xl' : 'shadow-md hover:shadow-lg'
            }`}
          >
            {route.isRecommended && (
              <div className="bg-gradient-to-r from-[#0099D8] to-[#00B8E6] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="text-xs font-semibold text-white">Recommended</span>
                </div>
                {route.savingsInfo && (
                  <span className="text-xs text-white/90">{route.savingsInfo}</span>
                )}
              </div>
            )}

            <div className="p-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0099D8]" />
                    <p className="text-2xl font-bold text-gray-900">{route.time}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#91A889]" />
                    <p className="text-xl font-bold text-[#91A889]">{route.cost}</p>
                  </div>
                </div>
                {!route.isRecommended && route.savingsInfo && (
                  <div className="px-2 py-1 bg-gray-100 rounded-lg">
                    <p className="text-xs font-medium text-gray-600">{route.savingsInfo}</p>
                  </div>
                )}
              </div>

              {/* Journey Steps */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Your Journey</p>
                <div className="space-y-2">
                  {route.steps.map((step: RouteStep, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0099D8] to-[#00B8E6] shadow-md flex items-center justify-center relative z-10">
                            <span className="text-2xl">{step.icon}</span>
                          </div>
                          {idx < route.steps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gradient-to-b from-[#0099D8] to-gray-300 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-gray-900">{step.mode}</p>
                            <span className="px-2 py-0.5 bg-[#0099D8]/10 text-[#0099D8] text-xs font-semibold rounded-full">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-0.5">{step.instruction}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{step.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Tags */}
              <div className="flex items-center gap-2 mb-3 flex-wrap pb-3 border-b border-gray-100">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${safetyClass(route.safety)}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {route.safety === 'high' ? 'Safe' : route.safety === 'medium' ? 'Moderate' : 'Caution'}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${crowdClass(route.crowdLevel)}`}>
                  <Users className="w-3.5 h-3.5" />
                  {route.crowdLevel === 'low' ? 'Quiet' : route.crowdLevel === 'medium' ? 'Moderate' : 'Busy'}
                </div>
                <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  {route.transfers} {route.transfers === 1 ? 'transfer' : 'transfers'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onStartNavigation(route)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E91C77] to-[#E95A2B] font-semibold text-sm text-white active:scale-95 transition-all shadow-md"
                >
                  Start Navigating
                </button>
                <button
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm active:scale-95 transition-transform"
                >
                  {expandedRoute === route.id ? 'Less' : 'More'}
                </button>
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedRoute === route.id && (
              <div className="border-t border-gray-100 mt-4 pt-4 px-4 pb-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Step-by-Step</h3>
                <div className="space-y-3">
                  {route.steps.map((step: RouteStep, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0099D8] to-[#00B8E6] text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-xl">{step.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-gray-900">{step.mode}</span>
                              <span className="text-xs font-semibold text-[#0099D8]">{step.time}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{step.instruction}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{step.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={`https://images.unsplash.com/photo-${
                              idx === 0 ? '1568515387631-8b650bbcdb90' :
                              idx === 1 ? '1580894737915-180b6090ab0d' :
                                          '1568513082-3f1ed3f3c0e8'
                            }?w=400&h=150&fit=crop`}
                            alt={step.location}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                            Preview
                          </div>
                        </div>
                      </div>
                      {idx < route.steps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Traffic Alert */}
      <div className="px-6 pb-6">
        <div className="bg-[#E95A2B]/10 rounded-2xl p-4 border border-[#E95A2B]/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#E95A2B]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Traffic Alert</p>
              <p className="text-xs text-gray-600">I-10 W congested near La Brea Ave</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
