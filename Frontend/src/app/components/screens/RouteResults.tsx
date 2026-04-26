import { ArrowLeft, Clock, DollarSign, Navigation, Shield, Users, Zap, Star, AlertTriangle, MapPin, Sparkles, Timer, Coins, Bike, Footprints, Car } from 'lucide-react';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import * as React from 'react';
import { RouteLoadingAnimation } from './RouteLoadingAnimation';
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
        setLiveData({ all: [], fastest: null, cheapest: null, safest: null, car: null });
      })
      .finally(() => setLoading(false));
  }, [preferences, origin, destination]);

  const sortOptions: SortOption[] = [
    // { id: 'ai',       label: 'AI Pick',  icon: <Sparkles className="w-4 h-4" />, color: 'text-[#0099D8]',  activeColor: 'bg-[#0099D8]',  bgColor: 'bg-[#0099D8]/10'  },
    { id: 'fastest',  label: 'Fastest',  icon: <Timer     className="w-4 h-4" />, color: 'text-[#E95A2B]',  activeColor: 'bg-[#E95A2B]',  bgColor: 'bg-[#E95A2B]/10'  },
    { id: 'safest',   label: 'Safest',   icon: <Shield    className="w-4 h-4" />, color: 'text-[#91A889]',  activeColor: 'bg-[#91A889]',  bgColor: 'bg-[#91A889]/10'  },
    { id: 'cheapest', label: 'Cheapest', icon: <Coins     className="w-4 h-4" />, color: 'text-[#E91C77]',  activeColor: 'bg-[#E91C77]',  bgColor: 'bg-[#E91C77]/10'  },
  ];

  const preferenceOptions: PreferenceOption[] = [
    { id: 'metro',        label: 'Metro',        icon: <span className="text-sm">🚇</span>,         color: 'text-indigo-600',  activeColor: 'bg-indigo-600',  bgColor: 'bg-indigo-50'  },
    { id: 'bus',          label: 'Bus',          icon: <span className="text-sm">🚌</span>,         color: 'text-orange-600',  activeColor: 'bg-orange-600',  bgColor: 'bg-orange-50'  },
    { id: 'bike',         label: 'Bike',         icon: <Bike       className="w-3.5 h-3.5" />,     color: 'text-green-600',   activeColor: 'bg-green-600',   bgColor: 'bg-green-50'   },
    { id: 'waymo',        label: 'Waymo',        icon: <Car        className="w-3.5 h-3.5" />,     color: 'text-sky-600',     activeColor: 'bg-sky-600',     bgColor: 'bg-sky-50'     },
    { id: 'less-walking', label: 'Less Walking', icon: <Footprints className="w-3.5 h-3.5" />,     color: 'text-purple-600',  activeColor: 'bg-purple-600',  bgColor: 'bg-purple-50'  },
    { id: 'more-walking', label: 'More Walking', icon: <Footprints className="w-3.5 h-3.5" />,     color: 'text-blue-600',    activeColor: 'bg-blue-600',    bgColor: 'bg-blue-50'    },
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

  // Promote a backend-chosen route to the top. Backend picks have id=0, match by time+cost.
  const pinBackendPick = (pick: RouteOption | null, list: RouteOption[]): RouteOption[] => {
    if (!pick) return list;
    const matchIdx = list.findIndex(
      r => r.timeMinutes === pick.timeMinutes && r.costValue === pick.costValue
    );
    if (matchIdx <= 0) return list;
    const reordered = [...list];
    const [matched] = reordered.splice(matchIdx, 1);
    reordered.unshift(matched);
    return reordered;
  };

  const getDisplayRoutes = (): RouteOption[] => {
    const pool: RouteOption[] = [...(liveData?.all ?? [])];

    // Add the backend's Waymo pick when Waymo is enabled, unless already in pool
    const carRoute = liveData?.car ?? null;
    if (carRoute && preferences.has('waymo')) {
      const alreadyInPool = pool.some(
        r => r.timeMinutes === carRoute.timeMinutes && r.costValue === carRoute.costValue,
      );
      if (!alreadyInPool) pool.push(carRoute);
    }

    const anyModeOn = preferences.has('metro') || preferences.has('bus') || preferences.has('bike') || preferences.has('waymo');

    // Mode filtering. Waymo routes may have BUS/transit legs by design — only reject if Waymo itself is off.
    let filtered = pool.filter(r => {
      if (!preferences.has('waymo') && r.hasWaymo)  return false;
      if (r.hasWaymo)                                return true;
      if (!preferences.has('metro') && r.hasMetro)  return false;
      if (!preferences.has('bus')   && r.hasBus)    return false;
      if (!preferences.has('bike')  && r.hasBiking) return false;
      if (anyModeOn && !r.hasMetro && !r.hasBus && !r.hasBiking && !r.hasWaymo) return false;
      return true;
    });

    if (preferences.has('less-walking')) {
      filtered = [...filtered].sort((a, b) => a.walkingMinutes - b.walkingMinutes);
    } else if (preferences.has('more-walking')) {
      filtered = [...filtered].sort((a, b) => b.walkingMinutes - a.walkingMinutes);
    } else {
      switch (sortBy) {
        case 'fastest':
          filtered = [...filtered].sort((a, b) => a.timeMinutes - b.timeMinutes);
          filtered = pinBackendPick(liveData?.fastest ?? null, filtered);
          break;
        case 'cheapest':
          filtered = [...filtered].sort((a, b) => a.costValue - b.costValue);
          filtered = pinBackendPick(liveData?.cheapest ?? null, filtered);
          break;
        case 'safest': {
          const s = { high: 3, medium: 2, low: 1 } as const;
          filtered = [...filtered].sort((a, b) => s[b.safety] - s[a.safety]);
          filtered = pinBackendPick(liveData?.safest ?? null, filtered);
          break;
        }
        default:
          filtered = [...filtered].sort((a, b) => a.generalizedCost - b.generalizedCost);
      }
    }

    return filtered.map((r, i) => ({ ...r, isRecommended: i === 0 }));
  };

  const getSavingsInfo = (route: RouteOption, allRoutes: RouteOption[]): string => {
    if (sortBy === 'fastest') {
      const minTime = Math.min(...allRoutes.map(r => r.timeMinutes));
      return route.timeMinutes === minTime ? 'Fastest route' : `+${route.timeMinutes - minTime} min`;
    }
    if (sortBy === 'cheapest') {
      const minCost = Math.min(...allRoutes.map(r => r.costValue));
      return route.costValue === minCost ? 'Cheapest route' : `+$${(route.costValue - minCost).toFixed(2)}`;
    }
    if (sortBy === 'safest') {
      return route.safety === 'high' ? 'High safety' : route.safety === 'medium' ? 'Moderate safety' : 'Lower safety';
    }
    if (preferences.has('less-walking') || preferences.has('more-walking')) {
      return `${route.walkingMinutes} min walking`;
    }
    // return route.savingsInfo ?? 'AI optimized';
  };

  const getSafetyColor = (safety: string) => {
    if (safety === 'high')   return 'bg-[#6B8E65] text-white';
    if (safety === 'medium') return 'bg-[#91A889] text-white';
    return 'bg-[#C71866] text-white';
  };

  const getCrowdColor = (crowd: string) => {
    if (crowd === 'low')    return 'bg-[#0088C2] text-white';
    if (crowd === 'medium') return 'bg-[#D94D1F] text-white';
    return 'bg-[#C71866] text-white';
  };

  const routes = getDisplayRoutes();
  const isFiltered = !preferences.has('metro') || !preferences.has('bus') || !preferences.has('bike') || !preferences.has('waymo');

  return (
    <div className="h-full w-full bg-white overflow-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-xs font-medium text-gray-600">Current Location</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E91C77]" />
              <p className="text-sm font-bold text-gray-900">{destinationName}</p>
            </div>
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
                const isTransit = opt.id === 'metro' || opt.id === 'bus' || opt.id === 'bike' || opt.id === 'waymo';
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
            {isFiltered && (
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

      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Smart Insights Banner */}
      {/* <div className="px-6 pt-2 pb-2"> */}
        {/* <button
          onClick={onShowInsights}
          className="w-full bg-gradient-to-r from-[#E91C77] to-[#E95A2B] rounded-xl p-3 text-white shadow-md active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold">Smart Insights Available</p>
            </div>
            <span className="text-xs opacity-75">→</span>
          </div>
        </button> */}
      {/* </div> */}

      {/* Route Cards */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Finding routes…' : `${routes.length} ${routes.length === 1 ? 'Route' : 'Routes'}`}
            </h2>
            {!loading && isFiltered && (
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
          {/* <span className="text-xs text-gray-500">{liveData ? 'Live data' : 'vs 45 min driving'}</span> */}
        </div>

        {routes.length === 0 && !loading && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No routes available</p>
            <p className="text-xs text-gray-500 mb-4">Try including more transit modes</p>
            <button
              onClick={() => setPreferences(new Set(['metro', 'bus', 'bike', 'waymo']))}
              className="px-4 py-2 bg-[#0099D8] text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              Include All Modes
            </button>
          </div>
        )}

        {loading && <RouteLoadingAnimation />}

        {!loading && routes.map((route: RouteOption) => {
          const savings = getSavingsInfo(route, routes);
          const eta = (() => {
            const now = new Date();
            const arr = new Date(now.getTime() + route.timeMinutes * 60000);
            return arr.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          })();

          return (
            <div
              key={route.id}
              className={`relative bg-white rounded-2xl overflow-hidden transition-all ${
                route.isRecommended ? 'ring-2 ring-[#0099D8] shadow-xl' : 'shadow-md hover:shadow-lg'
              }`}
            >
              {/* Recommended Banner */}
              {route.isRecommended && (
                <div className="bg-gradient-to-r from-[#0099D8] to-[#00B8E6] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span className="text-xs font-semibold text-white">Recommended</span>
                  </div>
                  <span className="text-xs text-white/90">{savings}</span>
                </div>
              )}

              <div className="p-4">
                {/* Duration & Cost boxes */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#E95A2B]/10 rounded-xl flex-1 justify-center">
                      <Clock className="w-4 h-4 text-[#E95A2B]" />
                      <span className="text-xl font-bold text-[#E95A2B]">{route.time}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#E91C77]/10 rounded-xl flex-1 justify-center">
                      {/* <DollarSign className="w-4 h-4 text-[#E91C77]" /> */}
                      <span className="text-xl font-bold text-[#E91C77]">
                        {route.costValue > 0 ? route.cost : 'Free'}
                      </span>
                    </div>
                  </div>
                  {!route.isRecommended && (
                    <div className="flex justify-center mt-2">
                      <div className="px-2 py-1 bg-gray-100 rounded-lg">
                        <p className="text-xs font-medium text-gray-600">{savings}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Journey Steps — vertical timeline */}
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
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{step.mode}</p>
                                {step.instruction.toLowerCase().includes('take') && (
                                  <p className="text-xs font-semibold text-[#0099D8] mt-0.5">
                                    {step.instruction}
                                  </p>
                                )}
                                {idx !== route.steps.length - 1 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{step.location}</span>
                                  </div>
                                )}
                                {idx === route.steps.length - 1 && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-[#E91C77] font-semibold">
                                      to {destinationName}
                                    </p>
                                    <span className="text-xs text-gray-400">•</span>
                                    <p className="text-xs text-gray-500 font-medium">ETA {eta}</p>
                                  </div>
                                )}
                              </div>
                              {idx !== route.steps.length - 1 && (
                                <span className="px-2 py-0.5 bg-[#0099D8]/10 text-[#0099D8] text-xs font-semibold rounded-full">
                                  {step.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap pb-3 border-b border-gray-100">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getSafetyColor(route.safety)}`}>
                    <Shield className="w-3.5 h-3.5" />
                    {route.safety === 'high' ? 'Safe' : route.safety === 'medium' ? 'Moderate' : 'Caution'}
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getCrowdColor(route.crowdLevel)}`}>
                    <Users className="w-3.5 h-3.5" />
                    {route.crowdLevel === 'low' ? 'Quiet' : route.crowdLevel === 'medium' ? 'Moderate' : 'Busy'}
                  </div>
                  <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {route.transfers} {route.transfers === 1 ? 'transfer' : 'transfers'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedRouteId === route.id) {
                        onStartNavigation(route);
                      } else {
                        setSelectedRouteId(route.id);
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all shadow-md ${
                      selectedRouteId === route.id
                        ? 'bg-gradient-to-r from-[#E91C77] to-[#E95A2B] text-white'
                        : 'bg-[#0099D8] text-white'
                    }`}
                  >
                    {selectedRouteId === route.id ? 'Start Navigating' : 'Select This Route'}
                  </button>
                  <button
                    //onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                   // className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm active:scale-95 transition-transform"
                  >
                    {/* {expandedRoute === route.id ? 'Less' : 'More'} */}
                  </button>
                </div>
              </div>

              {/* Expanded: step-by-step with photos */}
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
          );
        })}
      </div>
    </div>
  );
}
