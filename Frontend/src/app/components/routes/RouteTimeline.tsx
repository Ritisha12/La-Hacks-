import type { CSSProperties } from 'react';
import type { Itinerary } from '../../../types/routes';
import { LegCard } from './LegCard';

export function RouteTimeline({ itinerary }: { itinerary: Itinerary }) {
  const connector: CSSProperties = {
    width: 2, height: 12,
    backgroundColor: 'var(--color-border)',
    marginLeft: 28,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {itinerary.legs.map((leg, i) => (
        <div key={i}>
          <LegCard leg={leg} />
          {i < itinerary.legs.length - 1 && <div style={connector} />}
        </div>
      ))}
    </div>
  );
}
