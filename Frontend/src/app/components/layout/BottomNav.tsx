export type Tab = 'home' | 'safety' | 'insights';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',     icon: '🗺',  label: 'Home' },
  { id: 'safety',   icon: '🛡️',  label: 'Safety' },
  { id: 'insights', icon: '✨',  label: 'Insights' },
];

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bottom-nav-btn${activeTab === tab.id ? ' active' : ''}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
