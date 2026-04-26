import type { Itinerary, Leg, TransportMode } from '../types/routes';
import type { RouteOption } from '../app/components/screens/RouteResults';

export type { RouteOption };

// Proxied through Vite dev server to avoid CORS (see vite.config.ts)
const OTP_ENDPOINT = '/api/otp';

const MOCK_NOW = Date.now();

const MOCK_ITINERARIES: Itinerary[] = [
  {
    duration: 3180,
    legs: [
      {
        mode: 'WALK', startTime: MOCK_NOW, endTime: MOCK_NOW + 371000,
        distance: 410, realTime: false,
        from: { name: 'Origin', lat: 34.056, lon: -118.2354 },
        to:   { name: 'Cesar E Chavez / Alameda', lat: 34.058, lon: -118.237 },
        route: null,
      },
      {
        mode: 'BUS', startTime: MOCK_NOW + 371000, endTime: MOCK_NOW + 371000 + 2460000,
        distance: 24976, realTime: false,
        from: { name: 'Cesar E Chavez / Alameda', lat: 34.058, lon: -118.237 },
        to:   { name: 'Venice Bl / Venice Wy', lat: 33.985, lon: -118.431 },
        route: { shortName: '33', longName: 'Metro Local Line' },
      },
      {
        mode: 'WALK', startTime: MOCK_NOW + 371000 + 2460000, endTime: MOCK_NOW + 3180000,
        distance: 820, realTime: false,
        from: { name: 'Venice Bl / Venice Wy', lat: 33.985, lon: -118.431 },
        to:   { name: 'Destination', lat: 34.020, lon: -118.491 },
        route: null,
      },
    ],
  },
  {
    duration: 5400,
    legs: [
      {
        mode: 'WALK', startTime: MOCK_NOW, endTime: MOCK_NOW + 600000,
        distance: 800, realTime: false,
        from: { name: 'Origin', lat: 34.056, lon: -118.235 },
        to:   { name: 'Union Station', lat: 34.056, lon: -118.236 },
        route: null,
      },
      {
        mode: 'RAIL', startTime: MOCK_NOW + 600000, endTime: MOCK_NOW + 600000 + 1800000,
        distance: 18000, realTime: true,
        from: { name: 'Union Station', lat: 34.056, lon: -118.236 },
        to:   { name: '7th St / Metro Center', lat: 34.049, lon: -118.259 },
        route: { shortName: 'A', longName: 'Metro A Line (Blue)' },
      },
      {
        mode: 'BUS', startTime: MOCK_NOW + 2400000, endTime: MOCK_NOW + 5400000,
        distance: 20000, realTime: false,
        from: { name: '7th St / Metro Center', lat: 34.049, lon: -118.259 },
        to:   { name: 'Destination', lat: 34.020, lon: -118.491 },
        route: { shortName: 'Rapid 720', longName: 'Wilshire Rapid' },
      },
    ],
  },
  {
    duration: 4200,
    legs: [
      {
        mode: 'WALK', startTime: MOCK_NOW, endTime: MOCK_NOW + 300000,
        distance: 300, realTime: false,
        from: { name: 'Origin', lat: 34.056, lon: -118.235 },
        to:   { name: 'Nearby Station', lat: 34.057, lon: -118.236 },
        route: null,
      },
      {
        mode: 'SUBWAY', startTime: MOCK_NOW + 300000, endTime: MOCK_NOW + 300000 + 2700000,
        distance: 22000, realTime: false,
        from: { name: 'Nearby Station', lat: 34.057, lon: -118.236 },
        to:   { name: 'Santa Monica Station', lat: 34.020, lon: -118.491 },
        route: { shortName: 'E', longName: 'Metro E Line (Expo)' },
      },
      {
        mode: 'WALK', startTime: MOCK_NOW + 3000000, endTime: MOCK_NOW + 4200000,
        distance: 600, realTime: false,
        from: { name: 'Santa Monica Station', lat: 34.020, lon: -118.491 },
        to:   { name: 'Destination', lat: 34.020, lon: -118.491 },
        route: null,
      },
    ],
  },
];

interface OTPResponse {
  data: { plan: { itineraries: Itinerary[] } };
}

export async function fetchRoutes(
  fromLat: number, fromLon: number,
  toLat: number,   toLon: number,
): Promise<Itinerary[]> {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 8);

  const query = `{
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to:   { lat: ${toLat},   lon: ${toLon}   }
      date: "${date}"
      time: "${time}"
      numItineraries: 3
      transportModes: [
        { mode: WALK }
        { mode: TRANSIT }
        { mode: BICYCLE, qualifier: RENT }
      ]
    ) {
      itineraries {
        duration
        legs {
          mode startTime endTime distance realTime
          from { name lat lon }
          to   { name lat lon }
          route { shortName longName }
        }
      }
    }
  }`;

  try {
    const res = await fetch(OTP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: OTPResponse = await res.json();
    return json.data.plan.itineraries;
  } catch (err) {
    console.warn('OTP unreachable, using mock data:', err);
    return MOCK_ITINERARIES;
  }
}

// ─── Teammate's route-planning API ────────────────────────────────────────────

const QUERY_ROUTES_ENDPOINT = '/api/query_routes';

export interface RoutePreferences {
  walk: boolean;
  bus: boolean;
  rail: boolean;
  subway: boolean;
  tram: boolean;
  car_dropoff: boolean;
  bicycle: boolean;
  bicycle_rental: boolean;
}

/** Maps the UI preference toggles (metro/bus/bike) to the API preferences shape. */
export function uiPrefsToApiPrefs(
  metro: boolean,
  bus: boolean,
  bike: boolean,
): RoutePreferences {
  return {
    walk: true,           // always on
    bus,
    rail: metro,
    subway: metro,
    tram: metro,
    car_dropoff: true,    // Waymo/rideshare — always offer
    bicycle: bike,
    bicycle_rental: bike,
  };
}

/** Calls POST /query_routes and returns RouteOption[] ready for the UI.
 *  Falls back to an empty array on error (caller can show mock data). */
export async function queryRoutes(
  origin: [number, number],
  destination: [number, number],
  preferences: RoutePreferences,
): Promise<RouteOption[]> {
  try {
    const res = await fetch(QUERY_ROUTES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, preferences }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const itineraries: Itinerary[] = await res.json();
    return itineraries.map((it, idx) => itineraryToRouteOption(it, idx + 1));
  } catch (err) {
    console.warn('query_routes unreachable:', err);
    return [];
  }
}

// ─── Mapper: OTP Itinerary → UI RouteOption ───────────────────────────────────

const MODE_ICON: Record<TransportMode, string> = {
  WALK:    '🚶',
  BUS:     '🚌',
  RAIL:    '🚇',
  SUBWAY:  '🚇',
  TRAM:    '🚋',
  BICYCLE: '🚲',
  CAR:     '🚗',
};

const MODE_LABEL: Record<TransportMode, string> = {
  WALK:    'Walk',
  BUS:     'Bus',
  RAIL:    'Metro',
  SUBWAY:  'Metro',
  TRAM:    'Tram',
  BICYCLE: 'Bike',
  CAR:     'Waymo',
};

/** Rough per-leg cost in dollars (LA Metro flat fare + distance-based CAR). */
function legCost(leg: Leg): number {
  switch (leg.mode) {
    case 'BUS':
    case 'RAIL':
    case 'SUBWAY':
    case 'TRAM':     return 1.75;
    case 'BICYCLE':  return 2.50;
    case 'CAR':      return 8.00 + (leg.distance / 1609) * 1.20; // $8 base + $1.20/mi
    default:         return 0;
  }
}

function legDurationMin(leg: Leg): number {
  return Math.round((leg.endTime - leg.startTime) / 60000);
}

export function itineraryToRouteOption(it: Itinerary, id: number): RouteOption {
  const totalMin  = Math.round(it.duration / 60);
  const totalCost = it.legs.reduce((sum, l) => sum + legCost(l), 0);

  const transitLegs = it.legs.filter(l => l.mode !== 'WALK');
  const walkLegs    = it.legs.filter(l => l.mode === 'WALK');
  const walkMin     = walkLegs.reduce((s, l) => s + legDurationMin(l), 0);

  const steps = it.legs.map(leg => ({
    mode:        MODE_LABEL[leg.mode],
    icon:        MODE_ICON[leg.mode],
    location:    leg.from.name,
    time:        `${legDurationMin(leg)} min`,
    instruction: leg.route
      ? `Take ${leg.route.longName || leg.route.shortName}`
      : leg.mode === 'WALK' ? 'Walk' : MODE_LABEL[leg.mode],
  }));

  return {
    id,
    steps,
    time:          `${totalMin} min`,
    timeMinutes:   totalMin,
    cost:          `$${totalCost.toFixed(2)}`,
    costValue:     totalCost,
    transfers:     Math.max(0, transitLegs.length - 1),
    safety:        'medium',
    crowdLevel:    'medium',
    walkingMinutes: walkMin,
    hasBiking:     it.legs.some(l => l.mode === 'BICYCLE'),
    hasMetro:      it.legs.some(l => l.mode === 'RAIL' || l.mode === 'SUBWAY' || l.mode === 'TRAM'),
    hasBus:        it.legs.some(l => l.mode === 'BUS'),
  };
}
