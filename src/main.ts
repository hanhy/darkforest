import { GameConfig } from './config';
import { Universe } from './core/Universe';
import { TimeEngine } from './core/TimeEngine';
import { Camera } from './render/Camera';
import { Renderer } from './render/Renderer';
import { Tooltip } from './render/Tooltip';
import { HUD } from './ui/HUD';
import { SettingsPanel } from './ui/SettingsPanel';
import { audioManager } from './audio/AudioManager';

// --- Init ---
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const universe = new Universe();
const camera = new Camera(canvas);
const renderer = new Renderer(canvas, camera);
const tooltip = new Tooltip();
const hud = new HUD();
const settings = new SettingsPanel();

let timeEngine: TimeEngine;
let currentConfig: GameConfig;

function startGame(config: GameConfig): void {
  // Stop previous
  timeEngine?.pause();

  // Init universe
  universe.init(config);
  currentConfig = config;
  
  // Update settings panel with current universe
  settings.setUniverse(universe, config);

  // Clear any connection line from previous game
  renderer.clearConnection();

  // Center camera
  camera.centerOn(canvas.width, canvas.height, config.universe.radius);

  // Initialize audio on first user interaction
  audioManager.init();
  audioManager.startAmbient();

  // Setup time engine
  timeEngine = new TimeEngine(config.time.realTimePerSlice, () => {
    universe.tick();
    hud.update(universe);

    if (universe.finished) {
      timeEngine.pause();
      // Game ends: keep the final state, do NOT reset
      hud.update(universe);
    }
  });

  hud.update(universe);
  timeEngine.start();
}

// --- Settings callbacks ---
settings.onNewGame = (config) => startGame(config);
settings.onPause = () => timeEngine?.pause();
settings.onResume = () => {
  if (universe.finished) return; // Don't resume a finished game
  timeEngine?.start();
};
settings.onToggleDarkForest = (enabled) => {
  universe.enableDarkForest = enabled;
  hud.update(universe);
};

// --- Audio toggle ---
const audioToggle = document.getElementById('hud-audio-toggle');
if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    const enabled = audioManager.toggle();
    audioToggle.textContent = enabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
  });
}

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

// --- Click to connect two galaxies or clear ---
canvas.addEventListener('click', (e) => {
  // Ignore if camera was just dragged
  if (camera.isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const galaxy = renderer.findGalaxyAt(universe, mx, my);

  if (galaxy) {
    renderer.selectGalaxy(galaxy);
  } else {
    // Click on empty space: clear the connection
    renderer.clearConnection();
  }
});

// --- Render loop ---
function frame(): void {
  renderer.draw(universe);
  requestAnimationFrame(frame);
}

// --- Start: show settings panel and wait for user to confirm ---
settings.show();
requestAnimationFrame(frame);
