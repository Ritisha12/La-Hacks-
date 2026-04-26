import type { CSSProperties } from 'react';
import type { TransportMode } from '../../../types/routes';
import { MODE_CONFIG } from '../../../lib/modeConfig';

export function LegBadge({ mode }: { mode: TransportMode }) {
  const cfg = MODE_CONFIG[mode];

  const style: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: cfg.color,
    color: mode === 'BICYCLE' ? 'var(--color-text-primary)' : '#fff',
    font: 'var(--text-body)', fontSize: 11, fontWeight: 500,
    whiteSpace: 'nowrap',
  };

  return <span style={style}>{cfg.icon} {cfg.label}</span>;
}
