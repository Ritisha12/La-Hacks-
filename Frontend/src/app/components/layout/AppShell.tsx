import type { CSSProperties } from 'react';

export function AppShell() {
  const shell: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    height: 56,
    padding: '0 var(--space-lg)',
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-card)',
    flexShrink: 0,
  };

  return (
    <header style={shell}>
      <h1 style={{ margin: 0, font: 'var(--text-h1)', color: 'var(--color-metro)' }}>
        LA Route
      </h1>
      <button
        aria-label="Settings"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 22, padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        ⚙️
      </button>
    </header>
  );
}
