import type { CSSProperties } from 'react';

interface Props {
  style?: CSSProperties;
}

export function MapView({ style }: Props) {
  // TODO: wire Mapbox GL with import.meta.env.VITE_MAPBOX_TOKEN
  // Draw color-coded polylines per leg using leg.mode → MODE_CONFIG[mode].color
  return (
    <div style={{
      backgroundColor: '#cdd8de',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 'var(--space-sm)',
      color: 'var(--color-text-secondary)',
      font: 'var(--text-body)',
      ...style,
    }}>
      <span style={{ fontSize: 48 }}>🗺</span>
      <span>Map — Mapbox coming soon</span>
    </div>
  );
}
