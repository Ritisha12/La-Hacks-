import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

export function BottomSheet({ children, expanded, onToggle }: Props) {
  const sheet: CSSProperties = {
    position: 'fixed',
    bottom: 64,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
    transform: expanded ? 'translateY(0)' : 'translateY(66%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 20,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={sheet}>
      <div
        className="sheet-drag-handle"
        onClick={onToggle}
        role="button"
        aria-label={expanded ? 'Collapse' : 'Expand'}
      >
        <div className="sheet-handle-bar" />
      </div>
      <div className="sheet-content">
        {children}
      </div>
    </div>
  );
}
