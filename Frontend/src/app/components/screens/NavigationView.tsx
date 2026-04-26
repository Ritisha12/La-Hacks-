import { ArrowLeft, MapPin, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { getModeIcon } from '../shared/getModeIcon';
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
  origin: [number, number];
  destination: [number, number];
}

const SAFETY_LAYER_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

const DEFAULT_MAP_ZOOM = 16;

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

export function NavigationView({ onBack, route, destinationName, origin, destination }: Props) {
  const [safetyHeatMapEnabled, setSafetyHeatMapEnabled] = useState(true);
  const [metroCrimesEnabled, setMetroCrimesEnabled]     = useState(false);
  const [zoom, setZoom]                                 = useState(DEFAULT_MAP_ZOOM);
  const [stepsExpanded, setStepsExpanded]               = useState(false);

  const heatmap = useHeatmapData(safetyHeatMapEnabled);
  const routeMarkers = useMemo<LatLngExpression[]>(
    () => route.waypoints.length >= 2 ? route.waypoints : [origin, destination],
    [route.waypoints, origin, destination],
  );

  const eta = new Date(Date.now() + route.timeMinutes * 60000)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const zoomIn  = () => setZoom(v => Math.min(18, v + 1));
  const zoomOut = () => setZoom(v => Math.max(10, v - 1));
  const resetZoom = () => setZoom(DEFAULT_MAP_ZOOM);

  return (
    <div className="h-full w-full relative overflow-hidden">

      {/* Full-screen map */}
      <MapContainer
        attributionControl={false}
        center={origin}
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
            pathOptions={{ color: '#ffffff', lineCap: 'round', lineJoin: 'round', opacity: 0.92, weight: 12 }}
            positions={routeMarkers}
          />
        </Pane>

        <Pane name="route-line" style={{ zIndex: 520 }}>
          <Polyline
            pathOptions={{ color: '#0099D8', lineCap: 'round', lineJoin: 'round', opacity: 0.95, weight: 6 }}
            positions={routeMarkers}
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
            {[[34.0489, -118.2518], [34.0182, -118.2857]].map((point, index) => (
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

      {/* Top overlay — back button + destination + ETA */}
      <div className="absolute top-0 left-0 right-0 z-[800] px-4 pt-4 pb-3 bg-gradient-to-b from-white/95 to-white/0 backdrop-blur-[2px]">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Safety toggles */}
          <div className="flex gap-2">
            <button
              onClick={() => setSafetyHeatMapEnabled(!safetyHeatMapEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm ${
                safetyHeatMapEnabled
                  ? 'bg-[#91A889] text-white border-[#91A889]'
                  : 'bg-white text-gray-400 border-gray-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Safety
            </button>
            <button
              onClick={() => setMetroCrimesEnabled(!metroCrimesEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm ${
                metroCrimesEnabled
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-400 border-gray-300'
              }`}
            >
              🚇 Transit Incidents
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-[#E91C77] flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-800 truncate">{destinationName}</span>
          </div>
          <p className="text-sm text-gray-500 flex-shrink-0 ml-3">
            ETA <span className="font-bold text-gray-900">{eta}</span>
          </p>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute right-4 z-[800]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <MapControls onReset={resetZoom} onZoomIn={zoomIn} onZoomOut={zoomOut} zoom={zoom} />
      </div>

      {/* Safety legend */}
      {safetyHeatMapEnabled && (
        <div className="absolute left-4 z-[800] rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <p className="mb-2 text-xs font-semibold text-gray-700">Safety</p>
          <div className="space-y-1.5">
            {[
              ['bg-green-500/60', 'Safe'],
              ['bg-lime-400/80', 'Low'],
              ['bg-yellow-400/80', 'Moderate'],
              ['bg-orange-500/80', 'Elevated'],
              ['bg-red-600/80', 'High risk'],
            ].map(([bg, label]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${bg}`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom sheet — collapsed by default */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[800] bg-white rounded-t-3xl shadow-2xl transition-all duration-300`}
        style={{ maxHeight: stepsExpanded ? '60%' : '88px' }}
      >
        {/* Handle / summary row */}
        <button
          onClick={() => setStepsExpanded(e => !e)}
          className="w-full px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-800">{route.time} · {route.cost}</span>
            <span className="text-xs text-gray-400">{route.steps.length} steps</span>
          </div>
          {stepsExpanded
            ? <ChevronDown className="w-5 h-5 text-gray-400" />
            : <ChevronUp   className="w-5 h-5 text-gray-400" />
          }
        </button>

        {/* Steps — visible when expanded */}
        {stepsExpanded && (
          <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(60vh - 88px)' }}>
            {route.steps.map((step, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0099D8] to-[#00B8E6] flex items-center justify-center flex-shrink-0">
                    {getModeIcon(step.mode, 'sm')}
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
        )}
      </div>
    </div>
  );
}
