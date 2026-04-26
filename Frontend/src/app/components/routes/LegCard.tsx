import type { CSSProperties } from 'react';
import type { Leg } from '../../../types/routes';
import { MODE_CONFIG, formatLegDuration, formatDist } from '../../../lib/modeConfig';

export function LegCard({ leg }: { leg: Leg }) {
  const cfg = MODE_CONFIG[leg.mode];

  const card: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-md)',
    borderLeft: `4px solid ${cfg.color}`,
    backgroundColor: '#fff',
    boxShadow: 'var(--shadow-card)',
  };

  const iconBox: CSSProperties = {
    width: 40, height: 40, flexShrink: 0,
    borderRadius: 'var(--radius-sm)',
    backgroundColor: cfg.color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  };

  return (
    <div style={card}>
      <div style={iconBox}>{cfg.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, font: 'var(--text-h2)', color: 'var(--color-text-primary)' }}>
          {cfg.label}{leg.route ? ` · ${leg.route.shortName}` : ''}
        </p>
        {leg.route && (
          <p style={{ margin: '2px 0 0', font: 'var(--text-body)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {leg.route.longName}
          </p>
        )}
        <p style={{ margin: '2px 0 0', font: 'var(--text-body)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {leg.from.name} → {leg.to.name}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: 0, font: 'var(--text-data)', color: 'var(--color-text-primary)' }}>
          {formatLegDuration(leg.startTime, leg.endTime)}
        </p>
        <p style={{ margin: '2px 0 0', font: 'var(--text-data)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {formatDist(leg.distance)}
        </p>
        {leg.realTime && (
          <p style={{ margin: '2px 0 0', font: 'var(--text-body)', fontSize: 11, color: 'var(--color-metro)' }}>
            Live
          </p>
        )}
      </div>
    </div>
  );
}
