import { User, Bike, Car, Bus } from 'lucide-react';
import * as React from 'react';

export function RouteLoadingAnimation() {
  const [currentIcon, setCurrentIcon] = React.useState(0);

  const icons = [
    { Icon: User, label: 'Walking' },
    { Icon: Bike, label: 'Biking' },
    { Icon: Car, label: 'Driving' },
    { Icon: Bus, label: 'Transit' }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white py-20">
      <div className="relative w-24 h-24 mb-6">
        {icons.map((item, idx) => {
          const Icon = item.Icon;
          return (
            <div
              key={idx}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                currentIcon === idx
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-50'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0099D8] to-[#00B8E6] flex items-center justify-center shadow-lg">
                <Icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Finding Your Routes</h3>
        <p className="text-sm text-gray-500 animate-pulse">
          Analyzing {icons[currentIcon].label.toLowerCase()} options...
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIcon === dot ? 'bg-[#0099D8] scale-125' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
