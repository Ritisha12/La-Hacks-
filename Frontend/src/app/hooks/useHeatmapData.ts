import { useEffect, useState } from 'react';

export interface HeatmapPoint {
  lat: number;
  lon: number;
  intensity: number;
}

type RawHeatmapPoint = [number, number, number];

const MAX_POINTS_BY_INTENSITY = new Map([
  [0, 150],
  [0.25, 130],
  [0.5, 110],
  [0.75, 70],
]);

function samplePoints(points: HeatmapPoint[], maxPoints: number) {
  if (points.length <= maxPoints) {
    return points;
  }

  const sampled: HeatmapPoint[] = [];
  const step = points.length / maxPoints;

  for (let index = 0; index < maxPoints; index += 1) {
    const point = points[Math.floor(index * step)];
    if (point) {
      sampled.push(point);
    }
  }

  return sampled;
}

export function useHeatmapData(enabled: boolean) {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || points.length > 0) {
      return;
    }

    let cancelled = false;

    fetch('/api/heatmap')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Heatmap backend is not available.');
        }
        return response.json() as Promise<RawHeatmapPoint[]>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        const byIntensity = data
          .map(([lat, lon, intensity]) => ({ lat, lon, intensity }))
          .filter((point) => point.intensity < 1)
          .reduce((groups, point) => {
            const key = point.intensity;
            groups.set(key, [...(groups.get(key) ?? []), point]);
            return groups;
          }, new Map<number, HeatmapPoint[]>());

        const next = [...MAX_POINTS_BY_INTENSITY.entries()]
          .flatMap(([intensity, maxPoints]) => samplePoints(byIntensity.get(intensity) ?? [], maxPoints));

        setPoints(next);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load heatmap data.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, points.length]);

  return { error, loading: enabled && points.length === 0 && !error, points };
}
