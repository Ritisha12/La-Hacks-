import { ArrowLeft, Clock, MapPin, AlertTriangle } from 'lucide-react';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Pane, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useHeatmapData } from '../../hooks/useHeatmapData';
import { MapControls } from './MapControls';
import type { RouteOption } from './RouteResults';
import { SafetyHeatMap } from './SafetyHeatMap';

interface Props {
  onBack: () => void;
  route: RouteOption;
  destinationName: string;
}

const SAFETY_LAYER_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

const ROUTE_CENTER: LatLngExpression = [34.005, -118.296];
const DEFAULT_MAP_ZOOM = 12;

const ROUTE_POINTS: LatLngExpression[] = [
  [34.0484, -118.2595],
  [34.0489, -118.2518],
  [34.0182, -118.2857],
  [34.0107, -118.3005],
  [33.9934, -118.3317],
  [33.9535, -118.3392],
];

function MapZoomBridge({ onZoomChange, zoom }: { onZoomChange: (zoom: number) => void; zoom: number }) {
  const map = useMap();

  useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    if (map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  return null;
}

export function NavigationView({ onBack, route, destinationName }: Props) {
  const [metroEnabled, setMetroEnabled]               = useState(true);
  const [busEnabled, setBusEnabled]                   = useState(true);
  const [bikeEnabled, setBikeEnabled]                 = useState(false);
  const [walkPreference, setWalkPreference]           = useState<'min' | 'max'>('min');
  const [safetyHeatMapEnabled, setSafetyHeatMapEnabled] = useState(true);
  const [metroCrimesEnabled, setMetroCrimesEnabled]   = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
  const heatmap = useHeatmapData(safetyHeatMapEnabled);
  const routeMarkers = useMemo(() => ROUTE_POINTS, []);

  const zoomIn = () => setZoom((value) => Math.min(18, value + 1));
  const zoomOut = () => setZoom((value) => Math.max(10, value - 1));
  const resetZoom = () => setZoom(DEFAULT_MAP_ZOOM);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md relative z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95 transition-transform">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0099D8]" />
            <span className="text-2xl font-bold text-gray-900">{route.time}</span>
          </div>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E91C77]" />
          <span className="text-sm font-medium text-gray-700">{destinationName}</span>
        </div>

        {/* Safety Toggles */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSafetyHeatMapEnabled(!safetyHeatMapEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all border ${
                safetyHeatMapEnabled
                  ? 'bg-[#91A889] text-white border-[#91A889] shadow-md'
                  : 'bg-white text-gray-400 border-gray-300 line-through'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Safety Heat Map</span>
            </button>
            <button
              onClick={() => setMetroCrimesEnabled(!metroCrimesEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all border ${
                metroCrimesEnabled
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-white text-gray-400 border-gray-300 line-through'
              }`}
            >
              <span className="text-sm">🚇</span>
              <span className="text-xs font-medium">Metro Crimes</span>
            </button>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { label: 'Metro', emoji: '🚇', enabled: metroEnabled,  set: setMetroEnabled, active: 'bg-indigo-600 border-indigo-600' },
              { label: 'Bus',   emoji: '🚌', enabled: busEnabled,    set: setBusEnabled,   active: 'bg-orange-600 border-orange-600' },
              { label: 'Bike',  emoji: '🚴', enabled: bikeEnabled,   set: setBikeEnabled,  active: 'bg-green-600  border-green-600'  },
            ].map(({ label, emoji, enabled, set, active }) => (
              <button
                key={label}
                onClick={() => set(!enabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
                  enabled
                    ? `${active} text-white shadow-md`
                    : 'bg-white text-gray-400 border-gray-300 line-through'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
            <button
              onClick={() => setWalkPreference(walkPreference === 'min' ? 'max' : 'min')}
              className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border bg-purple-600 text-white border-purple-600 shadow-md"
            >
              <span className="text-lg">🚶</span>
              <span className="text-sm font-medium">{walkPreference === 'min' ? 'Min Walk' : 'Max Walk'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Route Map */}
      <div className="h-64 relative bg-[#E8EDE3] overflow-hidden flex-shrink-0">
        <MapContainer
          attributionControl={false}
          center={ROUTE_CENTER}
          className="h-full w-full"
          scrollWheelZoom
          zoom={zoom}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapZoomBridge onZoomChange={setZoom} zoom={zoom} />

          {safetyHeatMapEnabled && (
            <SafetyHeatMap
              bounds={SAFETY_LAYER_BOUNDS}
              error={heatmap.error}
              loading={heatmap.loading}
              points={heatmap.points}
            />
          )}

          <Pane name="route-shadow" style={{ zIndex: 500 }}>
            <Polyline
              pathOptions={{
                color: '#ffffff',
                lineCap: 'round',
                lineJoin: 'round',
                opacity: 0.92,
                weight: 12,
              }}
              positions={ROUTE_POINTS}
            />
          </Pane>

          <Pane name="route-line" style={{ zIndex: 520 }}>
            <Polyline
              pathOptions={{
                color: '#0099D8',
                lineCap: 'round',
                lineJoin: 'round',
                opacity: 0.95,
                weight: 6,
              }}
              positions={ROUTE_POINTS}
            />
          </Pane>

          <Pane name="route-points" style={{ zIndex: 560 }}>
            {routeMarkers.map((point, index) => (
              <CircleMarker
                center={point}
                key={index}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: index === routeMarkers.length - 1 ? '#E91C77' : '#0099D8',
                  fillOpacity: 1,
                  opacity: 1,
                  weight: 3,
                }}
                radius={index === routeMarkers.length - 1 ? 10 : 7}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.94}>
                  {index === 0 ? 'Start' : index === routeMarkers.length - 1 ? destinationName : 'Transfer'}
                </Tooltip>
              </CircleMarker>
            ))}
          </Pane>

          {metroCrimesEnabled && (
            <Pane name="metro-incidents" style={{ zIndex: 620 }}>
              {[
                [34.0489, -118.2518],
                [34.0182, -118.2857],
              ].map((point, index) => (
                <CircleMarker
                  center={point as LatLngExpression}
                  key={index}
                  pathOptions={{
                    color: '#991b1b',
                    fillColor: index === 0 ? '#dc2626' : '#f97316',
                    fillOpacity: 0.78,
                    opacity: 0.88,
                    weight: 2,
                  }}
                  radius={8}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.94}>
                    {index === 0 ? '2 incidents' : '1 incident'}
                  </Tooltip>
                </CircleMarker>
              ))}
            </Pane>
          )}
        </MapContainer>

        <MapControls
          onReset={resetZoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          zoom={zoom}
        />

        {safetyHeatMapEnabled && (
          <div className="absolute bottom-3 left-3 z-[800] rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold text-gray-700">Safety Heat Map</p>
            <div className="space-y-1.5">
              {[
                ['bg-green-500/60', 'Safe / no concern'],
                ['bg-lime-400/80', 'Low risk'],
                ['bg-yellow-400/80', 'Moderate'],
                ['bg-orange-500/80', 'Elevated'],
                ['bg-red-600/80', 'High risk'],
              ].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded ${bg}`} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step-by-step directions */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step-by-step</p>
        </div>
        <div className="px-4 pb-2">
          {route.steps.map((step, i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {step.icon}
                </div>
                {i < route.steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[20px]" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{step.location}</span>
                  <span className="text-xs text-[#0099D8] font-medium">{step.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{step.instruction}</p>
              </div>
            </div>
          ))}
          {/* Destination row */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E91C77]/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#E91C77]" />
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm font-semibold text-[#E91C77]">{destinationName}</span>
              <p className="text-xs text-gray-400 mt-0.5">Arrive in {route.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Route Ready</span>
          </div>
          <span className="text-xs text-gray-500">{route.cost} total</span>
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-[#E91C77] to-[#E95A2B] text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform">
          Start Navigation
        </button>
      </div>
    </div>
  );
}
