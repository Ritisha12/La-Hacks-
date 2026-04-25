interface SafetyTip {
  icon: string;
  title: string;
  body: string;
  accent: string;
}

const TIPS: SafetyTip[] = [
  {
    icon: '💡',
    title: 'Stay in Lit Areas',
    body: 'Wait for buses and trains at well-lit stops. Avoid isolated sections of platforms, especially after dark.',
    accent: 'var(--color-metro)',
  },
  {
    icon: '🎒',
    title: 'Keep Belongings Secure',
    body: 'Wear your backpack in front on crowded trains. Keep valuables out of sight and pockets zipped.',
    accent: 'var(--color-walk)',
  },
  {
    icon: '📍',
    title: 'Share Your Trip',
    body: "Let someone know your route and ETA before boarding at night. Use live-location sharing when possible.",
    accent: 'var(--color-waymo)',
  },
  {
    icon: '🚨',
    title: 'Metro Safety Line',
    body: 'On any Metro train or bus, text or call the Metro Transit Safety number to report issues in real time.',
    accent: 'var(--color-walk)',
  },
  {
    icon: '🚲',
    title: 'Bike Safety',
    body: 'Always wear a helmet. Use dedicated bike lanes on Expo and other protected corridors. Make eye contact at intersections.',
    accent: 'var(--color-bike)',
  },
  {
    icon: '🌙',
    title: 'Night Riding',
    body: 'Prefer well-traveled lines (A, B, D) after 10 PM. Sit near the operator or in the center car when the train is sparse.',
    accent: 'var(--color-metro)',
  },
];

const CONTACTS = [
  { label: 'Metro Transit Safety', number: '(213) 922-6235' },
  { label: 'LAPD Non-Emergency',   number: '(877) 275-5273' },
  { label: 'Emergency',            number: '911' },
];

export function SafetyOverlay() {
  return (
    <div className="info-page">
      <h2>Safety Tips</h2>
      <p className="info-subtitle">Ride smarter and safer across LA.</p>

      {TIPS.map((tip) => (
        <div
          key={tip.title}
          className="info-card"
          style={{ borderLeft: `4px solid ${tip.accent}` }}
        >
          <span className="info-card-icon">{tip.icon}</span>
          <div>
            <p className="info-card-title">{tip.title}</p>
            <p className="info-card-body">{tip.body}</p>
          </div>
        </div>
      ))}

      <div className="emergency-card">
        <h3>Emergency Contacts</h3>
        {CONTACTS.map((c) => (
          <div key={c.label} className="emergency-row">
            <span>{c.label}</span>
            <a
              href={`tel:${c.number.replace(/\D/g, '')}`}
              className="emergency-link"
            >
              {c.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
