import { useState } from 'react';
import { routeOptions } from '../../data/mockRoutes';
import type { RouteOption } from '../../data/mockRoutes';

type Tab = 'fastest' | 'balanced' | 'cheapest';

const TAB_LABEL: Record<Tab, string> = {
  fastest:  'Fastest',
  balanced: 'Balanced',
  cheapest: 'Cheapest',
};

interface Props {
  onSelect: (route: RouteOption) => void;
}

export function RouteList({ onSelect }: Props) {
  const [active, setActive] = useState<Tab | null>(null);

  const route = active
    ? routeOptions.find(r => r.label === TAB_LABEL[active]) ?? null
    : null;

  return (
    <section className="route-list">
      <div className="route-title">
        <h2>Route Options</h2>
        <span>{routeOptions.length} routes</span>
      </div>

      <div className="tabs">
        <button
          className={active === 'fastest' ? 'active' : ''}
          onClick={() => setActive('fastest')}
        >
          ⚡ Fastest
        </button>
        <button
          className={active === 'balanced' ? 'active' : ''}
          onClick={() => setActive('balanced')}
        >
          ⚖️ Balanced
        </button>
        <button
          className={active === 'cheapest' ? 'active' : ''}
          onClick={() => setActive('cheapest')}
        >
          💲 Cheapest
        </button>
      </div>

      {!route && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, textAlign: 'center', margin: '20px 0' }}>
          Select a preference above to see your route.
        </p>
      )}

      {route && (
        <article className="route-card">
          <div className="route-card-top">
            <strong>{route.label}</strong>
            <div>
              <b>{route.time}</b>
              <b>{route.cost}</b>
            </div>
          </div>

          {route.steps.map((step, i) => (
            <div className={`leg leg-${step.color}`} key={i}>
              <span className="leg-icon">{step.icon}</span>
              <div>
                <strong>{step.mode}</strong>
                <p>From: {step.from}</p>
                <p>To: {step.to}</p>
                {step.cost && <p className="cost">{step.cost}</p>}
              </div>
              <b>{step.time}</b>
            </div>
          ))}

          <button className="start-btn" onClick={() => onSelect(route)}>
            Start Trip
          </button>
        </article>
      )}
    </section>
  );
}
