import { DEFAULT_CONFIG, GameConfig } from './config';
import { Universe } from './core/Universe';
import { TimeEngine } from './core/TimeEngine';
import { Camera } from './render/Camera';
import { Renderer } from './render/Renderer';
import { Tooltip } from './render/Tooltip';
import { HUD } from './ui/HUD';
import { SettingsPanel } from './ui/SettingsPanel';

// --- Init ---
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const universe = new Universe();
const camera = new Camera(canvas);
const renderer = new Renderer(canvas, camera);
const tooltip = new Tooltip();
const hud = new HUD();
const settings = new SettingsPanel();

let timeEngine: TimeEngine;

function startGame(config: GameConfig): void {
  // Stop previous
  timeEngine?.pause();

  // Init universe
  universe.init(config);

  // Center camera
  camera.centerOn(canvas.width, canvas.height, config.universe.radius);

  // Setup time engine
  timeEngine = new TimeEngine(config.time.realTimePerSlice, () => {
    universe.tick();
    hud.update(universe);

    if (universe.finished) {
      timeEngine.pause();
    }
  });

  hud.update(universe);
  timeEngine.start();
}

// --- Settings callbacks ---
settings.onNewGame = (config) => startGame(config);
settings.onPause = () => timeEngine?.pause();
settings.onResume = () => timeEngine?.start();

// --- Tooltip on hover ---
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const galaxy = renderer.findGalaxyAt(universe, mx, my);
  if (galaxy) {
    tooltip.show(galaxy, e.clientX, e.clientY);
  } else {
    tooltip.hide();
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.hide();
});

// --- Render loop ---
function frame(): void {
  renderer.draw(universe);
  requestAnimationFrame(frame);
}

// --- Start ---
startGame(DEFAULT_CONFIG);
requestAnimationFrame(frame);
