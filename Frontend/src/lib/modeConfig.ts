import type { TransportMode } from '../types/routes';

export interface ModeConfig {
  label: string;
  color: string;
  icon: string;
}

export const MODE_CONFIG: Record<TransportMode, ModeConfig> = {
  WALK:    { label: 'Walk',  color: 'var(--color-walk)',  icon: '🚶' },
  BUS:     { label: 'Bus',   color: 'var(--color-metro)', icon: '🚌' },
  RAIL:    { label: 'Rail',  color: 'var(--color-metro)', icon: '🚆' },
  SUBWAY:  { label: 'Metro', color: 'var(--color-metro)', icon: '🚇' },
  TRAM:    { label: 'Tram',  color: 'var(--color-metro)', icon: '🚋' },
  BICYCLE: { label: 'Bike',  color: 'var(--color-bike)',  icon: '🚲' },
  CAR:     { label: 'Waymo', color: 'var(--color-waymo)', icon: '🚗' },
};

export function formatDurationSec(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

export function formatLegDuration(startTime: number, endTime: number): string {
  return formatDurationSec((endTime - startTime) / 1000);
}

export function formatDist(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
}
