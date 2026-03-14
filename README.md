# Dark Forest

基于黑暗森林理论的 3D 宇宙文明演化模拟游戏。

A 3D universe civilization evolution simulator based on the Dark Forest theory.

> "The universe is a dark forest. Every civilization is an armed hunter."  
> —— 《三体》刘慈欣 / *The Three-Body Problem*, Liu Cixin

---

## 🌌 项目简介 / Overview

**中文**：Dark Forest 是一个实时演化的宇宙模拟器，在三维空间中生成数千个星系，部分星系随机诞生文明。文明随时间演化，等级从 0 逐步提升至 10，并通过可见光光谱颜色（红→紫）可视化展示。

**English**: Dark Forest is a real-time evolving universe simulator that generates thousands of galaxies in 3D space. Some galaxies randomly spawn civilizations that evolve over time, progressing from level 0 to 10, visualized through visible light spectrum colors (red → violet).

---

## ✨ 核心功能 / Features

### 宇宙模拟 / Universe Simulation

- **3D 宇宙生成**：在球形空间内均匀分布 10,000 个星系  
  **3D Universe Generation**: 10,000 galaxies uniformly distributed in a spherical space

- **文明演化**：每个时间片（默认 10 万年），文明按概率提升等级（0→10）  
  **Civilization Evolution**: Each time slice (default 100,000 years), civilizations level up probabilistically (0→10)

- **光谱着色**：文明等级映射到可见光光谱（红=0 级，紫=10 级）  
  **Spectrum Coloring**: Civilization level mapped to visible light spectrum (red=level 0, violet=level 10)

- **深度渲染**：基于距离的透明度衰减，模拟真实空间感  
  **Depth Rendering**: Distance-based alpha decay for realistic spatial perception

### 交互功能 / Interaction

- **3D 相机控制**：鼠标拖拽平移、滚轮缩放  
  **3D Camera Control**: Mouse drag to pan, scroll wheel to zoom

- **星系详情**：悬浮显示星系信息（坐标、文明等级、演化速度）  
  **Galaxy Details**: Hover to view galaxy info (coordinates, civ level, evolve speed)

- **距离测量**：点击两个星系，显示它们之间的光年距离  
  **Distance Measurement**: Click two galaxies to display distance in light years

- **动态光晕**：高等级文明（≥5 级）带有发光效果  
  **Dynamic Glow**: High-level civilizations (≥5) have glowing halos

### 时间控制 / Time Control

- **暂停/继续**：随时暂停演化，调整参数后继续  
  **Pause/Resume**: Pause evolution anytime, adjust parameters, then continue

- **速度调节**：调整每个时间片的真实时间（秒）  
  **Speed Adjustment**: Control real-time duration per time slice (seconds)

- **宇宙年龄**：实时显示当前宇宙年龄和演化轮次  
  **Universe Age**: Real-time display of current age and evolution round

### 参数配置 / Configuration

通过设置面板调整 / Adjust via settings panel:

- 宇宙半径（光年） / Universe radius (light years)
- 星系数量 / Galaxy count
- 文明诞生概率 / Civilization probability
- 时间片长度（年） / Time slice length (years)
- 每片真实时间（秒） / Real time per slice (seconds)
- 总时间片数 / Total time slices

---

## 🎮 快速开始 / Quick Start

```bash
# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start development server
npm run dev

# 构建生产版本 / Build for production
npm run build
```

浏览器打开 `http://localhost:5173` 即可开始模拟。  
Open `http://localhost:5173` in your browser to start the simulation.

---

## 🎯 使用说明 / User Guide

### 基本操作 / Basic Controls

| 操作 / Action | 功能 / Function |
|---------------|-----------------|
| 鼠标左键拖拽 / Left mouse drag | 平移视角 / Pan camera |
| 鼠标滚轮 / Scroll wheel | 缩放 / Zoom in/out |
| 鼠标悬浮星系 / Hover over galaxy | 查看星系详情 / View galaxy details |
| 点击两个星系 / Click two galaxies | 测量距离（光年） / Measure distance (light years) |
| 右上角设置按钮 / Top-right settings button | 打开参数面板 / Open configuration panel |

### 参数说明 / Parameters

| 参数 / Parameter | 默认值 / Default | 说明 / Description |
|------------------|------------------|-------------------|
| 宇宙半径 / Universe Radius | 1,000,000 ly | 球形宇宙的半径 / Radius of the spherical universe |
| 星系数量 / Galaxy Count | 10,000 | 宇宙中的星系总数 / Total number of galaxies |
| 文明概率 / Civ Probability | 30% | 每个星系诞生文明的概率 / Probability of civilization per galaxy |
| 时间片长度 / Time Slice Length | 100,000 年 / years | 每个演化步进的时间跨度 / Duration of each evolution step |
| 每片真实时间 / Real Time per Slice | 5 秒 / seconds | 每个时间片消耗的真实时间 / Real-world seconds per time slice |
| 总时间片数 / Total Slices | 100 | 模拟总轮次 / Total simulation rounds |

### 文明等级 / Civilization Levels

| 等级 / Level | 颜色 / Color | 说明 / Description |
|--------------|--------------|-------------------|
| 0 | 🔴 红色 / Red | 初等文明 / Primitive civilization |
| 1-2 | 🟠 橙色 / Orange | 初级文明 / Early civilization |
| 3-4 | 🟡 黄色 / Yellow | 中等文明 / Intermediate civilization |
| 5-6 | 🟢 绿色 / Green | 高等文明（带光晕） / Advanced civilization (with glow) |
| 7-8 | 🔵 蓝色 / Blue | 先进文明（带光晕） / Highly advanced civilization (with glow) |
| 9-10 | 🟣 紫色 / Violet | 神级文明（带光晕） / God-like civilization (with glow) |

---

## 🏗️ 技术架构 / Architecture

```
darkforest/
├── src/
│   ├── config.ts           # 游戏配置和默认参数 / Game configuration and defaults
│   ├── core/
│   │   ├── Universe.ts     # 宇宙引擎（星系管理、时间演化） / Universe engine (galaxy management, time evolution)
│   │   ├── Galaxy.ts       # 星系类（3D 坐标、文明属性） / Galaxy class (3D coordinates, civ attributes)
│   │   └── TimeEngine.ts   # 时间引擎（暂停/继续/速度控制） / Time engine (pause/resume/speed control)
│   ├── render/
│   │   ├── Renderer.ts     # Canvas 渲染器（3D 投影、光谱着色） / Canvas renderer (3D projection, spectrum coloring)
│   │   ├── Camera.ts       # 3D 相机（平移、缩放、投影） / 3D camera (pan, zoom, projection)
│   │   └── Tooltip.ts      # 悬浮提示 / Hover tooltip
│   ├── ui/
│   │   ├── HUD.ts          # 抬头显示（宇宙年龄、轮次） / Heads-up display (age, round)
│   │   └── SettingsPanel.ts # 参数设置面板 / Configuration panel
│   └── utils/
│       └── random.ts       # 随机工具函数 / Random utility functions
├── index.html              # 主页面 / Main page
├── style.css               # 样式 / Styles
└── vite.config.ts          # Vite 配置 / Vite configuration
```

### 核心技术 / Core Technologies

- **TypeScript**：类型安全的代码 / Type-safe codebase
- **HTML5 Canvas**：高性能 2D 渲染（3D 投影） / High-performance 2D rendering (3D projection)
- **Vite**：快速开发和构建 / Fast development and build
- **3D 投影算法**：透视投影 + 画家算法（远→近排序） / Perspective projection + painter's algorithm (far-to-near sorting)
- **光谱颜色映射**：文明等级→可见光波长→RGB 颜色 / Civilization level → wavelength → RGB color

---

## 📐 算法说明 / Algorithms

### 3D 星系分布 / 3D Galaxy Distribution

使用球坐标系均匀分布 / Uniform distribution in spherical coordinates:

```typescript
const u = Math.random()
const v = Math.random()
const theta = 2 * Math.PI * u
const phi = Math.acos(2 * v - 1)
const r = Math.cbrt(Math.random()) * radius
```

### 文明演化 / Civilization Evolution

每个时间片 / Each time slice:

```typescript
if (Math.random() < evolveProbability) {
  civilizationLevel += evolveSpeed
}
```

### 距离计算 / Distance Calculation

三维欧几里得距离（光年） / 3D Euclidean distance (light years):

```typescript
distance = √[(x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²]
```

---

## 🚀 后续计划 / Roadmap

- [ ] 星系碰撞检测 / Galaxy collision detection
- [ ] 文明间通信模拟 / Inter-civilization communication simulation
- [ ] 黑暗森林打击机制 / Dark Forest strike mechanism
- [ ] 保存/加载宇宙状态 / Save/load universe state
- [ ] 导出演化视频 / Export evolution video

---

## 📄 许可证 / License

MIT License

## 👤 作者 / Author

**hanhy**

---

> *"In the dark forest, any civilization that exposes itself will be eliminated."*  
> 黑暗森林中，任何暴露自己的文明都将被消灭。
