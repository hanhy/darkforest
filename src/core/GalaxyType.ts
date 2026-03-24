export type GalaxyType = 'spiral' | 'elliptical' | 'irregular' | 'globular' | 'point';

/** Galaxy type configuration */
export interface GalaxyTypeConfig {
  type: GalaxyType;
  /** Visual parameters for rendering */
  params: {
    size?: number;        // Base size multiplier
    arms?: number;        // For spiral galaxies
    density?: number;     // Star density
    color?: [number, number, number]; // Base color tint
    rotation?: number;    // Rotation angle (radians)
  };
}

/** Generate random galaxy type with appropriate parameters */
export function generateRandomGalaxyType(): GalaxyTypeConfig {
  const types: GalaxyType[] = ['spiral', 'elliptical', 'irregular', 'globular', 'point'];
  const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Point galaxies are rare
  
  // Weighted random selection
  const rand = Math.random();
  let cumulative = 0;
  let selectedType: GalaxyType = 'point';
  
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      selectedType = types[i];
      break;
    }
  }
  
  // Generate parameters based on type
  const params: any = {};
  
  switch (selectedType) {
    case 'spiral':
      params.size = 1 + Math.random() * 2;
      params.arms = 2 + Math.floor(Math.random() * 4); // 2-5 arms
      params.density = 0.7 + Math.random() * 0.3;
      params.color = [200 + Math.random() * 55, 150 + Math.random() * 105, 100 + Math.random() * 155];
      params.rotation = Math.random() * Math.PI * 2;
      break;
      
    case 'elliptical':
      params.size = 0.8 + Math.random() * 1.5;
      params.density = 0.9 + Math.random() * 0.1;
      params.color = [180 + Math.random() * 75, 160 + Math.random() * 95, 140 + Math.random() * 115];
      break;
      
    case 'irregular':
      params.size = 0.6 + Math.random() * 1.8;
      params.density = 0.5 + Math.random() * 0.4;
      params.color = [150 + Math.random() * 105, 120 + Math.random() * 135, 180 + Math.random() * 75];
      break;
      
    case 'globular':
      params.size = 0.4 + Math.random() * 1.2;
      params.density = 1.2 + Math.random() * 0.3;
      params.color = [220 + Math.random() * 35, 200 + Math.random() * 55, 180 + Math.random() * 75];
      break;
      
    case 'point':
    default:
      params.size = 1;
      params.density = 1;
      params.color = [100, 100, 100];
      break;
  }
  
  return { type: selectedType, params };
}