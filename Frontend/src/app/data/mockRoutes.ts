export interface RouteStep {
  mode: string;
  icon: string;
  from: string;
  to: string;
  time: string;
  cost: string;
  color: string;
}

export interface RouteOption {
  label: string;
  time: string;
  cost: string;
  steps: RouteStep[];
}

export const routeSteps: RouteStep[] = [
  { mode: 'Walk',           icon: '🚶', from: 'Downtown LA',  to: 'Metro Station', time: '5 min',  cost: '',      color: 'walk'  },
  { mode: 'Metro Red Line', icon: '🚇', from: 'Pershing Sq',  to: 'Union Station', time: '22 min', cost: '$1.75', color: 'metro' },
  { mode: 'Walk',           icon: '🚶', from: 'Union Station', to: 'Pickup Point',  time: '3 min',  cost: '',      color: 'walk'  },
  { mode: 'Waymo',          icon: '🚗', from: 'Pickup Point',  to: 'SoFi Stadium',  time: '8 min',  cost: '$8.50', color: 'waymo' },
];

export const routeOptions: RouteOption[] = [
  { label: 'Fastest',  time: '38 min', cost: '$10.25', steps: routeSteps },
  { label: 'Balanced', time: '45 min', cost: '$6.75',  steps: routeSteps.slice(0, 3) },
  { label: 'Cheapest', time: '52 min', cost: '$3.50',  steps: routeSteps.slice(0, 2) },
];
