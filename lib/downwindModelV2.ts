// Downwind Model v2 - Trained on 83 AXIS foils with official 2nd moments data
// Features: area, aspectRatio, span, rollMoment, pitchMoment
// Training R² scores: lift=98.5%, glide=96.7%, speed=99.6%, carving=98.8%, pump=89.4%, comfort=99.2%

interface ModelCoefficients {
  coefficients: number[];
  intercept: number;
  r2: number;
}

interface DownwindModel {
  version: string;
  trained_on: number;
  features: string[];
  scaler: {
    mean: number[];
    scale: number[];
  };
  models: {
    lift: ModelCoefficients;
    glide: ModelCoefficients;
    speed: ModelCoefficients;
    carving: ModelCoefficients;
    pump: ModelCoefficients;
    comfort: ModelCoefficients;
  };
}

// Model trained from official AXIS specs (Feb 2026)
const MODEL: DownwindModel = {
  "version": "2.0",
  "trained_on": 83,
  "features": ["area", "aspectRatio", "span", "rollMoment", "pitchMoment"],
  "scaler": {
    "mean": [1087.24, 10.02, 1004.70, 7881.59, 161.66],
    "scale": [387.45, 3.66, 231.21, 6232.45, 136.02]
  },
  "models": {
    "lift": {
      "coefficients": [12.9075, -4.7242, 9.5215, -2.7077, -0.2402],
      "intercept": 72.66,
      "r2": 0.9846
    },
    "glide": {
      "coefficients": [-2.6292, 13.8312, 6.474, -7.8148, -2.8748],
      "intercept": 67.58,
      "r2": 0.9669
    },
    "speed": {
      "coefficients": [-5.9244, 16.9553, 2.1496, -3.514, -0.9278],
      "intercept": 50.15,
      "r2": 0.9962
    },
    "carving": {
      "coefficients": [7.8833, -13.1637, -6.1535, 3.348, 8.4092],
      "intercept": 48.8,
      "r2": 0.9881
    },
    "pump": {
      "coefficients": [12.4315, 9.267, 7.7727, -8.4967, -0.0082],
      "intercept": 69.26,
      "r2": 0.894
    },
    "comfort": {
      "coefficients": [10.7756, -14.279, 2.1701, 0.1664, -3.5081],
      "intercept": 76.86,
      "r2": 0.9917
    }
  }
};

export interface FoilSpecs {
  area: number;
  aspectRatio: number;
  span: number;
  rollMoment?: number;
  pitchMoment?: number;
}

export interface PerformanceScores {
  lift: number;
  glide: number;
  speed: number;
  carving: number;
  pump: number;
  comfort: number;
}

function scaleFeatures(specs: FoilSpecs): number[] {
  const features = [
    specs.area,
    specs.aspectRatio,
    specs.span,
    specs.rollMoment || estimateRollMoment(specs),
    specs.pitchMoment || estimatePitchMoment(specs)
  ];
  
  return features.map((val, i) => 
    (val - MODEL.scaler.mean[i]) / MODEL.scaler.scale[i]
  );
}

// Estimate 2nd moments if not provided (based on regression from training data)
function estimateRollMoment(specs: FoilSpecs): number {
  // Roll moment correlates strongly with area and span
  return specs.area * specs.span * 0.0072;
}

function estimatePitchMoment(specs: FoilSpecs): number {
  // Pitch moment correlates with area
  return specs.area * 0.148;
}

function predictScore(scaledFeatures: number[], model: ModelCoefficients): number {
  let score = model.intercept;
  for (let i = 0; i < scaledFeatures.length; i++) {
    score += scaledFeatures[i] * model.coefficients[i];
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculatePerformanceScores(specs: FoilSpecs): PerformanceScores {
  const scaled = scaleFeatures(specs);
  
  return {
    lift: predictScore(scaled, MODEL.models.lift),
    glide: predictScore(scaled, MODEL.models.glide),
    speed: predictScore(scaled, MODEL.models.speed),
    carving: predictScore(scaled, MODEL.models.carving),
    pump: predictScore(scaled, MODEL.models.pump),
    comfort: predictScore(scaled, MODEL.models.comfort)
  };
}

// Weight adjustment based on rider weight vs foil sweet spot
export function adjustForWeight(scores: PerformanceScores, riderWeight: number, foilArea: number): PerformanceScores {
  // Ideal weight-to-area ratio: ~0.08 kg/cm²
  const idealRatio = 0.08;
  const actualRatio = riderWeight / foilArea;
  const weightFactor = actualRatio / idealRatio;
  
  // Adjust scores based on weight factor
  return {
    lift: Math.max(0, Math.min(100, Math.round(scores.lift * (1.1 - weightFactor * 0.1)))),
    glide: Math.max(0, Math.min(100, Math.round(scores.glide * (0.9 + weightFactor * 0.1)))),
    speed: scores.speed,
    carving: Math.max(0, Math.min(100, Math.round(scores.carving * (1.05 - weightFactor * 0.05)))),
    pump: Math.max(0, Math.min(100, Math.round(scores.pump * (1.15 - weightFactor * 0.15)))),
    comfort: Math.max(0, Math.min(100, Math.round(scores.comfort * (1.1 - weightFactor * 0.1))))
  };
}

// Match score based on discipline priorities
export interface DisciplinePriorities {
  lift: number;
  glide: number;
  speed: number;
  carving: number;
  pump: number;
  comfort: number;
}

export const DOWNWIND_PRIORITIES: DisciplinePriorities = {
  glide: 10,
  pump: 9,
  lift: 7,
  comfort: 6,
  speed: 4,
  carving: 3
};

export function calculateMatchScore(scores: PerformanceScores, priorities: DisciplinePriorities): number {
  const totalWeight = Object.values(priorities).reduce((a, b) => a + b, 0);
  let weightedSum = 0;
  
  for (const [axis, priority] of Object.entries(priorities)) {
    weightedSum += scores[axis as keyof PerformanceScores] * priority;
  }
  
  return Math.round(weightedSum / totalWeight);
}

export { MODEL };
