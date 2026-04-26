import { routeSteps } from '../../data/mockRoutes';
import type { RouteOption } from '../../data/mockRoutes';

interface Props {
  route: RouteOption;
  onBack: () => void;
}

export function RouteDetailScreen({ route, onBack }: Props) {
  return (
    <main className="phone-page detail-page">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <section className="detail-card">
        <span className="ai-badge">★ AI Recommended</span>

        <div className="mode-chain">
          <span>🚶</span>
          <i className="mode-chain-line" />
          <span>🚇</span>
          <i className="mode-chain-line" />
          <span>🚗</span>
        </div>

        <div className="trip-stats">
          <div className="trip-stat">
            <b>{route.time}</b>
            <small>Time</small>
          </div>
          <div className="trip-stat">
            <b>{route.cost}</b>
            <small>Cost</small>
          </div>
          <div className="trip-stat">
            <b>{route.steps.filter(s => s.color !== 'walk').length}</b>
            <small>Transfers</small>
          </div>
        </div>

        <div className="indicators">
          <span className="safe-bar" />
          <span className="traffic-bar" />
        </div>

        <button className="start-btn">Go Now</button>

        <h3>Route Details</h3>

        <div className="image-card">
          <span>Street View</span>
        </div>

        {routeSteps.map((step, i) => (
          <div className="timeline-leg" key={i}>
            <span className={`timeline-dot dot-${step.color}`}>{step.icon}</span>
            <div className="timeline-body">
              <strong>{step.mode} · {step.time}</strong>
              <p>{step.from} → {step.to}</p>
              {step.cost && <small>{step.cost}</small>}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
