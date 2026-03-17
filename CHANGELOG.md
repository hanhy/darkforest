# Changelog

## [1.1.0] - 2026-03-17

### ✨ New Features

#### Dark Forest System (黑暗森林系统)
- **Chain of Suspicion** (猜疑链系统)
  - Civilizations automatically accumulate suspicion based on proximity and level difference
  - Suspicion decays over time without contact
  - High suspicion pairs are tracked and displayed in HUD

- **Technology Explosion** (技术爆炸机制)
  - Low-level civilizations (0-4) have probability of sudden level jumps (1-3 levels)
  - Explosion probability varies by level (highest at levels 2-4)
  - All tech explosions are tracked in statistics

- **Civilization Stealth** (文明隐身系统)
  - Low-level civilizations (<5) can enter stealth mode
  - Auto-enabled when civilization is threatened (high suspicion from neighbors)
  - Stealth mode reduces detection probability by 90%
  - Visual indicator: blue-tinted color with pulsing effect and ring

#### Save/Load System (存档系统)
- **Local Storage Save** (本地存储)
  - Automatic save to browser localStorage
  - Save includes: universe state, galaxy positions, dark forest relations, stealth status
  - Display last save time and round in settings panel

- **File Export/Import** (文件导入导出)
  - Export universe state to JSON file
  - Import from previously exported JSON files
  - Timestamped filenames for easy organization

#### Statistics Display (统计显示)
- Real-time HUD showing:
  - 🔥 Tech Explosions count
  - 👻 Stealth Civilizations count
  - ⚠️ High Suspicion Pairs count
- Dark Forest toggle button (ON/OFF)

### 🔧 Technical Changes

#### New Files
- `src/core/DarkForestSystem.ts` - Core dark forest mechanics
- `src/utils/SaveManager.ts` - Save/load management

#### Modified Files
- `src/core/Universe.ts` - Integrated dark forest system, added export/import
- `src/core/Galaxy.ts` - Added stealth mode, color calculation methods
- `src/ui/HUD.ts` - Added dark forest statistics display
- `src/ui/SettingsPanel.ts` - Added save/load/export/import buttons
- `src/main.ts` - Wired up new features
- `src/render/Renderer.ts` - Visual effects for stealth mode
- `src/render/Tooltip.ts` - Show stealth indicator
- `index.html` - New UI elements
- `style.css` - Styling for new elements
- `README.md` - Updated with completed features

### 🎮 Gameplay Changes

1. **Dark Forest Mode** can be toggled ON/OFF
   - When OFF: Classic mode, only basic evolution
   - When ON: Full dark forest mechanics enabled

2. **Visual Changes**
   - Stealth civilizations: Blue-tinted, pulsing glow, outer ring
   - High-level civilizations (>5): Glow effect (disabled in stealth)
   - Normal civilizations: Spectrum color by level

3. **Auto-Management**
   - Stealth automatically enabled when threatened
   - Stealth automatically disabled when safe
   - Relations updated every tick

### 📊 Balance

- Technology explosion probability:
  - Level 0: 0.1%
  - Level 1: 0.5%
  - Level 2-4: 1-3% (peak)
  - Level 5+: Decreasing to 0%

- Suspicion factors:
  - Level difference: +0.5 per level
  - Proximity: +2.0 max (closer = more)
  - Time decay: -0.1 per round

### 🐛 Bug Fixes
- Fixed universe state not persisting correctly
- Improved galaxy selection visual feedback

### 📝 Documentation
- Updated README with completed features
- Added CHANGELOG.md
- Updated architecture diagram

---

## [1.0.0] - 2026-03-14

### Initial Release
- 3D universe simulation with 10,000 galaxies
- Civilization evolution (levels 0-10)
- Spectrum color visualization
- Distance measurement between galaxies
- Camera controls (pan, zoom, rotate)
- Settings panel for configuration
- Time control (pause, resume, speed)
