import { useEffect } from 'react';

export function SplashScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const t = setTimeout(onStart, 2500);
    return () => clearTimeout(t);
  }, [onStart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-5xl font-bold text-[#E95A2B]">LA</span>
          <span className="text-5xl font-bold text-[#0099D8]">Route</span>
        </div>
        <p className="text-gray-500 text-sm text-center px-8">
          Smart multimodal commuting for Angelenos
        </p>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-[#0099D8] text-white rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-transform hover:bg-[#0077B6]"
      >
        Get Started
      </button>

      {/* 4-color bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex">
        <div className="flex-1 bg-[#FF5722]" />
        <div className="flex-1 bg-[#E91E63]" />
        <div className="flex-1 bg-[#00BCD4]" />
        <div className="flex-1 bg-[#76FF03]" />
      </div>
    </div>
  );
}
