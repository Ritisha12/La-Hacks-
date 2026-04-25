import type { Itinerary } from '../types/routes';

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
