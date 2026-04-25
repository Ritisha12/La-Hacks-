import { useState } from 'react';
import { RouteList } from '../routes/RouteList';
import type { RouteOption } from '../../data/mockRoutes';

interface Props {
  onRouteSelect: (route: RouteOption) => void;
}

export function HomeScreen({ onRouteSelect }: Props) {
  const [showRoutes, setShowRoutes] = useState(false);

  return (
    <main className="phone-page">
      <section className="hero">
        <h1>La Route</h1>
        <p>Smart transit for a car-free LA</p>
      </section>

      <section className="search-card">
        <label>
          <span>🔵</span>
          <input placeholder="From: Current location" />
        </label>
        <label>
          <span>📍</span>
          <input placeholder="To: SoFi Stadium" />
        </label>
        <button onClick={() => setShowRoutes(true)}>Find Best Route</button>
      </section>

      {!showRoutes && (
        <>
          <section className="status-card">
            <div className="card-header">
              <strong>Best route right now</strong>
              <span className="pill-live">Live</span>
            </div>
            <div className="comparison">
              <div>
                <span className="square metro" />
                <strong>25m</strong>
                <small>Multimodal</small>
              </div>
              <div>
                <span className="square walk" />
                <strong>45m</strong>
                <small>Driving</small>
              </div>
            </div>
            <hr className="status-divider" />
            <p className="condition">⚠️ Moderate traffic on I-10</p>
            <p className="condition">👥 High crowd level at venue</p>
          </section>

          <section className="recent">
            <h3>Recent</h3>
            <p>🕘 LAX Airport</p>
            <p>🕘 Santa Monica Pier</p>
          </section>
        </>
      )}

      {showRoutes && <RouteList onSelect={onRouteSelect} />}
    </main>
  );
}
