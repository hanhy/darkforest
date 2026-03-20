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

### 黑暗森林机制 / Dark Forest Mechanics

| 机制 / Mechanic | 触发条件 / Trigger | 效果 / Effect |
|-----------------|-------------------|---------------|
| 猜疑链 / Chain of Suspicion | 文明间距离近 + 等级差 | 自动累积敌意 / Auto-accumulate hostility |
| 技术爆炸 / Technology Explosion | 低等级文明 (0-4) | 跳跃 1-3 级 / Jump 1-3 levels |
| 隐身模式 / Stealth Mode | 受威胁时自动启用 | 探测概率 -90% / Detection -90% |
| 坐标广播 / Coordinate Broadcast | ≥4 级文明，高猜疑 | 暴露目标坐标 / Expose target coordinates |
| 清理打击 / Cleanup Strike | 收到广播或直接威胁 | 可能消灭目标 / May destroy target |

### 🌌 黑暗森林玩法 / Dark Forest Gameplay

**核心法则**：宇宙是黑暗森林，每个文明都是带枪的猎人。

**Core Rule**: The universe is a dark forest. Every civilization is an armed hunter.

#### 生存策略 / Survival Strategy

1. **保持沉默** — 低等级文明（<5 级）应尽快进入隐身模式
   **Stay Silent** — Low-level civs (<5) should enter stealth ASAP

2. **技术爆炸** — 利用早期高概率快速升级
   **Tech Explosion** — Use early high probability to level up fast

3. **谨慎广播** — 暴露别人坐标会吸引其他猎手
   **Careful Broadcasting** — Exposing others attracts other hunters

4. **清理威胁** — 高等级文明应主动清理潜在威胁
   **Clean Threats** — High-level civs should proactively clean threats

#### 打击流程 / Strike Flow

```
高等级文明发现目标
        ↓
评估威胁（等级差、距离、猜疑度）
        ↓
选择：广播坐标 OR 直接打击
        ↓
其他文明收到广播 → 可能加入打击
        ↓
目标被消灭（灰色显示）或 打击失败
```

---

### 文明等级 / Civilization Levels

| 等级 / Level | 颜色 / Color | 说明 / Description |
|--------------|--------------|-------------------|
| 0 | 🔴 红色 / Red | 初等文明 / Primitive civilization |
| 1-2 | 🟠 橙色 / Orange | 初级文明 / Early civilization |
| 3-4 | 🟡 黄色 / Yellow | 中等文明 / Intermediate civilization |
| 5-6 | 🟢 绿色 / Green | 高等文明（带光晕） / Advanced civilization (with glow) |
| 7-8 | 🔵 蓝色 / Blue | 先进文明（带光晕） / Highly advanced civilization (with glow) |
| 9-10 | 🟣 紫色 / Violet | 神级文明（带光晕） / God-like civilization (with glow) |

### 黑暗森林打击 / Dark Forest Strike

| 打击方式 / Method | 最低等级 / Min Level | 说明 / Description |
|-------------------|---------------------|-------------------|
| 常规清理 / Cleaning | 3 | 基础打击方式 / Basic cleanup |
| 光粒 / Photoid | 8 | 高能粒子打击 / High-energy particle strike |
| 二向箔 / Dual-Vector Foil | 8 | 维度降维打击 / Dimension reduction weapon |

| 等级 / Level | 打击概率 / Strike Probability | 说明 / Description |
|--------------|------------------------------|-------------------|
| 3-4 | 1-2% | 极罕见 / Very rare |
| 5-7 | 5-20% | 中等 / Moderate |
| 8-10 | 35-70% | 高频 / High frequency |

---

## 🏗️ 技术架构 / Architecture

```
darkforest/
├── src/
│   ├── config.ts           # 游戏配置和默认参数 / Game configuration and defaults
│   ├── core/
│   │   ├── Universe.ts     # 宇宙引擎（星系管理、时间演化） / Universe engine (galaxy management, time evolution)
│   │   ├── Galaxy.ts       # 星系类（3D 坐标、文明属性） / Galaxy class (3D coordinates, civ attributes)
│   │   ├── TimeEngine.ts   # 时间引擎（暂停/继续/速度控制） / Time engine (pause/resume/speed control)
│   │   ├── DarkForestSystem.ts   # 黑暗森林系统（猜疑链、技术爆炸、隐身） / Dark Forest system
│   │   └── DarkForestStrike.ts   # 打击系统（坐标广播、清理打击） / Strike system (broadcast, cleanup)
│   ├── render/
│   │   ├── Renderer.ts     # Canvas 渲染器（3D 投影、光谱着色） / Canvas renderer (3D projection, spectrum coloring)
│   │   ├── Camera.ts       # 3D 相机（平移、缩放、投影） / 3D camera (pan, zoom, projection)
│   │   └── Tooltip.ts      # 悬浮提示 / Hover tooltip
│   ├── ui/
│   │   ├── HUD.ts          # 抬头显示（宇宙年龄、轮次、统计） / Heads-up display (age, round, stats)
│   │   └── SettingsPanel.ts # 参数设置面板（存档管理） / Configuration panel (save management)
│   └── utils/
│       ├── random.ts       # 随机工具函数 / Random utility functions
│       └── SaveManager.ts  # 存档管理器（保存/加载/导入导出） / Save manager
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

### ✅ 已完成 / Completed

- [x] **猜疑链系统** / Chain of Suspicion  
  文明间无法判断对方善恶意图，自动产生敌意累积  
  Civilizations cannot judge each other's intentions, automatically accumulating hostility

- [x] **技术爆炸机制** / Technology Explosion  
  低等级文明有概率突然跳跃式升级（参考三体）  
  Low-level civilizations have probability of sudden leapfrog advancement (1-3 levels)

- [x] **文明隐藏/隐身** / Civilization Stealth  
  低等级文明可选择"静默"降低被探测概率，受威胁时自动启用  
  Low-level civs can choose "silence" to reduce detection, auto-enabled when threatened

- [x] **保存/加载宇宙状态** / Save/Load Universe State  
  JSON 格式存档，支持本地存储和文件导入导出  
  JSON save format, support localStorage and file import/export

- [x] **黑暗森林统计** / Dark Forest Statistics  
  实时显示技术爆炸次数、隐身文明数量、高猜疑关系对数  
  Real-time stats: tech explosions, stealth civs, high suspicion pairs

- [x] **黑暗森林打击系统** / Dark Forest Strike System (v1.2.0)  
  高等级文明可广播坐标并发起清理打击，支持光粒/二向箔等武器  
  High-level civs can broadcast coordinates and initiate cleanup strikes with various weapons

### 核心玩法 / Core Gameplay

- [ ] **黑暗森林打击** / Dark Forest Strike  
  高等级文明可清理暴露的低等文明（坐标广播→清理）  
  High-level civs can clean exposed low-level civs (coordinate broadcast → cleanup)

- [ ] **信号传播系统** / Signal Propagation  
  电磁波以光速传播，文明可主动/被动发射信号  
  EM waves propagate at light speed, civs can emit signals actively/passively

### 宇宙生态 / Universe Ecosystem

- [ ] **星际战争模拟** / Interstellar Warfare  
  光粒打击、二向箔降维等武器系统  
  Photoid strikes, dual-vector foil dimension reduction weapons

- [ ] **文明联盟/敌对** / Civilization Alliances/Hostilities  
  基于距离、等级、历史的动态关系系统  
  Dynamic relationship system based on distance, level, history

### 功能增强 / Feature Enhancements

- [ ] **星系碰撞检测** / Galaxy Collision Detection  
  近距离星系可能发生合并或资源争夺  
  Close galaxies may merge or compete for resources

- [ ] **文明灭绝追踪** / Civilization Extinction Tracker  
  统计已灭绝文明数量、原因、存活时间  
  Track extinct civ count, causes, survival duration

- [ ] **导出演化视频** / Export Evolution Video  
  录制文明演化过程，支持 MP4/GIF  
  Record evolution process, export to MP4/GIF

### 可视化优化 / Visualization

- [ ] **文明间通信模拟** / Inter-civilization Communication Simulation  
  可视化信号传播路径和延迟效果  
  Visualize signal propagation paths and latency

- [ ] **超新星爆发** / Supernova Explosions  
  恒星死亡时产生壮观视觉效果  
  Spectacular visual effects when stars die

- [ ] **黑洞/引力透镜** / Black Holes / Gravitational Lensing  
  高质量天体对光线弯曲效果  
  Light bending effects from massive objects

### 成就系统 / Achievement System

- [ ] **宇宙历史统计** / Universe History Statistics  
  最长寿文明、最快技术爆炸、最大规模战争等  
  Longest-lived civ, fastest tech explosion, largest war, etc.

- [ ] **特殊事件日志** / Special Event Log  
  记录所有重大宇宙事件（打击、爆炸、联盟）  
  Log all major universe events (strikes, explosions, alliances)

---

## 📄 许可证 / License

MIT License

## 👤 作者 / Author

**hanhy**

---

> *"In the dark forest, any civilization that exposes itself will be eliminated."*  
> 黑暗森林中，任何暴露自己的文明都将被消灭。
