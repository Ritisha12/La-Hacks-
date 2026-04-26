import type { CSSProperties } from 'react';
import type { Itinerary } from '../../../types/routes';
import { formatDurationSec, formatDist } from '../../../lib/modeConfig';

export function TripSummary({ itinerary }: { itinerary: Itinerary }) {
  const totalWalkM = itinerary.legs
    .filter(l => l.mode === 'WALK')
    .reduce((sum, l) => sum + l.distance, 0);

  const transfers = itinerary.legs.filter(l => l.mode !== 'WALK').length - 1;

  const row: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: '#fff',
    borderTop: '1px solid var(--color-border)',
  };

  return (
    <div>
      <div style={row}>
        <span style={{ font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>Total time</span>
        <span style={{ font: 'var(--text-data)', fontSize: 16 }}>
          {formatDurationSec(itinerary.duration)}
        </span>
      </div>
      <div style={{ ...row, borderTop: 'none' }}>
        <span style={{ font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>Walking</span>
        <span style={{ font: 'var(--text-data)', color: 'var(--color-walk)' }}>
          {formatDist(totalWalkM)}
        </span>
      </div>
      {transfers > 0 && (
        <div style={{ ...row, borderTop: 'none' }}>
          <span style={{ font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>Transfers</span>
          <span style={{ font: 'var(--text-data)', color: 'var(--color-text-primary)' }}>{transfers}</span>
        </div>
      )}
    </div>
  );
}
