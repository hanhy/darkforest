# Dark Forest

A 3D universe civilization evolution simulator based on the Dark Forest theory.

> "The universe is a dark forest. Every civilization is an armed hunter."  
> — *The Three-Body Problem*, Liu Cixin

## 🌌 Overview

Dark Forest is a real-time evolving universe simulator that generates thousands of galaxies in 3D space. Some galaxies randomly spawn civilizations that evolve over time, progressing from level 0 to 10, visualized through visible light spectrum colors (red → violet).

## ✨ Features

### Universe Simulation
- **3D Universe Generation**: 10,000 galaxies uniformly distributed in a spherical space
- **Civilization Evolution**: Each time slice (default 100,000 years), civilizations level up probabilistically (0→10)
- **Spectrum Coloring**: Civilization level mapped to visible light spectrum (red=level 0, violet=level 10)
- **Depth Rendering**: Distance-based alpha decay for realistic spatial perception

### Interaction
- **3D Camera Control**: Mouse drag to pan, scroll wheel to zoom
- **Galaxy Details**: Hover to view galaxy info (coordinates, civ level, evolve speed)
- **Distance Measurement**: Click two galaxies to display distance in light years
- **Dynamic Glow**: High-level civilizations (≥5) have glowing halos

### Time Control
- **Pause/Resume**: Pause evolution anytime, adjust parameters, then continue
- **Speed Adjustment**: Control real-time duration per time slice (seconds)
- **Universe Age**: Real-time display of current age and evolution round

### Configuration Panel
Adjust parameters via settings panel:
- Universe radius (light years)
- Galaxy count
- Civilization probability
- Time slice length (years)
- Real time per slice (seconds)
- Total time slices

## 🎮 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:5173` in your browser to start the simulation.

## 🎯 User Guide

### Basic Controls
| Action | Function |
|--------|----------|
| Left mouse drag | Pan camera |
| Scroll wheel | Zoom in/out |
| Hover over galaxy | View galaxy details |
| Click two galaxies | Measure distance (light years) |
| Top-right settings button | Open configuration panel |

### Parameters
- **Universe Radius**: Radius of the spherical universe (light years), default 1,000,000 ly
- **Galaxy Count**: Total number of galaxies, default 10,000
- **Civ Probability**: Probability of civilization spawning per galaxy, default 30%
- **Time Slice Length**: Duration of each evolution step, default 100,000 years
- **Real Time per Slice**: Real-world seconds per time slice, default 5 seconds
- **Total Slices**: Total simulation rounds, default 100 (10 million years total)

### Civilization Levels
| Level | Color | Description |
|-------|-------|-------------|
| 0 | 🔴 Red | Primitive civilization |
| 1-2 | 🟠 Orange | Early civilization |
| 3-4 | 🟡 Yellow | Intermediate civilization |
| 5-6 | 🟢 Green | Advanced civilization (with glow) |
| 7-8 | 🔵 Blue | Highly advanced civilization (with glow) |
| 9-10 | 🟣 Violet | God-like civilization (with glow) |

## 🏗️ Architecture

```
darkforest/
├── src/
│   ├── config.ts           # Game configuration and defaults
│   ├── core/
│   │   ├── Universe.ts     # Universe engine (galaxy management, time evolution)
│   │   ├── Galaxy.ts       # Galaxy class (3D coordinates, civ attributes)
│   │   └── TimeEngine.ts   # Time engine (pause/resume/speed control)
│   ├── render/
│   │   ├── Renderer.ts     # Canvas renderer (3D projection, spectrum coloring)
│   │   ├── Camera.ts       # 3D camera (pan, zoom, projection)
│   │   └── Tooltip.ts      # Hover tooltip
│   ├── ui/
│   │   ├── HUD.ts          # Heads-up display (age, round)
│   │   └── SettingsPanel.ts # Configuration panel
│   └── utils/
│       └── random.ts       # Random utility functions
├── index.html              # Main page
├── style.css               # Styles
└── vite.config.ts          # Vite configuration
```

### Core Technologies
- **TypeScript**: Type-safe codebase
- **HTML5 Canvas**: High-performance 2D rendering (3D projection)
- **Vite**: Fast development and build
- **3D Projection**: Perspective projection + painter's algorithm (far-to-near sorting)
- **Spectrum Color Mapping**: Civilization level → wavelength → RGB color

## 📐 Algorithms

### 3D Galaxy Distribution
Uniform distribution in spherical coordinates:
```typescript
const u = Math.random()
const v = Math.random()
const theta = 2 * Math.PI * u
const phi = Math.acos(2 * v - 1)
const r = Math.cbrt(Math.random()) * radius
```

### Civilization Evolution
Each time slice:
```typescript
if (Math.random() < evolveProbability) {
  civilizationLevel += evolveSpeed
}
```

### Distance Calculation
3D Euclidean distance (light years):
```typescript
distance = √[(x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²]
```

## 🚀 Roadmap

- [ ] Galaxy collision detection
- [ ] Inter-civilization communication simulation
- [ ] Dark Forest strike mechanism
- [ ] Save/load universe state
- [ ] Export evolution video

## 📄 License

MIT License

## 👤 Author

**hanhy**

---

*"In the dark forest, any civilization that exposes itself will be eliminated."*
