import { useState } from 'react';
import { Settings, Shield } from 'lucide-react';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { RouteResults } from './screens/RouteResults';
import type { RouteOption } from './screens/RouteResults';
import { SmartInsights } from './screens/SmartInsights';
import { SafetyOverlay } from './screens/SafetyOverlay';
import { NavigationView } from './screens/NavigationView';
import { SettingsScreen } from './screens/SettingsScreen';

type Screen = 'home' | 'search' | 'routes' | 'insights' | 'safety' | 'navigation' | 'settings';

function App() {
  const [started, setStarted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  if (!started) {
    return <SplashScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div className="size-full bg-white flex flex-col relative max-w-md mx-auto overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {currentScreen === 'home' && (
          <HomeScreen onSearchRoute={() => setCurrentScreen('search')} />
        )}
        {currentScreen === 'search' && (
          <SearchScreen
            onBack={() => setCurrentScreen('home')}
            onFindRoute={() => setCurrentScreen('routes')}
          />
        )}
        {currentScreen === 'routes' && (
          <RouteResults
            onBack={() => setCurrentScreen('search')}
            onShowInsights={() => setCurrentScreen('insights')}
            onStartNavigation={(route) => {
              setSelectedRoute(route);
              setCurrentScreen('navigation');
            }}
          />
        )}
        {currentScreen === 'insights' && (
          <SmartInsights onBack={() => setCurrentScreen('routes')} />
        )}
        {currentScreen === 'safety' && (
          <SafetyOverlay onBack={() => setCurrentScreen('home')} />
        )}
        {currentScreen === 'navigation' && selectedRoute && (
          <NavigationView
            onBack={() => setCurrentScreen('routes')}
            route={{ time: selectedRoute.time, destination: 'SoFi Stadium' }}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen onBack={() => setCurrentScreen('home')} />
        )}
      </div>

      {(currentScreen === 'home' || currentScreen === 'settings') && (
        <div className="border-t border-gray-200 bg-white">
          <div className="flex items-center justify-around px-6 py-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'home' ? 'text-[#0099D8]' : 'text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentScreen === 'home' ? 'bg-[#0099D8]/10' : 'bg-gray-100'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setCurrentScreen('safety')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0099D8] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Safety</span>
            </button>

            <button
              onClick={() => setCurrentScreen('settings')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'settings' ? 'text-[#0099D8]' : 'text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentScreen === 'settings' ? 'bg-[#0099D8]/10' : 'bg-gray-100'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
