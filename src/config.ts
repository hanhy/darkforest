export interface GameConfig {
  universe: {
    radius: number;
    galaxyCount: number;
    civProbability: number;
  };
  galaxy: {
    evolveSpeed: number;
    evolveProbability: number;
  };
  time: {
    sliceYears: number;
    realTimePerSlice: number;
    totalSlices: number;
  };
}

export const DEFAULT_CONFIG: GameConfig = {
  universe: {
    radius: 1_000_000,
    galaxyCount: 10_000,
    civProbability: 0.3,
  },
  galaxy: {
    evolveSpeed: 0.1,
    evolveProbability: 0.5,
  },
  time: {
    sliceYears: 100_000,
    realTimePerSlice: 5,
    totalSlices: 100,
  },
};
