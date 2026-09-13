import { useState, Suspense } from 'react';
import SolarSystemScene, { PLANETS } from './components/SolarSystemScene';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const selectedData = PLANETS.find((p) => p.name === selectedPlanet) || null;

  return (
    <div className="w-screen h-screen bg-[#050510] overflow-hidden relative flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🌌</span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Solar System Explorer
            </span>
          </h1>
          <p className="text-gray-500 text-xs md:text-sm ml-10">
            Drag to rotate • Scroll to zoom • Click planets for info
          </p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-lg animate-pulse">Loading Solar System...</div>
            </div>
          }
        >
          <SolarSystemScene
            isPlaying={isPlaying}
            speedMultiplier={speed}
            selectedPlanet={selectedPlanet}
            hoveredPlanet={hoveredPlanet}
            onSelectPlanet={setSelectedPlanet}
            onHoverPlanet={setHoveredPlanet}
          />
        </Suspense>
      </div>

      {/* Controls Panel - Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4 flex items-center gap-6 shadow-2xl">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Play
              </>
            )}
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm whitespace-nowrap">Speed:</span>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-28 md:w-40 h-1.5 rounded-full appearance-none cursor-pointer bg-white/10"
            />
            <span className="text-indigo-400 font-semibold text-sm w-10">{speed.toFixed(1)}x</span>
          </div>

          {/* Speed presets */}
          <div className="hidden md:flex items-center gap-1">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  speed === s
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Planet Info Panel - Right Side */}
      {selectedData && (
        <div className="absolute top-20 right-4 z-10 w-80 animate-slide-in">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white/20"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedData.color, 50)}, ${selectedData.color})`,
                  }}
                />
                <div>
                  <h2 className="text-white font-bold text-xl">{selectedData.name}</h2>
                  <p className="text-gray-500 text-xs">
                    {selectedData.moons !== undefined ? `${selectedData.moons} moon${selectedData.moons !== 1 ? 's' : ''}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {selectedData.description}
            </p>

            {/* Stats */}
            <div className="space-y-2">
              <StatRow icon="📏" label="Diameter" value={selectedData.realDiameter} />
              <StatRow icon="☀️" label="Distance from Sun" value={selectedData.realDistance} />
              <StatRow icon="🔄" label="Orbital Period" value={selectedData.orbitalPeriod} />
              <StatRow
                icon="⚡"
                label="Orbital Speed"
                value={`${selectedData.speed.toFixed(3)}x Earth`}
              />
            </div>

            {/* Size comparison bar */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-gray-500 text-xs mb-2">Size relative to Earth</p>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, getEarthRatio(selectedData.name) * 100)}%`,
                    background: `linear-gradient(to right, ${selectedData.color}, ${lightenColor(selectedData.color, 30)})`,
                  }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {getEarthRatio(selectedData.name).toFixed(2)}x Earth's diameter
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planet Quick Select - Left Side */}
      {!selectedData && (
        <div className="absolute top-20 left-4 z-10">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3 shadow-2xl">
            <p className="text-gray-500 text-xs mb-2 px-1">Planets</p>
            <div className="flex flex-col gap-1">
              {PLANETS.map((planet) => (
                <button
                  key={planet.name}
                  onClick={() => setSelectedPlanet(planet.name)}
                  onMouseEnter={() => setHoveredPlanet(planet.name)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 text-left ${
                    hoveredPlanet === planet.name
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: planet.color }}
                  />
                  <span>{planet.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3D controls hint */}
      <div className="absolute bottom-20 left-4 z-10 hidden md:block">
        <div className="text-gray-600 text-xs space-y-1">
          <p>🖱️ Left drag: Rotate</p>
          <p>🖱️ Right drag: Pan</p>
          <p>🔲 Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
      <span className="text-gray-400 text-sm flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function getEarthRatio(name: string): number {
  const ratios: Record<string, number> = {
    Mercury: 0.38,
    Venus: 0.95,
    Earth: 1.0,
    Mars: 0.53,
    Jupiter: 11.2,
    Saturn: 9.45,
    Uranus: 4.0,
    Neptune: 3.88,
  };
  return ratios[name] || 1;
}
