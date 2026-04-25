interface Insight {
  icon: string;
  title: string;
  body: string;
  accent: string;
}

const INSIGHTS: Insight[] = [
  {
    icon: '⚡',
    title: 'Beat Peak Hours',
    body: 'Metro ridership spikes 7–9 AM and 5–7 PM. Leaving 20 min earlier typically cuts your commute by 8–12 min.',
    accent: 'var(--color-metro)',
  },
  {
    icon: '🚶',
    title: 'Walk More, Wait Less',
    body: 'Routes with a short walk segment often depart more frequently than direct buses. Less waiting, more moving.',
    accent: 'var(--color-walk)',
  },
  {
    icon: '🚲',
    title: 'Bike the Last Mile',
    body: 'Metro Bike share stations sit within 0.3 mi of most rail stops. Biking the last mile saves 10–15 min vs. a connecting bus.',
    accent: 'var(--color-bike)',
  },
  {
    icon: '🗓',
    title: 'Weekend Schedule',
    body: 'LA Metro runs reduced headways on weekends. Budget an extra 5–10 min buffer for Saturday and Sunday trips.',
    accent: 'var(--color-waymo)',
  },
  {
    icon: '📱',
    title: 'TAP Card Saves Money',
    body: 'Day passes ($7) pay off after 2 rides. Regular riders save ~$40/month vs. single-ride fares.',
    accent: 'var(--color-metro)',
  },
  {
    icon: '🌧',
    title: 'Rain Delay Tip',
    body: 'Bus delays average +6 min on rainy days in LA. Check real-time arrivals before leaving on wet days.',
    accent: 'var(--color-walk)',
  },
];

export function SmartInsights() {
  return (
    <div className="info-page">
      <h2>Smart Insights</h2>
      <p className="info-subtitle">Tips to make every LA trip faster and cheaper.</p>

      {INSIGHTS.map((ins) => (
        <div
          key={ins.title}
          className="info-card"
          style={{ borderLeft: `4px solid ${ins.accent}` }}
        >
          <span className="info-card-icon">{ins.icon}</span>
          <div>
            <p className="info-card-title">{ins.title}</p>
            <p className="info-card-body">{ins.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
