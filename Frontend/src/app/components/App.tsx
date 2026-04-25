import { useState } from 'react';
import type { RouteOption } from '../data/mockRoutes';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RouteDetailScreen } from './screens/RouteDetailScreen';
import { SmartInsights } from './screens/SmartInsights';
import { SafetyOverlay } from './screens/SafetyOverlay';
import { BottomNav } from './layout/BottomNav';
import type { Tab } from './layout/BottomNav';

function App() {
  const [started, setStarted]     = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [route, setRoute]         = useState<RouteOption | null>(null);

  if (!started) {
    return <SplashScreen onStart={() => setStarted(true)} />;
  }

  if (route) {
    return <RouteDetailScreen route={route} onBack={() => setRoute(null)} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'home'     && <HomeScreen onRouteSelect={setRoute} />}
        {activeTab === 'safety'   && <SafetyOverlay />}
        {activeTab === 'insights' && <SmartInsights />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
