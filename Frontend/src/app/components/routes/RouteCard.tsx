import type { Itinerary } from '../../../types/routes';
import { MODE_CONFIG, formatDurationSec } from '../../../lib/modeConfig';
import { LegBadge } from './LegBadge';

interface Props {
  itinerary: Itinerary;
  label?: string;
  onSelect: () => void;
}

export function RouteCard({ itinerary, label, onSelect }: Props) {
  const firstNonWalk = itinerary.legs.find(l => l.mode !== 'WALK');
  const accent = firstNonWalk ? MODE_CONFIG[firstNonWalk.mode].color : 'var(--color-metro)';
  const lightBike = firstNonWalk?.mode === 'BICYCLE';

  return (
    <article
      className="route-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="route-card-top">
        <span className="route-card-duration">
          {formatDurationSec(itinerary.duration)}
        </span>
        {label && (
          <span
            className="route-card-label"
            style={{
              backgroundColor: accent,
              color: lightBike ? 'var(--color-text-primary)' : '#fff',
            }}
          >
            {label}
          </span>
        )}
      </div>

      <div className="safety-row">
        <span>🛡️ Safe</span>
        <span>👥 Crowd: Medium</span>
      </div>

      <div className="leg-badges">
        {itinerary.legs.map((leg, i) => <LegBadge key={i} mode={leg.mode} />)}
      </div>
    </article>
  );
}
