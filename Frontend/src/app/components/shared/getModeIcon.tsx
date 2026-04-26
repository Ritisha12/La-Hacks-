import { Bike, Bus, Car, Footprints, Navigation, Train, Truck } from 'lucide-react';
import * as React from 'react';

export function getModeIcon(mode: string, size: 'sm' | 'md' = 'md'): React.ReactNode {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const iconMap: { [key: string]: React.ReactNode } = {
    'Walk':    <Footprints className={`${sizeClass} text-white`} />,
    'Waymo':   <Car        className={`${sizeClass} text-white`} />,
    'Metro':   <Train      className={`${sizeClass} text-white`} />,
    'DASH':    <Bus        className={`${sizeClass} text-white`} />,
    'Bus':     <Bus        className={`${sizeClass} text-white`} />,
    'Bike':    <Bike       className={`${sizeClass} text-white`} />,
    'Scooter': <Bike       className={`${sizeClass} text-white`} />,
    'Shuttle': <Truck      className={`${sizeClass} text-white`} />,
    'Tram':    <Train      className={`${sizeClass} text-white`} />,
  };
  return iconMap[mode] ?? <Navigation className={`${sizeClass} text-white`} />;
}
