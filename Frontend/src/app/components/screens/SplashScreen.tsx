import { useEffect } from 'react';
import type { CSSProperties } from 'react';

const COLOR_BAR = ['var(--color-walk)', 'var(--color-waymo)', 'var(--color-metro)', 'var(--color-bike)'];

export function SplashScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const t = setTimeout(onStart, 3000);
    return () => clearTimeout(t);
  }, [onStart]);

  const screen: CSSProperties = {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--color-bg)', position: 'relative', overflow: 'hidden',
  };

  return (
    <div style={screen}>
      <h1 style={{ margin: 0, font: 'var(--text-logo)', letterSpacing: -1, color: 'var(--color-text-primary)' }}>
        LA Route
      </h1>
      <p style={{ margin: 'var(--space-sm) 0 var(--space-2xl)', font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
        Smart multimodal commuting for Angelenos
      </p>
      <button
        onClick={onStart}
        style={{
          height: 44, padding: '0 var(--space-2xl)',
          borderRadius: 'var(--radius-sm)', border: 'none',
          backgroundColor: 'var(--color-metro)', color: '#fff',
          font: 'var(--text-body)', fontWeight: 500, fontSize: 16, cursor: 'pointer',
        }}
      >
        Get Started
      </button>

      {/* 4-color bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, display: 'flex' }}>
        {COLOR_BAR.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
      </div>
    </div>
  );
}
