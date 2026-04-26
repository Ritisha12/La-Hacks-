import { AlertTriangle } from 'lucide-react';
import type { LatLngBoundsExpression, PathOptions } from 'leaflet';
import { Circle, Pane, Rectangle } from 'react-leaflet';
import type { HeatmapPoint } from '../../hooks/useHeatmapData';

interface Props {
  bounds: LatLngBoundsExpression;
  error: string | null;
  loading: boolean;
  points: HeatmapPoint[];
}

function pointStyle(intensity: number): PathOptions {
  const risk = 1 - intensity;
  const fillColor =
    intensity >= 0.75 ? '#a3e635'
      : intensity >= 0.5 ? '#facc15'
        : intensity >= 0.25 ? '#fb923c'
          : '#dc2626';

  return {
    color: fillColor,
    fillColor,
    fillOpacity: 0.32 + risk * 0.32,
    opacity: 0.1 + risk * 0.16,
    stroke: true,
    weight: 1,
  };
}

export function SafetyHeatMap({ bounds, error, loading, points }: Props) {
  return (
    <>
      <Pane name="safety-heatmap" style={{ filter: 'blur(5px) saturate(1.35)', zIndex: 420 }}>
        <Rectangle
          bounds={bounds}
          pathOptions={{
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.18,
            opacity: 0,
            stroke: false,
          }}
        />
        {points.map((point, index) => {
          const risk = 1 - point.intensity;

          return (
            <Circle
              center={[point.lat, point.lon]}
              key={`${point.lat}-${point.lon}-${index}`}
              pathOptions={pointStyle(point.intensity)}
              radius={120 + risk * 330}
            />
          );
        })}
      </Pane>

      {loading && (
        <div className="absolute left-4 top-4 z-[800] rounded-xl bg-white/95 px-3 py-2 shadow-md">
          <p className="text-xs font-medium text-gray-700">Loading Safety Heat Map...</p>
        </div>
      )}

      {error && (
        <div className="absolute left-4 top-4 z-[800] rounded-xl border border-orange-200 bg-white/95 px-3 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <p className="text-xs font-medium text-orange-700">{error}</p>
          </div>
        </div>
      )}
    </>
  );
}
