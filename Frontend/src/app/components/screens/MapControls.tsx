interface Props {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}

export function MapControls({ onReset, onZoomIn, onZoomOut, zoom }: Props) {
  return (
    <div className="absolute right-4 top-4 z-[800] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <button
        aria-label="Zoom in"
        className="h-10 w-10 border-b border-gray-200 text-lg font-bold text-gray-800 active:bg-gray-100"
        onClick={onZoomIn}
        type="button"
      >
        +
      </button>
      <button
        aria-label="Zoom out"
        className="h-10 w-10 border-b border-gray-200 text-lg font-bold text-gray-800 active:bg-gray-100"
        onClick={onZoomOut}
        type="button"
      >
        -
      </button>
      <button
        aria-label="Reset zoom"
        className="h-10 w-10 text-[10px] font-semibold text-gray-600 active:bg-gray-100"
        onClick={onReset}
        title={`Reset zoom (${zoom.toFixed(0)})`}
        type="button"
      >
        Reset
      </button>
    </div>
  );
}
