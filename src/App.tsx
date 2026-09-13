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

  // Mobile menu / detail panel visibility state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(true);

  const selectedData = PLANETS.find((p) => p.name === selectedPlanet) || null;

  const handleSelectPlanet = (planetName: string | null) => {
    setSelectedPlanet(planetName);
    setCameraTarget(planetName);
    if (planetName) {
      setIsMobileDetailOpen(true);
    }
  };

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
    <div className="w-screen h-screen bg-black overflow-hidden relative flex flex-col md:flex-row font-sans text-gray-100">

      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-950/90 border-b border-gray-800 z-30 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌌</span>
          <span className="font-bold text-base bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            3D Solar System
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Desktop Sidebar / Mobile Off-Canvas Drawer */}
      <div
        className={`fixed md:relative inset-y-0 left-0 w-80 bg-gray-950/95 backdrop-blur-2xl border-r border-gray-800 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌌</span>
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                3D Solar System
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Interactive Realtime Viewer</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Time Control Section */}
        <div className="p-4 border-b border-gray-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Simulasi Waktu</h3>

          <div className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">
            <button
              onClick={() => handleTimeChange('back')}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 text-white text-xs transition-all"
            >
              ◀◀
            </button>
            <div className="text-center">
              <div className="text-white font-mono text-sm font-medium">
                {simDate.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="text-indigo-400 text-[10px]">Speed: {speed.toFixed(1)}x</div>
            </div>
            <button
              onClick={() => handleTimeChange('forward')}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 text-white text-xs transition-all"
            >
              ▶▶
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                isPlaying
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => setSimDate(new Date())}
              className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-800 transition-colors"
            >
              Hari Ini
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Kecepatan</span>
              <span className="font-mono">{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="50"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Display Toggles */}
        <div className="p-4 border-b border-gray-800/80">
          <h3 className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">Tampilan</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                showLabels
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {showLabels ? '✓ Label Nama' : 'Label Nama'}
            </button>
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                showOrbits
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {showOrbits ? '✓ Garis Orbit' : 'Garis Orbit'}
            </button>
          </div>
        </div>

        {/* Planet Quick Select */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Objek Langit</h3>

          <button
            onClick={() => {
              handleSelectPlanet(null);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              cameraTarget === 'Sun'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'hover:bg-gray-900 text-gray-300'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-400 shadow-md shadow-orange-500/50" />
            <span className="text-sm font-medium">Matahari (Sun)</span>
          </button>

          {PLANETS.map((planet) => (
            <button
              key={planet.name}
              onClick={() => {
                handleSelectPlanet(planet.name);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                selectedPlanet === planet.name || cameraTarget === planet.name
                  ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'hover:bg-gray-900 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="text-sm font-medium">{planet.name}</span>
              </div>
              <span className="text-[11px] text-gray-500">
                {planet.moons} {planet.moons === 1 ? 'satelit' : 'satelit'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive 3D Viewport */}
      <div className="flex-1 h-full relative overflow-hidden">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center bg-black">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <div className="text-indigo-200 font-medium animate-pulse text-sm">Memuat Tata Surya 3D...</div>
            </div>
          }
        >
          <SolarSystemScene
            isPlaying={isPlaying}
            speedMultiplier={speed}
            selectedPlanet={selectedPlanet}
            hoveredPlanet={hoveredPlanet}
            onSelectPlanet={(name) => handleSelectPlanet(name)}
            onHoverPlanet={setHoveredPlanet}
            showLabels={showLabels}
            showOrbits={showOrbits}
            cameraTarget={cameraTarget}
          />
        </Suspense>

        {/* Top Floating Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Active View Title */}
          <div className="pointer-events-auto bg-gray-950/80 backdrop-blur-md rounded-2xl px-4 py-2 border border-gray-800/80 shadow-xl flex items-center gap-3">
            <span className="text-lg">{selectedPlanet ? '🪐' : '🌌'}</span>
            <div>
              <div className="text-xs text-gray-400 font-medium">Mode Tampilan</div>
              <div className="text-sm font-semibold text-white">
                {selectedPlanet ? `${selectedPlanet} (3D Close-up)` : 'Overview Tata Surya'}
              </div>
            </div>
          </div>

          {/* Quick Return Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            {selectedPlanet && (
              <button
                onClick={() => handleSelectPlanet(null)}
                className="bg-indigo-600/90 hover:bg-indigo-600 text-white backdrop-blur-md rounded-xl px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>←</span>
                <span className="hidden sm:inline">Kembali ke Overview</span>
                <span className="sm:hidden">Kembali</span>
              </button>
            )}
          </div>
        </div>

        {/* Planet Detail Bottom Sheet / Floating Card (Mobile & Desktop) */}
        {selectedData && (
          <div
            className={`absolute z-30 transition-all duration-300 ease-in-out ${
              // Desktop layout: Right side card
              'md:top-20 md:right-6 md:bottom-auto md:w-[400px] ' +
              // Mobile layout: Bottom sheet overlay
              'bottom-0 left-0 right-0 max-h-[75vh] md:max-h-[calc(100vh-120px)]'
            }`}
          >
            <div className="bg-gray-950/90 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-full">

              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-800/80 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full shadow-lg ring-2 ring-white/20 flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${lightenColor(selectedData.color, 45)}, ${selectedData.color})`,
                    }}
                  />
                  <div>
                    <h2 className="text-white font-bold text-xl sm:text-2xl">{selectedData.name}</h2>
                    <p className="text-indigo-300 text-xs">
                      {selectedData.moons !== undefined ? `${selectedData.moons} Satelit / Moon` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileDetailOpen(!isMobileDetailOpen)}
                    className="md:hidden text-gray-400 hover:text-white p-1.5 bg-gray-800/60 rounded-xl"
                  >
                    {isMobileDetailOpen ? '▼' : '▲'}
                  </button>
                  <button
                    onClick={() => handleSelectPlanet(null)}
                    className="text-gray-400 hover:text-white p-1.5 bg-gray-800/60 rounded-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              {isMobileDetailOpen && (
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs sm:text-sm">
                  {/* Deskripsi */}
                  <div>
                    <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Tentang</h3>
                    <p className="text-gray-200 leading-relaxed">{selectedData.description}</p>
                  </div>

                  {/* Fun Fact Card */}
                  <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-3.5 shadow-inner">
                    <p className="text-indigo-300 text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span>💡</span> Tahukah Kamu?
                    </p>
                    <p className="text-indigo-100 text-xs leading-relaxed">{selectedData.funFact}</p>
                  </div>

                  {/* Properties Grid */}
                  <div>
                    <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Karakteristik Fisik</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <StatCard icon="📏" label="Diameter" value={selectedData.realDiameter} />
                      <StatCard icon="☀️" label="Jarak Matahari" value={selectedData.realDistance} />
                      <StatCard icon="🔄" label="Periode Orbit" value={selectedData.orbitalPeriod} />
                      <StatCard icon="⚡" label="Kecepatan Orbit" value={`${selectedData.speed.toFixed(2)}x Bumi`} />
                    </div>
                  </div>

                  {/* Size Comparison Bar */}
                  <div className="pt-2 border-t border-gray-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Perbandingan Ukuran</span>
                      <span className="text-indigo-300 font-mono text-xs">{getEarthRatio(selectedData.name).toFixed(2)}x Bumi</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (getEarthRatio(selectedData.name) / 11.2) * 100)}%`,
                          background: `linear-gradient(to right, ${selectedData.color}, ${lightenColor(selectedData.color, 40)})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Additional Facts */}
                  <div className="pt-2 border-t border-gray-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Tipe Planet:</span>
                      <span className="text-gray-200 font-medium">{getPlanetType(selectedData.name)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Suhu Permukaan:</span>
                      <span className="text-gray-200 font-medium">{getTemperature(selectedData.name)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Lama 1 Hari:</span>
                      <span className="text-gray-200 font-medium">{getDayLength(selectedData.name)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Help Instructions (Desktop & Mobile) */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:block pointer-events-none">
          <div className="bg-gray-950/80 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-gray-800 text-[11px] text-gray-400 space-y-0.5">
            <p>🖱️ Putar 360°: Drag Klik Kiri</p>
            <p>🔍 Zoom: Scroll / Pinch Gesture</p>
            <p>🎯 Klik Planet: Mode Viewer Realistis</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-gray-900/60 rounded-xl p-2.5 border border-gray-800/80">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-sm">{icon}</span>
        <span className="text-gray-400 text-[11px] truncate">{label}</span>
      </div>
      <p className="text-white text-xs font-semibold truncate">{value}</p>
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
    Mercury: 'Terrestrial / Kebumian',
    Venus: 'Terrestrial / Kebumian',
    Earth: 'Terrestrial / Kebumian',
    Mars: 'Terrestrial / Kebumian',
    Jupiter: 'Raksasa Gas (Gas Giant)',
    Saturn: 'Raksasa Gas (Gas Giant)',
    Uranus: 'Raksasa Es (Ice Giant)',
    Neptune: 'Raksasa Es (Ice Giant)',
  };
  return types[name] || 'Tidak diketahui';
}

function getTemperature(name: string): string {
  const temps: Record<string, string> = {
    Mercury: '-180°C s/d 430°C',
    Venus: '465°C (Sangat Panas)',
    Earth: '-88°C s/d 58°C',
    Mars: '-140°C s/d 20°C',
    Jupiter: '-145°C',
    Saturn: '-178°C',
    Uranus: '-224°C',
    Neptune: '-214°C',
  };
  return temps[name] || 'Tidak diketahui';
}

function getDayLength(name: string): string {
  const days: Record<string, string> = {
    Mercury: '59 Hari Bumi',
    Venus: '243 Hari Bumi',
    Earth: '24 Jam',
    Mars: '24.6 Jam',
    Jupiter: '9.9 Jam',
    Saturn: '10.7 Jam',
    Uranus: '17.2 Jam',
    Neptune: '16.1 Jam',
  };
  return days[name] || 'Tidak diketahui';
}
