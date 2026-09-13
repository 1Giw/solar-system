import * as THREE from 'three';

// Simple seeded random for consistent noise
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 2D noise function
function noise2D(x: number, y: number, seed: number = 0): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise with interpolation
function smoothNoise(x: number, y: number, seed: number = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smoothstep
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = noise2D(ix, iy, seed);
  const b = noise2D(ix + 1, iy, seed);
  const c = noise2D(ix, iy + 1, seed);
  const d = noise2D(ix + 1, iy + 1, seed);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// Fractal Brownian Motion
function fbm(x: number, y: number, octaves: number = 6, seed: number = 0): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 100);
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
}

// Color interpolation
function lerpColor(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number): [number, number, number] {
  return [
    Math.floor(r1 + (r2 - r1) * t),
    Math.floor(g1 + (g2 - g1) * t),
    Math.floor(b1 + (b2 - b1) * t),
  ];
}

export function createSunTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 8;
      const ny = y / size * 8;

      // Multiple noise layers for sun surface
      const n1 = fbm(nx, ny, 6, 42);
      const n2 = fbm(nx * 2, ny * 2, 4, 123);
      const n3 = fbm(nx * 4, ny * 4, 3, 456);

      // Granulation pattern
      const granulation = fbm(nx * 10, ny * 10, 3, 789);

      // Combine for sun surface
      const intensity = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      const hotSpots = Math.pow(n2, 2) * 1.5;

      // Sun colors: deep red/orange to bright yellow/white
      let r: number, g: number, b: number;

      if (intensity < 0.3) {
        // Dark sunspot areas
        [r, g, b] = lerpColor(180, 60, 0, 255, 120, 0, intensity / 0.3);
      } else if (intensity < 0.6) {
        // Mid tones - orange
        [r, g, b] = lerpColor(255, 120, 0, 255, 180, 30, (intensity - 0.3) / 0.3);
      } else if (intensity < 0.85) {
        // Bright areas - yellow
        [r, g, b] = lerpColor(255, 180, 30, 255, 230, 80, (intensity - 0.6) / 0.25);
      } else {
        // Hot spots - white/yellow
        [r, g, b] = lerpColor(255, 230, 80, 255, 255, 200, (intensity - 0.85) / 0.15);
      }

      // Add granulation
      r = Math.min(255, r + granulation * 30);
      g = Math.min(255, g + granulation * 20);
      b = Math.min(255, b + hotSpots * 50);

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMercuryTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const rand = seededRandom(12345);

  // Generate craters
  const craters: Array<{ x: number; y: number; r: number; depth: number }> = [];
  for (let i = 0; i < 200; i++) {
    craters.push({
      x: rand() * size,
      y: rand() * size,
      r: rand() * 30 + 5,
      depth: rand() * 0.3 + 0.1,
    });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 10;
      const ny = y / size * 10;

      // Base terrain noise
      const terrain = fbm(nx, ny, 5, 111);

      // Calculate crater influence
      let craterEffect = 0;
      for (const crater of craters) {
        const dx = x - crater.x;
        const dy = y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < crater.r * 1.5) {
          const normalizedDist = dist / crater.r;
          if (normalizedDist < 1) {
            // Inside crater - darker
            craterEffect -= crater.depth * (1 - normalizedDist * normalizedDist);
          } else if (normalizedDist < 1.5) {
            // Crater rim - lighter
            craterEffect += crater.depth * 0.5 * (1.5 - normalizedDist) * 2;
          }
        }
      }

      const value = terrain * 0.4 + 0.3 + craterEffect;

      // Mercury colors: gray with brownish tint
      const base = Math.max(0, Math.min(1, value));
      const r = Math.floor(140 * base + 60);
      const g = Math.floor(125 * base + 50);
      const b = Math.floor(100 * base + 40);

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createVenusTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 6;
      const ny = y / size * 6;

      // Swirling cloud patterns
      const swirl = fbm(nx + Math.sin(ny * 2) * 0.5, ny + Math.cos(nx * 2) * 0.5, 5, 222);
      const clouds = fbm(nx * 2, ny * 2, 4, 333);

      const value = swirl * 0.6 + clouds * 0.4;

      // Venus colors: yellowish-orange with cloud bands
      const r = Math.floor(200 + value * 55);
      const g = Math.floor(160 + value * 50);
      const b = Math.floor(80 + value * 40);

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createEarthTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 8;
      const ny = y / size * 8;

      // Latitude for polar ice
      const lat = Math.abs(y / size - 0.5) * 2;

      // Continent/ocean determination
      const continentNoise = fbm(nx, ny, 6, 444);
      const detailNoise = fbm(nx * 3, ny * 3, 4, 555);

      // Create continent shapes
      const isLand = continentNoise > 0.48;
      const isPolar = lat > 0.85;

      let r: number, g: number, b: number;

      if (isPolar) {
        // Ice caps - white
        const iceIntensity = (lat - 0.85) / 0.15;
        [r, g, b] = lerpColor(220, 230, 240, 255, 255, 255, iceIntensity);
      } else if (isLand) {
        // Land - green/brown with variation
        const elevation = detailNoise;
        if (elevation > 0.6) {
          // Mountains - brown/gray
          [r, g, b] = lerpColor(120, 100, 70, 160, 140, 100, (elevation - 0.6) / 0.4);
        } else if (elevation > 0.3) {
          // Forest - green
          [r, g, b] = lerpColor(40, 100, 40, 80, 130, 50, (elevation - 0.3) / 0.3);
        } else {
          // Plains - light green/yellow
          [r, g, b] = lerpColor(100, 140, 60, 140, 160, 80, elevation / 0.3);
        }

        // Desert bands near equator
        if (lat < 0.3 && detailNoise > 0.5) {
          [r, g, b] = lerpColor(r, g, b, 200, 180, 120, 0.5);
        }
      } else {
        // Ocean - blue with depth variation
        const depth = continentNoise;
        if (depth > 0.35) {
          // Shallow water
          [r, g, b] = lerpColor(30, 80, 160, 60, 120, 180, (depth - 0.35) / 0.13);
        } else {
          // Deep ocean
          [r, g, b] = lerpColor(10, 30, 80, 30, 80, 160, depth / 0.35);
        }
      }

      // Cloud overlay
      const clouds = fbm(nx * 1.5 + 10, ny * 1.5 + 10, 4, 666);
      if (clouds > 0.55) {
        const cloudIntensity = (clouds - 0.55) / 0.45;
        [r, g, b] = lerpColor(r, g, b, 255, 255, 255, cloudIntensity * 0.6);
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMarsTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const rand = seededRandom(789);

  // Craters for Mars
  const craters: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < 80; i++) {
    craters.push({
      x: rand() * size,
      y: rand() * size,
      r: rand() * 20 + 3,
    });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 8;
      const ny = y / size * 8;
      const lat = Math.abs(y / size - 0.5) * 2;

      // Terrain
      const terrain = fbm(nx, ny, 5, 777);
      const detail = fbm(nx * 3, ny * 3, 3, 888);

      // Polar ice caps
      const isPolar = lat > 0.9;

      // Crater effect
      let craterEffect = 0;
      for (const crater of craters) {
        const dx = x - crater.x;
        const dy = y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < crater.r * 1.3) {
          const normalizedDist = dist / crater.r;
          if (normalizedDist < 1) {
            craterEffect -= 0.15 * (1 - normalizedDist * normalizedDist);
          } else {
            craterEffect += 0.1 * (1.3 - normalizedDist) * 3;
          }
        }
      }

      let r: number, g: number, b: number;

      if (isPolar) {
        // Ice caps
        const iceIntensity = (lat - 0.9) / 0.1;
        [r, g, b] = lerpColor(200, 180, 160, 240, 235, 230, iceIntensity);
      } else {
        // Mars surface - red/orange with variation
        const value = terrain * 0.5 + detail * 0.3 + 0.2 + craterEffect;

        // Dark regions (volcanic plains)
        if (terrain < 0.4) {
          [r, g, b] = lerpColor(120, 60, 30, 160, 80, 40, terrain / 0.4);
        } else {
          // Bright regions (dusty highlands)
          [r, g, b] = lerpColor(160, 80, 40, 210, 130, 70, (terrain - 0.4) / 0.6);
        }

        // Add some variation
        r = Math.floor(r + value * 30);
        g = Math.floor(g + value * 15);
        b = Math.floor(b + value * 10);
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createJupiterTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 10;
      const ny = y / size;

      // Horizontal bands
      const bandFreq = ny * 20;
      const band = Math.sin(bandFreq) * 0.5 + 0.5;

      // Turbulence in bands
      const turbulence = fbm(nx + Math.sin(ny * 10) * 0.3, ny * 5, 5, 999);

      // Combine
      const value = band * 0.6 + turbulence * 0.4;

      // Great Red Spot
      const spotCenterX = 0.6;
      const spotCenterY = 0.55;
      const spotDx = (x / size - spotCenterX) * 2;
      const spotDy = (y / size - spotCenterY) * 4;
      const spotDist = Math.sqrt(spotDx * spotDx + spotDy * spotDy);
      const isSpot = spotDist < 0.15;

      let r: number, g: number, b: number;

      if (isSpot) {
        // Great Red Spot
        const spotIntensity = 1 - spotDist / 0.15;
        const swirl = fbm(nx * 3 + spotDx * 5, ny * 3 + spotDy * 5, 3, 1111);
        [r, g, b] = lerpColor(200, 100, 60, 180, 60, 30, swirl * spotIntensity);
      } else {
        // Jupiter bands - alternating light and dark
        if (value < 0.3) {
          // Dark bands
          [r, g, b] = lerpColor(140, 90, 50, 180, 120, 70, value / 0.3);
        } else if (value < 0.6) {
          // Mid tones - orange/tan
          [r, g, b] = lerpColor(180, 120, 70, 220, 170, 100, (value - 0.3) / 0.3);
        } else {
          // Light bands - cream/white
          [r, g, b] = lerpColor(220, 170, 100, 240, 210, 150, (value - 0.6) / 0.4);
        }
      }

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createSaturnTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 8;
      const ny = y / size;

      // Horizontal bands (less turbulent than Jupiter)
      const bandFreq = ny * 15;
      const band = Math.sin(bandFreq) * 0.5 + 0.5;
      const turbulence = fbm(nx, ny * 4, 4, 2222);

      const value = band * 0.7 + turbulence * 0.3;

      // Saturn colors - golden/cream
      let r: number, g: number, b: number;

      if (value < 0.4) {
        [r, g, b] = lerpColor(180, 150, 90, 210, 180, 120, value / 0.4);
      } else if (value < 0.7) {
        [r, g, b] = lerpColor(210, 180, 120, 230, 200, 140, (value - 0.4) / 0.3);
      } else {
        [r, g, b] = lerpColor(230, 200, 140, 245, 225, 170, (value - 0.7) / 0.3);
      }

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createUranusTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 6;
      const ny = y / size;

      // Subtle bands
      const band = Math.sin(ny * 8) * 0.15;
      const clouds = fbm(nx, ny * 3, 4, 3333);

      const value = 0.5 + band + clouds * 0.2;

      // Uranus - pale blue-green
      const r = Math.floor(130 + value * 40);
      const g = Math.floor(200 + value * 30);
      const b = Math.floor(210 + value * 30);

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createNeptuneTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 8;
      const ny = y / size;

      // Bands and storms
      const band = Math.sin(ny * 12) * 0.2;
      const storms = fbm(nx, ny * 4, 5, 4444);
      const clouds = fbm(nx * 2, ny * 2, 3, 5555);

      const value = 0.5 + band + storms * 0.2 + clouds * 0.1;

      // Dark Spot feature
      const spotX = 0.4;
      const spotY = 0.45;
      const spotDx = (x / size - spotX) * 2;
      const spotDy = (y / size - spotY) * 3;
      const spotDist = Math.sqrt(spotDx * spotDx + spotDy * spotDy);
      const isSpot = spotDist < 0.1;

      let r: number, g: number, b: number;

      if (isSpot) {
        // Great Dark Spot - darker blue
        const spotIntensity = 1 - spotDist / 0.1;
        [r, g, b] = lerpColor(40, 60, 180, 20, 30, 120, spotIntensity);
      } else {
        // Neptune - deep blue
        r = Math.floor(40 + value * 40);
        g = Math.floor(70 + value * 50);
        b = Math.floor(180 + value * 60);
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createSaturnRingTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let x = 0; x < width; x++) {
    const t = x / width;

    // Ring gaps and density variations
    const cassiniGap = Math.abs(t - 0.6) < 0.02 ? 0 : 1;
    const enckeGap = Math.abs(t - 0.85) < 0.01 ? 0 : 1;

    // Density varies across rings
    const density = (Math.sin(t * 50) * 0.3 + 0.7) * cassiniGap * enckeGap;

    // Color variation
    const colorNoise = noise2D(t * 20, 0, 6666);

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;

      const r = Math.floor(200 + colorNoise * 40);
      const g = Math.floor(180 + colorNoise * 30);
      const b = Math.floor(140 + colorNoise * 20);
      const a = Math.floor(density * 200 * (0.8 + colorNoise * 0.2));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}
