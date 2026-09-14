import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function CustomLoader() {
  const { active, progress, item, loaded, total } = useProgress();
  const [show, setShow] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly update display progress so it never gets stuck at 0%
  useEffect(() => {
    const rounded = Math.round(progress);
    setDisplayProgress((prev) => Math.max(prev, rounded));
  }, [progress]);

  // Fade out / hide after loading finishes
  useEffect(() => {
    if (!active || progress >= 100) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [active, progress]);

  if (!show && (!active || progress >= 100)) return null;

  const currentPercent = Math.min(100, Math.max(0, displayProgress || Math.round(progress)));

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-700 ${
        (!active || progress >= 100) ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-64 h-64 bg-purple-600/15 rounded-full blur-2xl animate-pulse delay-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Animated Planet / Orbit Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Orbit Ring */}
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/40 animate-[spin_10s_linear_infinite]" />
          {/* Inner Glowing Core */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center animate-pulse">
            <span className="text-2xl select-none">🌌</span>
          </div>
          {/* Satellite orbiter */}
          <div className="absolute w-28 h-28 animate-[spin_4s_linear_infinite]">
            <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-md shadow-cyan-400/80 -top-1 left-1/2 -translate-x-1/2 relative" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent mb-1">
          Tata Surya 3D
        </h2>
        <p className="text-xs text-gray-400 mb-6 font-medium tracking-wide">
          Memuat Aset & Tekstur Kosmik...
        </p>

        {/* Progress percentage text */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-5xl font-extrabold text-white font-mono tracking-tight">
            {currentPercent}
          </span>
          <span className="text-2xl font-semibold text-indigo-400">%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-gray-900/90 border border-gray-800 rounded-full p-1 shadow-inner mb-4 relative overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Item & status info */}
        <div className="flex flex-col items-center gap-1 text-xs">
          <div className="text-gray-400 flex items-center gap-2">
            <span>Aset Dimuat:</span>
            <span className="font-mono font-semibold text-indigo-300">
              {loaded} / {total > 0 ? total : 15}
            </span>
          </div>
          {item && (
            <p className="text-[11px] text-gray-500 max-w-xs truncate font-mono mt-1">
              {item}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
