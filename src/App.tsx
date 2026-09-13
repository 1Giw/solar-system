import { useState, Suspense } from 'react';
import SolarSystemScene, { PLANETS, PlanetData } from './components/SolarSystemScene';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [cameraTarget, setCameraTarget] = useState<string | null>(null);
  const [simDate, setSimDate] = useState(new Date());

  const selectedData = PLANETS.find((p) => p.name === selectedPlanet) || null;

  const handleTimeChange = (direction: 'back' | 'forward') => {
    const newDate = new Date(simDate);
    if (direction === 'forward') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSimDate(newDate);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col z-20">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              3D Solar System
            </span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Interactive Viewer</p>
        </div>

        {/* Time Controls */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Time Control</h3>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => handleTimeChange('back')}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
            >
              ◀◀
            </button>
            <div className="text-center">
              <div className="text-white font-mono text-sm">
                {simDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-gray-500 text-xs">
                Speed: {speed.toFixed(1)}x
              </div>
            </div>
            <button
              onClick={() => handleTimeChange('forward')}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
            >
              ▶▶
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                isPlaying
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => setSimDate(new Date())}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
            >
              Today
            </button>
          </div>
          <div className="mt-3">
            <label className="text-gray-400 text-xs mb-1 block">Speed</label>
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-800"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0.1x</span>
              <span>50x</span>
              <span>100x</span>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Display</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                Planet Labels
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                Orbit Paths
              </span>
            </label>
          </div>
        </div>

        {/* Planet List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Objects</h3>
          <div className="space-y-1">
            {/* Sun */}
            <button
              onClick={() => setCameraTarget('Sun')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                cameraTarget === 'Sun'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500" />
              <span className="text-sm font-medium">Sun</span>
            </button>

            {/* Planets */}
            {PLANETS.map((planet) => (
              <button
                key={planet.name}
                onClick={() => {
                  setSelectedPlanet(planet.name);
                  setCameraTarget(planet.name);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                  selectedPlanet === planet.name || cameraTarget === planet.name
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="text-sm font-medium flex-1">{planet.name}</span>
                <span className="text-xs text-gray-500">
                  {planet.moons} {planet.moons === 1 ? 'moon' : 'moons'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D View */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-black">
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
            showLabels={showLabels}
            showOrbits={showOrbits}
            cameraTarget={cameraTarget}
          />
        </Suspense>

        {/* Top Bar - Quick Info */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-800">
            <div className="text-gray-400 text-xs">Simulation Date</div>
            <div className="text-white font-mono text-sm">
              {simDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div className="pointer-events-auto flex gap-2">
            {selectedPlanet && (
              <button
                onClick={() => {
                  setSelectedPlanet(null);
                  setCameraTarget(null);
                }}
                className="bg-blue-600/80 backdrop-blur-md rounded-lg px-4 py-2 border border-blue-500/50 text-white hover:bg-blue-600 transition-all text-sm flex items-center gap-2"
              >
                <span>←</span>
                <span>Back to Overview</span>
              </button>
            )}
            {!selectedPlanet && (
              <button
                onClick={() => setCameraTarget(null)}
                className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-800 text-gray-300 hover:text-white hover:bg-black/80 transition-all text-sm"
              >
                Overview
              </button>
            )}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`backdrop-blur-md rounded-lg px-4 py-2 border transition-all text-sm ${
                showLabels
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                  : 'bg-black/60 border-gray-800 text-gray-300 hover:text-white hover:bg-black/80'
              }`}
            >
              Labels
            </button>
          </div>
        </div>

        {/* Planet Info Panel - Right Side (Zoom View) */}
        {selectedData && (
          <div className="absolute top-20 right-4 z-10 w-[420px] animate-slide-in">
            <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Header with Back Button */}
              <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      setSelectedPlanet(null);
                      setCameraTarget(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm"
                  >
                    <span>←</span>
                    <span>Back to Overview</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlanet(null);
                      setCameraTarget(null);
                    }}
                    className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full shadow-lg ring-2 ring-white/20"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedData.color, 50)}, ${selectedData.color})`,
                    }}
                  />
                  <div>
                    <h2 className="text-white font-bold text-3xl">{selectedData.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedData.moons !== undefined ? `${selectedData.moons} moon${selectedData.moons !== 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {/* Description */}
                <div>
                  <h3 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">About</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedData.description}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <span>💡</span> Fun Fact
                  </p>
                  <p className="text-blue-200 text-sm leading-relaxed">{selectedData.funFact}</p>
                </div>

                {/* Stats Grid */}
                <div>
                  <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Physical Properties</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon="📏" label="Diameter" value={selectedData.realDiameter} />
                    <StatCard icon="☀️" label="Distance from Sun" value={selectedData.realDistance} />
                    <StatCard icon="🔄" label="Orbital Period" value={selectedData.orbitalPeriod} />
                    <StatCard icon="⚡" label="Orbital Speed" value={`${selectedData.speed.toFixed(3)}x Earth`} />
                  </div>
                </div>

                {/* Size Comparison */}
                <div className="pt-3 border-t border-gray-800">
                  <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Size Comparison</h3>
                  <p className="text-gray-500 text-xs mb-2">Relative to Earth</p>
                  <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, getEarthRatio(selectedData.name) * 100)}%`,
                        background: `linear-gradient(to right, ${selectedData.color}, ${lightenColor(selectedData.color, 30)})`,
                      }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2 font-medium">
                    {getEarthRatio(selectedData.name).toFixed(2)}x Earth's diameter
                  </p>
                </div>

                {/* Quick Facts */}
                <div className="pt-3 border-t border-gray-800">
                  <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Quick Facts</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-300">{getPlanetType(selectedData.name)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Temperature:</span>
                      <span className="text-gray-300">{getTemperature(selectedData.name)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Day Length:</span>
                      <span className="text-gray-300">{getDayLength(selectedData.name)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls Hint */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-800">
            <div className="text-gray-500 text-xs space-y-1">
              <p>🖱️ Left drag: Rotate view</p>
              <p>🖱️ Right drag: Pan</p>
              <p>🔲 Scroll: Zoom in/out</p>
              <p>🎯 Click planet: View details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <p className="text-white text-sm font-semibold">{value}</p>
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

function getPlanetType(name: string): string {
  const types: Record<string, string> = {
    Mercury: 'Terrestrial',
    Venus: 'Terrestrial',
    Earth: 'Terrestrial',
    Mars: 'Terrestrial',
    Jupiter: 'Gas Giant',
    Saturn: 'Gas Giant',
    Uranus: 'Ice Giant',
    Neptune: 'Ice Giant',
  };
  return types[name] || 'Unknown';
}

function getTemperature(name: string): string {
  const temps: Record<string, string> = {
    Mercury: '-180°C to 430°C',
    Venus: '465°C (average)',
    Earth: '-88°C to 58°C',
    Mars: '-140°C to 20°C',
    Jupiter: '-145°C (cloud top)',
    Saturn: '-178°C (cloud top)',
    Uranus: '-224°C (cloud top)',
    Neptune: '-214°C (cloud top)',
  };
  return temps[name] || 'Unknown';
}

function getDayLength(name: string): string {
  const days: Record<string, string> = {
    Mercury: '59 Earth days',
    Venus: '243 Earth days',
    Earth: '24 hours',
    Mars: '24.6 hours',
    Jupiter: '9.9 hours',
    Saturn: '10.7 hours',
    Uranus: '17.2 hours',
    Neptune: '16.1 hours',
  };
  return days[name] || 'Unknown';
}
