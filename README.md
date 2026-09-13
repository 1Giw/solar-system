# 🌌 Interactive 3D Solar System Explorer

Sebuah visualisasi interaktif tata surya 3D menggunakan React, Three.js, dan Tailwind CSS. Jelajahi 8 planet dengan informasi detail, kontrol animasi, dan tampilan 3D yang bisa di-zoom dan rotate.

![Solar System](https://img.shields.io/badge/React-18.3-blue) ![Three.js](https://img.shields.io/badge/Three.js-3D-green) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

## ✨ Fitur

- 🪐 **Visualisasi 3D** - Tata surya dengan 8 planet dan matahari
- 🎮 **Interaktif** - Klik planet untuk melihat informasi detail
- 🔍 **Zoom & Rotate** - Gunakan mouse untuk menjelajahi tata surya
- ⚡ **Kontrol Animasi** - Play/Pause dan atur kecepatan orbit
- 📊 **Info Planet** - Diameter, jarak, periode orbit, dan deskripsi
- 🌟 **Efek Visual** - Cincin Saturnus, glow effect, dan background bintang
- 📱 **Responsive** - Tampilan optimal di desktop dan mobile

## 🚀 Demo

Live demo: [https://1giw.github.io/solar-system/](https://1giw.github.io/solar-system/)

## 🛠️ Teknologi

- **React 18** - UI framework
- **Three.js** - 3D rendering
- **@react-three/fiber** - React renderer untuk Three.js
- **@react-three/drei** - Helper components untuk R3F
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/1Giw/solar-system.git

# Masuk ke directory
cd solar-system

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🎮 Cara Penggunaan

### Kontrol Kamera
- **Klik kiri + drag** - Rotate tampilan
- **Klik kanan + drag** - Pan/geser tampilan
- **Scroll** - Zoom in/out

### Kontrol Animasi
- **Play/Pause** - Mulai/hentikan animasi orbit
- **Speed Slider** - Atur kecepatan (0.1x - 10x)
- **Preset Speed** - Klik tombol 0.5x, 1x, 2x, 5x

### Interaksi Planet
- **Klik planet** - Lihat informasi detail
- **Hover planet** - Highlight planet dan orbit
- **Planet list** - Klik nama planet di sidebar kiri

## 📊 Data Planet

| Planet | Diameter | Jarak dari Matahari | Periode Orbit |
|--------|----------|---------------------|---------------|
| Mercury | 4,879 km | 57.9 juta km | 88 hari |
| Venus | 12,104 km | 108.2 juta km | 225 hari |
| Earth | 12,756 km | 149.6 juta km | 365.25 hari |
| Mars | 6,792 km | 227.9 juta km | 687 hari |
| Jupiter | 142,984 km | 778.6 juta km | 11.86 tahun |
| Saturn | 120,536 km | 1,433.5 juta km | 29.46 tahun |
| Uranus | 51,118 km | 2,872.5 juta km | 84.01 tahun |
| Neptune | 49,528 km | 4,495.1 juta km | 164.8 tahun |

## 🏗️ Build

```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

## 🌐 Deploy ke GitHub Pages

Project ini sudah dikonfigurasi untuk auto-deploy ke GitHub Pages menggunakan GitHub Actions.

### Cara Deploy:

1. Push code ke repository GitHub
2. Buka **Settings** → **Pages**
3. Pilih **Source:** `GitHub Actions`
4. Website akan otomatis deploy setiap kali push ke branch `main`

URL: `https://username.github.io/solar-system/`

## 📁 Struktur Project

```
solar-system/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── components/
│   │   ├── Planet.tsx          # Komponen 3D planet
│   │   ├── Sun.tsx             # Komponen 3D matahari
│   │   ├── Orbit.tsx           # Komponen orbit path
│   │   └── SolarSystemScene.tsx # Scene 3D utama
│   ├── App.tsx                 # Main app component
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Dependencies
```

## 🤝 Kontribusi

Contributions, issues, dan feature requests sangat diterima!

## 📝 License

MIT © [1Giw](https://github.com/1Giw)

## 🙏 Credits

Dibuat dengan ❤️ menggunakan React, Three.js, dan Tailwind CSS

---

**Enjoy exploring the Solar System!** 🚀🌍🪐
