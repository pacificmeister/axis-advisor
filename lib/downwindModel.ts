// Downwind Recommendation Model v1
// Trained on 15 foils (6 Tempo + 9 Fireball)
// Scenario: 70kg rider, 25kn wind, 1m swell

export interface DownwindScores {
  lift: number;
  glide: number;
  speed: number;
  carving: number;
  pump: number;
  comfort: number;
}

export interface FoilSpecs {
  area: number;      // Projected area (cm²)
  ar: number;        // Aspect ratio
  roll: number;      // 2nd moment of area: roll
  pitch: number;     // 2nd moment of area: pitch
  span: number;      // Wingspan (mm)
}

// Regression coefficients from training
const coefficients = {
  lift: {
    coef_area: 0.14822825040750423,
    coef_ar: -0.9810164521250035,
    coef_roll: -0.00553254659604957,
    coef_pitch: -0.6700097569064343,
    coef_span: 0.14567965171491723,
    intercept: -128.919579515365
  },
  glide: {
    coef_area: 0.1650526764242689,
    coef_ar: 6.914802485748505,
    coef_roll: -0.004103808765371867,
    coef_pitch: -0.28389984839637866,
    coef_span: -0.03976470117815789,
    intercept: -80.22483484354241
  },
  speed: {
    coef_area: 0.048724159317672155,
    coef_ar: 4.841239860896757,
    coef_roll: 0.0015154026979228533,
    coef_pitch: -0.06456899588074466,
    coef_span: -0.17066427185118885,
    intercept: 126.8297486696896
  },
  carving: {
    coef_area: 0.3680457155957665,
    coef_ar: 8.054172962722415,
    coef_roll: 0.0017400280903533006,
    coef_pitch: -1.418425821611558,
    coef_span: -0.39708728562698303,
    intercept: 142.78388737064108
  },
  pump: {
    coef_area: 0.2184842101502131,
    coef_ar: 2.151931893556875,
    coef_roll: -0.005572800645675385,
    coef_pitch: -0.6538854684120938,
    coef_span: 0.057683016932336274,
    intercept: -145.57799595989906
  },
  comfort: {
    coef_area: 0.41894004558315356,
    coef_ar: 0.19009538493773318,
    coef_roll: -0.004343737092854858,
    coef_pitch: -2.313559344154672,
    coef_span: -0.09051067135983078,
    intercept: -36.491932545780145
  }
};

// Calculate score for a single axis
function calculateAxisScore(specs: FoilSpecs, axis: keyof typeof coefficients): number {
  const c = coefficients[axis];
  const score = 
    c.coef_area * specs.area +
    c.coef_ar * specs.ar +
    c.coef_roll * specs.roll +
    c.coef_pitch * specs.pitch +
    c.coef_span * specs.span +
    c.intercept;
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

// Calculate all 6 axis scores for a foil
export function calculateDownwindScores(specs: FoilSpecs): DownwindScores {
  return {
    lift: calculateAxisScore(specs, 'lift'),
    glide: calculateAxisScore(specs, 'glide'),
    speed: calculateAxisScore(specs, 'speed'),
    carving: calculateAxisScore(specs, 'carving'),
    pump: calculateAxisScore(specs, 'pump'),
    comfort: calculateAxisScore(specs, 'comfort')
  };
}

// Weight adjustments for different rider weights
// Base model is 70kg - adjust scores based on weight difference
export function adjustForWeight(scores: DownwindScores, riderWeightKg: number): DownwindScores {
  const weightDiff = riderWeightKg - 70;
  const factor = weightDiff / 10; // per 10kg difference
  
  return {
    // Heavier riders need more lift, less speed/carving
    lift: Math.max(0, Math.min(100, scores.lift - factor * 5)),
    glide: Math.max(0, Math.min(100, scores.glide - factor * 3)),
    speed: Math.max(0, Math.min(100, scores.speed + factor * 3)),
    carving: Math.max(0, Math.min(100, scores.carving + factor * 2)),
    pump: Math.max(0, Math.min(100, scores.pump - factor * 4)),
    comfort: Math.max(0, Math.min(100, scores.comfort - factor * 2))
  };
}

// Calculate overall match score based on user priorities
export interface UserPriorities {
  lift?: number;      // 0-10 importance
  glide?: number;
  speed?: number;
  carving?: number;
  pump?: number;
  comfort?: number;
}

export function calculateMatchScore(
  scores: DownwindScores, 
  priorities: UserPriorities = {}
): number {
  // Default downwind priorities: glide > pump > lift > comfort > speed > carving
  const weights = {
    lift: priorities.lift ?? 7,
    glide: priorities.glide ?? 10,
    speed: priorities.speed ?? 4,
    carving: priorities.carving ?? 3,
    pump: priorities.pump ?? 9,
    comfort: priorities.comfort ?? 6
  };
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  
  const weightedScore = 
    (scores.lift * weights.lift +
     scores.glide * weights.glide +
     scores.speed * weights.speed +
     scores.carving * weights.carving +
     scores.pump * weights.pump +
     scores.comfort * weights.comfort) / totalWeight;
  
  return weightedScore;
}
