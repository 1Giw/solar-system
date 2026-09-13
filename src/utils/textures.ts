import * as THREE from 'three';

// Seeded random generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 2D Noise
function noise2D(x: number, y: number, seed: number = 0): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise
function smoothNoise(x: number, y: number, seed: number = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

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

// Color lerp helper
function lerpColor(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number): [number, number, number] {
  const clampedT = Math.max(0, Math.min(1, t));
  return [
    Math.floor(r1 + (r2 - r1) * clampedT),
    Math.floor(g1 + (g2 - g1) * clampedT),
    Math.floor(b1 + (b2 - b1) * clampedT),
  ];
}

/* ========================================================================
   SUN TEXTURE
   ======================================================================== */
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
      const nx = (x / size) * 8;
      const ny = (y / size) * 8;

      const n1 = fbm(nx, ny, 6, 42);
      const n2 = fbm(nx * 2, ny * 2, 4, 123);
      const n3 = fbm(nx * 4, ny * 4, 3, 456);
      const granulation = fbm(nx * 12, ny * 12, 3, 789);

      const intensity = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      const hotSpots = Math.pow(n2, 2.2) * 1.8;

      let r: number, g: number, b: number;
      if (intensity < 0.28) {
        [r, g, b] = lerpColor(160, 40, 0, 240, 90, 0, intensity / 0.28);
      } else if (intensity < 0.55) {
        [r, g, b] = lerpColor(240, 90, 0, 255, 170, 10, (intensity - 0.28) / 0.27);
      } else if (intensity < 0.8) {
        [r, g, b] = lerpColor(255, 170, 10, 255, 225, 70, (intensity - 0.55) / 0.25);
      } else {
        [r, g, b] = lerpColor(255, 225, 70, 255, 250, 210, (intensity - 0.8) / 0.2);
      }

      r = Math.min(255, r + granulation * 35);
      g = Math.min(255, g + granulation * 25);
      b = Math.min(255, b + hotSpots * 60);

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

/* ========================================================================
   MERCURY TEXTURE & BUMP
   ======================================================================== */
export function createMercuryTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const rand = seededRandom(12345);

  const craters: Array<{ x: number; y: number; r: number; depth: number }> = [];
  for (let i = 0; i < 350; i++) {
    craters.push({
      x: rand() * size,
      y: rand() * size,
      r: rand() * 35 + 4,
      depth: rand() * 0.35 + 0.1,
    });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * 12;
      const ny = (y / size) * 12;

      const terrain = fbm(nx, ny, 6, 111);
      const fineNoise = fbm(nx * 4, ny * 4, 3, 222);

      let craterEffect = 0;
      for (const crater of craters) {
        let dx = Math.abs(x - crater.x);
        if (dx > size / 2) dx = size - dx;
        const dy = y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < crater.r * 1.6) {
          const norm = dist / crater.r;
          if (norm < 0.85) {
            craterEffect -= crater.depth * (1 - norm * norm);
          } else if (norm < 1.35) {
            craterEffect += crater.depth * 0.6 * (1.35 - norm);
          }
        }
      }

      const val = Math.max(0, Math.min(1, terrain * 0.45 + fineNoise * 0.25 + 0.3 + craterEffect));
      const r = Math.floor(165 * val + 45);
      const g = Math.floor(150 * val + 40);
      const b = Math.floor(135 * val + 35);

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

export function createMercuryBumpMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const rand = seededRandom(12345);

  const craters: Array<{ x: number; y: number; r: number; depth: number }> = [];
  for (let i = 0; i < 200; i++) {
    craters.push({
      x: rand() * size,
      y: rand() * size,
      r: rand() * 20 + 3,
      depth: rand() * 0.5 + 0.2,
    });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * 10;
      const ny = (y / size) * 10;

      const terrain = fbm(nx, ny, 5, 111);
      let craterEffect = 0;

      for (const crater of craters) {
        let dx = Math.abs(x - crater.x);
        if (dx > size / 2) dx = size - dx;
        const dy = y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < crater.r * 1.5) {
          const norm = dist / crater.r;
          if (norm < 0.85) {
            craterEffect -= crater.depth * (1 - norm);
          } else if (norm < 1.3) {
            craterEffect += crater.depth * 0.7 * (1.3 - norm);
          }
        }
      }

      const val = Math.max(0, Math.min(1, terrain * 0.5 + 0.4 + craterEffect));
      const grey = Math.floor(val * 255);

      data[idx] = grey;
      data[idx + 1] = grey;
      data[idx + 2] = grey;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* ========================================================================
   VENUS TEXTURE
   ======================================================================== */
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
      const nx = (x / size) * 6;
      const ny = (y / size) * 6;

      const swirl1 = fbm(nx + Math.sin(ny * 2.5) * 0.8, ny + Math.cos(nx * 2.5) * 0.8, 5, 222);
      const swirl2 = fbm(nx * 2, ny * 2, 4, 333);
      const bands = Math.sin((y / size) * Math.PI * 10) * 0.15;

      const val = swirl1 * 0.5 + swirl2 * 0.35 + bands + 0.15;

      let r: number, g: number, b: number;
      if (val < 0.35) {
        [r, g, b] = lerpColor(180, 110, 40, 215, 150, 70, val / 0.35);
      } else if (val < 0.7) {
        [r, g, b] = lerpColor(215, 150, 70, 245, 200, 120, (val - 0.35) / 0.35);
      } else {
        [r, g, b] = lerpColor(245, 200, 120, 255, 235, 180, (val - 0.7) / 0.3);
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

/* ========================================================================
   EARTH TEXTURE, BUMP & CLOUDS
   ======================================================================== */
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
      const nx = (x / size) * 8;
      const ny = (y / size) * 8;
      const lat = Math.abs(y / size - 0.5) * 2;

      const continentNoise = fbm(nx, ny, 6, 444);
      const detailNoise = fbm(nx * 3, ny * 3, 4, 555);

      const isLand = continentNoise > 0.47;
      const isPolar = lat > 0.82;

      let r: number, g: number, b: number;

      if (isPolar) {
        const iceIntensity = Math.min(1, (lat - 0.82) / 0.18);
        [r, g, b] = lerpColor(210, 225, 240, 250, 255, 255, iceIntensity);
      } else if (isLand) {
        const elevation = detailNoise;
        if (elevation > 0.65) {
          [r, g, b] = lerpColor(110, 90, 60, 170, 150, 120, (elevation - 0.65) / 0.35);
        } else if (elevation > 0.35) {
          [r, g, b] = lerpColor(35, 95, 35, 90, 135, 45, (elevation - 0.35) / 0.3);
        } else {
          [r, g, b] = lerpColor(90, 130, 55, 140, 160, 75, elevation / 0.35);
        }

        // Deserts near latitude 0.15 - 0.4
        if (lat > 0.12 && lat < 0.42 && detailNoise > 0.45) {
          [r, g, b] = lerpColor(r, g, b, 210, 185, 125, 0.65);
        }
      } else {
        const depth = continentNoise;
        if (depth > 0.36) {
          [r, g, b] = lerpColor(25, 80, 155, 55, 130, 200, (depth - 0.36) / 0.11);
        } else {
          [r, g, b] = lerpColor(5, 20, 70, 25, 80, 155, depth / 0.36);
        }
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

export function createEarthBumpMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * 8;
      const ny = (y / size) * 8;

      const continentNoise = fbm(nx, ny, 6, 444);
      const detail = fbm(nx * 3, ny * 3, 4, 555);

      let h = 0;
      if (continentNoise > 0.47) {
        h = 100 + detail * 155;
      } else {
        h = continentNoise * 100;
      }

      const grey = Math.floor(Math.max(0, Math.min(255, h)));
      data[idx] = grey;
      data[idx + 1] = grey;
      data[idx + 2] = grey;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createEarthCloudTexture(): THREE.CanvasTexture {
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
      const nx = (x / size) * 10;
      const ny = (y / size) * 10;

      const clouds = fbm(nx + Math.sin(ny * 2) * 0.4, ny + Math.cos(nx * 2) * 0.4, 5, 666);
      const detail = fbm(nx * 2, ny * 2, 3, 777);

      const val = clouds * 0.7 + detail * 0.3;
      const alpha = val > 0.48 ? Math.min(240, (val - 0.48) * 500) : 0;

      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* ========================================================================
   MARS TEXTURE & BUMP
   ======================================================================== */
export function createMarsTexture(): THREE.CanvasTexture {
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
      const nx = (x / size) * 8;
      const ny = (y / size) * 8;
      const lat = Math.abs(y / size - 0.5) * 2;

      const terrain = fbm(nx, ny, 6, 777);
      const detail = fbm(nx * 3, ny * 3, 4, 888);

      const isPolar = lat > 0.88;

      let r: number, g: number, b: number;
      if (isPolar) {
        const iceIntensity = (lat - 0.88) / 0.12;
        [r, g, b] = lerpColor(210, 180, 160, 245, 240, 235, iceIntensity);
      } else {
        if (terrain < 0.42) {
          [r, g, b] = lerpColor(110, 45, 20, 160, 70, 30, terrain / 0.42);
        } else if (terrain < 0.75) {
          [r, g, b] = lerpColor(160, 70, 30, 215, 115, 50, (terrain - 0.42) / 0.33);
        } else {
          [r, g, b] = lerpColor(215, 115, 50, 240, 150, 70, (terrain - 0.75) / 0.25);
        }

        r = Math.min(255, Math.max(0, r + (detail - 0.5) * 30));
        g = Math.min(255, Math.max(0, g + (detail - 0.5) * 15));
        b = Math.min(255, Math.max(0, b + (detail - 0.5) * 10));
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

export function createMarsBumpMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * 8;
      const ny = (y / size) * 8;

      const terrain = fbm(nx, ny, 5, 777);
      const detail = fbm(nx * 3, ny * 3, 3, 888);

      const val = Math.floor((terrain * 0.7 + detail * 0.3) * 255);

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* ========================================================================
   JUPITER TEXTURE
   ======================================================================== */
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
      const nx = (x / size) * 12;
      const ny = y / size;

      const bandFreq = ny * 24;
      const band = Math.sin(bandFreq) * 0.5 + 0.5;
      const turbulence = fbm(nx + Math.sin(ny * 12) * 0.4, ny * 6, 5, 999);

      const val = band * 0.55 + turbulence * 0.45;

      // Great Red Spot
      const spotCenterX = 0.65;
      const spotCenterY = 0.58;
      let dx = Math.abs(x / size - spotCenterX);
      if (dx > 0.5) dx = 1 - dx;
      const dy = (y / size - spotCenterY) * 2.2;
      const spotDist = Math.sqrt(dx * dx * 16 + dy * dy * 4);

      let r: number, g: number, b: number;

      if (spotDist < 0.35) {
        const spotFactor = 1 - spotDist / 0.35;
        const swirl = fbm(nx * 3, ny * 3, 3, 1111);
        [r, g, b] = lerpColor(210, 80, 40, 170, 50, 25, swirl * spotFactor);
      } else {
        if (val < 0.3) {
          [r, g, b] = lerpColor(135, 80, 45, 175, 115, 65, val / 0.3);
        } else if (val < 0.6) {
          [r, g, b] = lerpColor(175, 115, 65, 225, 175, 110, (val - 0.3) / 0.3);
        } else {
          [r, g, b] = lerpColor(225, 175, 110, 245, 220, 170, (val - 0.6) / 0.4);
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

/* ========================================================================
   SATURN TEXTURE & RINGS
   ======================================================================== */
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
      const nx = (x / size) * 8;
      const ny = y / size;

      const band = Math.sin(ny * 18) * 0.5 + 0.5;
      const turbulence = fbm(nx, ny * 5, 4, 2222);

      const val = band * 0.7 + turbulence * 0.3;

      let r: number, g: number, b: number;
      if (val < 0.35) {
        [r, g, b] = lerpColor(175, 145, 85, 210, 180, 120, val / 0.35);
      } else if (val < 0.7) {
        [r, g, b] = lerpColor(210, 180, 120, 235, 205, 150, (val - 0.35) / 0.35);
      } else {
        [r, g, b] = lerpColor(235, 205, 150, 250, 230, 180, (val - 0.7) / 0.3);
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
    const t = x / width; // 0 (inner ring) to 1 (outer ring)

    // Saturn ring features: D ring, C ring, B ring, Cassini division, A ring, Encke gap, F ring
    let alpha = 0;
    let r = 210, g = 185, b = 140;

    if (t < 0.1) {
      // Very inner D ring (faint)
      alpha = t * 0.2;
    } else if (t < 0.3) {
      // C ring
      alpha = 0.3 + Math.sin(t * 100) * 0.1;
      [r, g, b] = [170, 150, 120];
    } else if (t < 0.62) {
      // Bright B ring
      alpha = 0.85 + Math.sin(t * 150) * 0.12;
      [r, g, b] = [230, 205, 160];
    } else if (t < 0.67) {
      // Cassini Division (dark gap)
      alpha = 0.05;
    } else if (t < 0.92) {
      // A ring
      if (Math.abs(t - 0.85) < 0.01) {
        // Encke gap
        alpha = 0.02;
      } else {
        alpha = 0.65 + Math.sin(t * 120) * 0.1;
        [r, g, b] = [200, 180, 140];
      }
    } else {
      // Outer F ring / edge
      alpha = Math.max(0, (1 - t) * 0.5);
    }

    const fineNoise = noise2D(t * 500, 0, 6666) * 0.15;
    alpha = Math.max(0, Math.min(1, alpha + fineNoise));

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/* ========================================================================
   URANUS TEXTURE & RINGS
   ======================================================================== */
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
      const nx = (x / size) * 6;
      const ny = y / size;

      const band = Math.sin(ny * 10) * 0.12;
      const clouds = fbm(nx, ny * 3, 4, 3333);

      const val = 0.5 + band + clouds * 0.18;

      const r = Math.floor(125 + val * 45);
      const g = Math.floor(205 + val * 35);
      const b = Math.floor(215 + val * 35);

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

export function createUranusRingTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 32;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let x = 0; x < width; x++) {
    const t = x / width;
    let alpha = 0;

    if (t > 0.4 && t < 0.9) {
      alpha = Math.sin((t - 0.4) / 0.5 * Math.PI) * 0.45;
    }

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = 160;
      data[idx + 1] = 220;
      data[idx + 2] = 230;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* ========================================================================
   NEPTUNE TEXTURE
   ======================================================================== */
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
      const nx = (x / size) * 8;
      const ny = y / size;

      const band = Math.sin(ny * 14) * 0.18;
      const storms = fbm(nx, ny * 4, 5, 4444);
      const clouds = fbm(nx * 2, ny * 2, 3, 5555);

      const val = 0.5 + band + storms * 0.2 + clouds * 0.15;

      // Great Dark Spot
      const spotCenterX = 0.45;
      const spotCenterY = 0.48;
      let dx = Math.abs(x / size - spotCenterX);
      if (dx > 0.5) dx = 1 - dx;
      const dy = (y / size - spotCenterY) * 2;
      const spotDist = Math.sqrt(dx * dx * 12 + dy * dy * 4);

      let r: number, g: number, b: number;
      if (spotDist < 0.25) {
        const spotFactor = 1 - spotDist / 0.25;
        [r, g, b] = lerpColor(20, 35, 110, 10, 20, 80, spotFactor);
      } else {
        r = Math.floor(35 + val * 45);
        g = Math.floor(65 + val * 55);
        b = Math.floor(175 + val * 70);
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
