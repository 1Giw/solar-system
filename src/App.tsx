import { useState, useRef, useEffect, useCallback } from 'react';

interface Planet {
  name: string;
  radius: number; // display radius in pixels
  orbitRadius: number; // display orbit radius in pixels
  color: string;
  realDiameter: string; // km
  realDistance: string; // million km
  orbitalPeriod: string; // Earth days/years
  speed: number; // relative orbital speed
  angle: number; // current angle in radians
  description: string;
}

const PLANETS_DATA: Planet[] = [
  {
    name: 'Mercury',
    radius: 4,
    orbitRadius: 60,
    color: '#b5b5b5',
    realDiameter: '4,879 km',
    realDistance: '57.9 million km',
    orbitalPeriod: '88 days',
    speed: 4.15,
    angle: Math.random() * Math.PI * 2,
    description: 'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.',
  },
  {
    name: 'Venus',
    radius: 7,
    orbitRadius: 95,
    color: '#e8cda0',
    realDiameter: '12,104 km',
    realDistance: '108.2 million km',
    orbitalPeriod: '225 days',
    speed: 1.62,
    angle: Math.random() * Math.PI * 2,
    description: 'The hottest planet with a thick toxic atmosphere. It rotates backwards compared to most planets.',
  },
  {
    name: 'Earth',
    radius: 8,
    orbitRadius: 135,
    color: '#4da6ff',
    realDiameter: '12,756 km',
    realDistance: '149.6 million km',
    orbitalPeriod: '365.25 days',
    speed: 1.0,
    angle: Math.random() * Math.PI * 2,
    description: 'Our home planet! The only known planet with liquid water on its surface and life.',
  },
  {
    name: 'Mars',
    radius: 5,
    orbitRadius: 175,
    color: '#e04a2f',
    realDiameter: '6,792 km',
    realDistance: '227.9 million km',
    orbitalPeriod: '687 days',
    speed: 0.53,
    angle: Math.random() * Math.PI * 2,
    description: 'The Red Planet with the tallest volcano (Olympus Mons) and deepest canyon in the solar system.',
  },
  {
    name: 'Jupiter',
    radius: 18,
    orbitRadius: 235,
    color: '#c88b3a',
    realDiameter: '142,984 km',
    realDistance: '778.6 million km',
    orbitalPeriod: '11.86 years',
    speed: 0.084,
    angle: Math.random() * Math.PI * 2,
    description: 'The largest planet with a Great Red Spot storm that has raged for centuries. Has 95 known moons.',
  },
  {
    name: 'Saturn',
    radius: 15,
    orbitRadius: 300,
    color: '#e8d590',
    realDiameter: '120,536 km',
    realDistance: '1,433.5 million km',
    orbitalPeriod: '29.46 years',
    speed: 0.034,
    angle: Math.random() * Math.PI * 2,
    description: 'Famous for its stunning ring system made of ice and rock. It could float in water (if there was a big enough bathtub).',
  },
  {
    name: 'Uranus',
    radius: 11,
    orbitRadius: 360,
    color: '#7de8e8',
    realDiameter: '51,118 km',
    realDistance: '2,872.5 million km',
    orbitalPeriod: '84.01 years',
    speed: 0.012,
    angle: Math.random() * Math.PI * 2,
    description: 'An ice giant that rotates on its side. It has a blue-green color due to methane in its atmosphere.',
  },
  {
    name: 'Neptune',
    radius: 10,
    orbitRadius: 410,
    color: '#3f54ba',
    realDiameter: '49,528 km',
    realDistance: '4,495.1 million km',
    orbitalPeriod: '164.8 years',
    speed: 0.006,
    angle: Math.random() * Math.PI * 2,
    description: 'The windiest planet with speeds up to 2,100 km/h. It has a deep blue color and 16 known moons.',
  },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const planetsRef = useRef<Planet[]>(PLANETS_DATA.map(p => ({ ...p })));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const size = Math.min(container.clientWidth, container.clientHeight, 900);
        setCanvasSize({ width: size, height: size });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getScaleFactor = useCallback(() => {
    return canvasSize.width / 900;
  }, [canvasSize]);

  // Draw the solar system
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = getScaleFactor();

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      const x = (Math.sin(i * 127.1 + i * 311.7) * 0.5 + 0.5) * width;
      const y = (Math.sin(i * 269.5 + i * 183.3) * 0.5 + 0.5) * height;
      const brightness = Math.random() * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.2 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw orbit paths
    planetsRef.current.forEach((planet) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Sun
    const sunRadius = 30 * scale;
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
    sunGradient.addColorStop(0, '#fff7e6');
    sunGradient.addColorStop(0.3, '#ffcc00');
    sunGradient.addColorStop(0.7, '#ff8c00');
    sunGradient.addColorStop(1, '#ff4500');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, sunRadius, centerX, centerY, sunRadius * 2);
    glowGradient.addColorStop(0, 'rgba(255, 165, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw planets
    planetsRef.current.forEach((planet) => {
      const x = centerX + Math.cos(planet.angle) * planet.orbitRadius * scale;
      const y = centerY + Math.sin(planet.angle) * planet.orbitRadius * scale;
      const planetRadius = planet.radius * scale;

      // Planet glow for selected/hovered
      if (selectedPlanet?.name === planet.name || hoveredPlanet === planet.name) {
        const glowColor = selectedPlanet?.name === planet.name ? 'rgba(255, 255, 100, 0.4)' : 'rgba(255, 255, 255, 0.2)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(x, y, planetRadius + 6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        x - planetRadius * 0.3, y - planetRadius * 0.3, 0,
        x, y, planetRadius
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
      ctx.fill();

      // Saturn's rings
      if (planet.name === 'Saturn') {
        ctx.strokeStyle = 'rgba(210, 180, 120, 0.6)';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.ellipse(x, y, planetRadius * 1.8, planetRadius * 0.5, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(180, 150, 100, 0.4)';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(x, y, planetRadius * 2.1, planetRadius * 0.6, -0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet name label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `${11 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y - planetRadius - 6 * scale);
    });
  }, [canvasSize, getScaleFactor, selectedPlanet, hoveredPlanet]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlayingRef.current) {
        planetsRef.current.forEach((planet) => {
          planet.angle += planet.speed * speedRef.current * deltaTime * 0.5;
        });
      }

      draw(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // Handle click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const scale = getScaleFactor();

    let clicked: Planet | null = null;
    for (const planet of planetsRef.current) {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius * scale;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius * scale;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      const hitRadius = Math.max(planet.radius * scale + 8, 15);
      if (dist <= hitRadius) {
        clicked = planet;
        break;
      }
    }

    if (clicked) {
      setSelectedPlanet(clicked);
    } else {
      setSelectedPlanet(null);
    }
  };

  // Handle mouse move for hover effect
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const scale = getScaleFactor();

    let hovered: string | null = null;
    for (const planet of planetsRef.current) {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius * scale;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius * scale;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      const hitRadius = Math.max(planet.radius * scale + 8, 15);
      if (dist <= hitRadius) {
        hovered = planet.name;
        break;
      }
    }
    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
        🌌 Interactive Solar System
      </h1>
      <p className="text-gray-400 text-sm mb-4 text-center">
        Click on any planet to learn more about it
      </p>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full max-w-6xl">
        {/* Canvas */}
        <div className="relative flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="rounded-2xl border border-white/10 shadow-2xl"
          />
        </div>

        {/* Info Panel & Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-80">
          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>⚙️</span> Controls
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
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
              <button
                onClick={() => {
                  planetsRef.current = PLANETS_DATA.map(p => ({ ...p, angle: Math.random() * Math.PI * 2 }));
                }}
                className="px-4 py-2.5 rounded-xl font-medium text-sm bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/10"
              >
                Reset
              </button>
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Speed: <span className="text-indigo-400 font-semibold">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>
          </div>

          {/* Planet Info */}
          {selectedPlanet ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color})`,
                  }}
                />
                <h2 className="text-white font-bold text-xl">{selectedPlanet.name}</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {selectedPlanet.description}
              </p>
              <div className="space-y-3">
                <InfoRow icon="📏" label="Diameter" value={selectedPlanet.realDiameter} />
                <InfoRow icon="🌍" label="Distance from Sun" value={selectedPlanet.realDistance} />
                <InfoRow icon="🔄" label="Orbital Period" value={selectedPlanet.orbitalPeriod} />
                <InfoRow
                  icon="⚡"
                  label="Relative Speed"
                  value={`${selectedPlanet.speed.toFixed(3)}x Earth`}
                />
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="mt-4 w-full py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                Close ✕
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <h2 className="text-white font-semibold text-lg mb-3">🪐 Planet List</h2>
              <div className="grid grid-cols-2 gap-2">
                {PLANETS_DATA.map((planet) => (
                  <button
                    key={planet.name}
                    onClick={() => setSelectedPlanet(planet)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.color }}
                    />
                    {planet.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm flex items-center gap-2">
        <span>{icon}</span> {label}
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
