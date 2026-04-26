// Actual mode values returned by OTP2 (BUS/RAIL/BICYCLE, not TRANSIT/BIKE/CAR)
export type TransportMode = 'WALK' | 'BUS' | 'RAIL' | 'BICYCLE' | 'SUBWAY' | 'TRAM' | 'CAR';

export interface LegLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Leg {
  mode: TransportMode;
  startTime: number;  // unix ms
  endTime: number;    // unix ms
  distance: number;   // meters
  realTime: boolean;
  from: LegLocation;
  to: LegLocation;
  route: { shortName: string; longName: string } | null;
}

export interface Itinerary {
  duration: number;  // seconds — OTP2 returns seconds, NOT milliseconds
  legs: Leg[];
}
