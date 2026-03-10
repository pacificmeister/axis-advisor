'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';

interface Wing {
  name: string;
  displayName: string;
  series: string;
  span: number;
  area: number;
  aspectRatio: number;
  rollMoment: number;
  pitchMoment: number;
  thickness: number | null;
  camber: number | null;
  volume: number | null;
  scores: Record<string, number>;
  predicted: Record<string, number>;
  scoreSource: string;
}

interface RecommenderData {
  meta: {
    version: string;
    source: string;
    ratedBy: string;
    referenceWeight: string;
    rSquared: Record<string, number>;
  };
  coefficients: Record<string, Record<string, number>>;
  wings: Wing[];
}

interface CompatibilityData {
  meta: {
    weightCategories: Record<string, string>;
  };
  combinations: Record<string, {
    area: number;
    rearWings: Record<string, string[]>;
  }>;
}

type Discipline = 'downwind' | 'wing' | 'prone' | 'kite' | 'tow' | 'allround';

// Discipline-specific score weights
const DISCIPLINE_WEIGHTS: Record<Discipline, Record<string, number>> = {
  downwind: { Lift: 0.25, Glide: 0.30, Speed: 0.20, Pump: 0.15, Comfort: 0.05, Carving: 0.05 },
  wing:     { Lift: 0.20, Glide: 0.20, Speed: 0.15, Pump: 0.15, Comfort: 0.15, Carving: 0.15 },
  prone:    { Lift: 0.15, Glide: 0.15, Speed: 0.15, Pump: 0.20, Comfort: 0.10, Carving: 0.25 },
  kite:     { Lift: 0.10, Glide: 0.15, Speed: 0.25, Pump: 0.10, Comfort: 0.15, Carving: 0.25 },
  tow:      { Lift: 0.05, Glide: 0.10, Speed: 0.30, Pump: 0.05, Comfort: 0.20, Carving: 0.30 },
  allround: { Lift: 0.17, Glide: 0.17, Speed: 0.17, Pump: 0.17, Comfort: 0.16, Carving: 0.16 },
};

// Series colors
const SERIES_COLORS: Record<string, string> = {
  'Tempo': '#f59e0b',
  'Fireball': '#ef4444',
  'Surge': '#10b981',
  'ART Pro': '#8b5cf6',
  'ART V2': '#6366f1',
  'Spitfire': '#3b82f6',
  'PNG V2': '#06b6d4',
};

const SERIES_DESCRIPTIONS: Record<string, string> = {
  'Tempo': 'Ultra-high-aspect. F1 of downwind. Maximum glide & speed.',
  'Fireball': 'High-camber glide machine. Great for DW, parawing, winging.',
  'Surge': 'Dedicated surf weapon. Critical wave sections, back-foot drive.',
  'ART Pro': 'Versatile all-rounder. Refined performance across disciplines.',
  'ART V2': 'Winging & parawing specialist. Forgiving with great turning.',
  'Spitfire': 'Beginner-friendly. Stable, predictable, easy to pump.',
  'PNG V2': 'Heavy rider specialist. Maximum lift and stability.',
};

// Weight-based area sizing guide (approximate)
function getAreaRange(weightKg: number): [number, number] {
  if (weightKg < 60) return [500, 900];
  if (weightKg < 70) return [600, 1000];
  if (weightKg < 80) return [700, 1200];
  if (weightKg < 90) return [800, 1400];
  if (weightKg < 100) return [900, 1600];
  return [1000, 2000];
}

// Radar chart component
function RadarChart({ scores, size = 180 }: { scores: Record<string, number>; size?: number }) {
  const labels = ['Lift', 'Glide', 'Speed', 'Carving', 'Pump', 'Comfort'];
  const center = size / 2;
  const radius = size / 2 - 30;

  const points = labels.map((label, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const value = (scores[label] || 0) / 100;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
      labelX: center + (radius + 18) * Math.cos(angle),
      labelY: center + (radius + 18) * Math.sin(angle),
      label,
      value: scores[label] || 0,
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={labels
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
              return `${center + radius * level * Math.cos(angle)},${center + radius * level * Math.sin(angle)}`;
            })
            .join(' ')}
          fill="none"
          stroke="#374151"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {labels.map((_, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="#374151"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="rgba(239, 68, 68, 0.2)"
        stroke="#ef4444"
        strokeWidth="2"
      />
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ef4444" />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#9ca3af"
          fontSize="9"
          fontWeight="600"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// Score bar component
function ScoreBar({ label, value, max = 100, color = '#ef4444' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-gray-300 w-8">{Math.round(value)}</span>
    </div>
  );
}

export default function RecommendPage() {
  const [data, setData] = useState<RecommenderData | null>(null);
  const [weightKg, setWeightKg] = useState(80);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [discipline, setDiscipline] = useState<Discipline>('downwind');
  const [windSpeed, setWindSpeed] = useState(20);
  const [swellSize, setSwellSize] = useState(1.0);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedWing, setSelectedWing] = useState<Wing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [compatData, setCompatData] = useState<CompatibilityData | null>(null);

  useEffect(() => {
    fetch('/data/axmann-recommender.json')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
    fetch('/data/axmann-compatibility.json')
      .then((r) => r.json())
      .then(setCompatData)
      .catch(console.error);
  }, []);

  // Convert display weight to kg
  const effectiveWeightKg = weightUnit === 'lbs' ? Math.round(weightKg * 0.453592) : weightKg;

  const recommendations = useMemo(() => {
    if (!data) return [];

    const weights = DISCIPLINE_WEIGHTS[discipline];
    const [minArea, maxArea] = getAreaRange(effectiveWeightKg);

    // Adjust weights based on conditions
    const adjustedWeights = { ...weights };

    // Heavy wind → more speed & comfort matter
    if (windSpeed > 25) {
      adjustedWeights.Speed = (adjustedWeights.Speed || 0) + 0.05;
      adjustedWeights.Comfort = (adjustedWeights.Comfort || 0) + 0.05;
      adjustedWeights.Lift = Math.max(0, (adjustedWeights.Lift || 0) - 0.05);
      adjustedWeights.Pump = Math.max(0, (adjustedWeights.Pump || 0) - 0.05);
    }

    // Light wind → more lift & pump matter
    if (windSpeed < 12) {
      adjustedWeights.Lift = (adjustedWeights.Lift || 0) + 0.08;
      adjustedWeights.Pump = (adjustedWeights.Pump || 0) + 0.05;
      adjustedWeights.Speed = Math.max(0, (adjustedWeights.Speed || 0) - 0.08);
      adjustedWeights.Carving = Math.max(0, (adjustedWeights.Carving || 0) - 0.05);
    }

    // Big swell → carving & comfort
    if (swellSize > 1.5) {
      adjustedWeights.Carving = (adjustedWeights.Carving || 0) + 0.05;
      adjustedWeights.Comfort = (adjustedWeights.Comfort || 0) + 0.05;
      adjustedWeights.Glide = Math.max(0, (adjustedWeights.Glide || 0) - 0.05);
      adjustedWeights.Speed = Math.max(0, (adjustedWeights.Speed || 0) - 0.05);
    }

    // Normalize weights
    const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(adjustedWeights)) {
      adjustedWeights[k] /= totalWeight;
    }

    // Skill level adjustments
    const skillMultipliers: Record<string, Record<string, number>> = {
      beginner: { Comfort: 1.3, Lift: 1.2, Speed: 0.7, Carving: 0.8 },
      intermediate: {},
      advanced: { Speed: 1.2, Carving: 1.2, Comfort: 0.8, Lift: 0.8 },
    };

    return data.wings
      .map((wing) => {
        // Calculate weighted score
        let totalScore = 0;
        for (const [metric, weight] of Object.entries(adjustedWeights)) {
          const skillMult = skillMultipliers[skillLevel]?.[metric] || 1.0;
          totalScore += (wing.scores[metric] || 0) * weight * skillMult;
        }

        // Area fit penalty — prefer wings sized for rider weight
        const areaMid = (minArea + maxArea) / 2;
        const areaSpread = (maxArea - minArea) / 2;
        const areaOffset = Math.abs(wing.area - areaMid) / areaSpread;
        const areaFit = areaOffset <= 1 ? 1.0 : Math.max(0.5, 1.0 - (areaOffset - 1) * 0.3);

        // Beginners get stronger area penalty for too-small wings
        const sizePenalty = skillLevel === 'beginner' && wing.area < minArea
          ? 0.7
          : 1.0;

        const finalScore = totalScore * areaFit * sizePenalty;

        return { wing, score: finalScore, areaFit: areaFit * sizePenalty };
      })
      .filter((r) => {
        if (seriesFilter.length > 0 && !seriesFilter.includes(r.wing.series)) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [data, effectiveWeightKg, discipline, windSpeed, swellSize, skillLevel, seriesFilter]);

  const displayWeight = weightUnit === 'lbs' ? Math.round(weightKg) : weightKg;
  const weightLabel = weightUnit === 'lbs' ? 'lbs' : 'kg';

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-gray-400">Loading Axmann model...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-red-950/40 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Foil Recommender</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Powered by the Axmann Engineering Model — {data.wings.length} wings analyzed across 6 performance axes
              </p>
              <p className="text-gray-500 text-xs mt-1">
                v3 Model by Evan Axmann • R² = 0.84–0.98 • Reference weight: 87kg
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Input Panel */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Rider Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Rider Weight
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={weightUnit === 'kg' ? 45 : 100}
                  max={weightUnit === 'kg' ? 120 : 265}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="flex-1 accent-red-500"
                />
                <span className="text-lg font-bold text-white w-16 text-right">
                  {displayWeight}
                </span>
                <button
                  onClick={() => {
                    if (weightUnit === 'kg') {
                      setWeightUnit('lbs');
                      setWeightKg(Math.round(weightKg * 2.20462));
                    } else {
                      setWeightUnit('kg');
                      setWeightKg(Math.round(weightKg * 0.453592));
                    }
                  }}
                  className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 transition"
                >
                  {weightLabel}
                </button>
              </div>
            </div>

            {/* Discipline */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="downwind">🌊 Downwind</option>
                <option value="wing">🪁 Wing Foiling</option>
                <option value="prone">🏄 Prone Surf</option>
                <option value="kite">🪂 Kite Foiling</option>
                <option value="tow">🚤 Tow / Wake</option>
                <option value="allround">🎯 All-Round</option>
              </select>
            </div>

            {/* Wind Speed */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Wind Speed
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-lg font-bold text-white w-16 text-right">
                  {windSpeed} kn
                </span>
              </div>
            </div>

            {/* Swell Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Swell Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.2}
                  value={swellSize}
                  onChange={(e) => setSwellSize(Number(e.target.value))}
                  className="flex-1 accent-teal-500"
                />
                <span className="text-lg font-bold text-white w-16 text-right">
                  {swellSize.toFixed(1)}m
                </span>
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Skill Level
              </label>
              <div className="flex gap-1">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={`flex-1 px-2 py-2 text-xs rounded-lg font-semibold transition ${
                      skillLevel === level
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {level === 'beginner' ? '🟢' : level === 'intermediate' ? '🟡' : '🔴'}{' '}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Series Filter */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              {showFilters ? '▼' : '▶'} Series Filter
              {seriesFilter.length > 0 && (
                <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full ml-1">
                  {seriesFilter.length}
                </span>
              )}
            </button>
            {showFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(SERIES_COLORS).map(([series, color]) => (
                  <button
                    key={series}
                    onClick={() =>
                      setSeriesFilter((prev) =>
                        prev.includes(series) ? prev.filter((s) => s !== series) : [...prev, series]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                      seriesFilter.length === 0 || seriesFilter.includes(series)
                        ? 'border-transparent text-white'
                        : 'border-gray-700 text-gray-500 bg-transparent'
                    }`}
                    style={{
                      backgroundColor:
                        seriesFilter.length === 0 || seriesFilter.includes(series) ? color : undefined,
                    }}
                  >
                    {series}
                  </button>
                ))}
                {seriesFilter.length > 0 && (
                  <button
                    onClick={() => setSeriesFilter([])}
                    className="px-3 py-1 rounded-full text-xs text-gray-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Condition Summary */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
            {effectiveWeightKg}kg rider
          </span>
          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
            {windSpeed < 12 ? '🌤️ Light' : windSpeed < 20 ? '💨 Moderate' : windSpeed < 30 ? '🌬️ Strong' : '⚡ Heavy'} wind ({windSpeed}kn)
          </span>
          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
            {swellSize < 0.5 ? '🌊 Flat' : swellSize < 1.2 ? '🌊 Small' : swellSize < 2.0 ? '🌊 Medium' : '🌊 Large'} swell ({swellSize}m)
          </span>
          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
            Ideal area: {getAreaRange(effectiveWeightKg)[0]}–{getAreaRange(effectiveWeightKg)[1]} cm²
          </span>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rankings */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-bold text-gray-200">
              Top Recommendations
              <span className="text-sm font-normal text-gray-500 ml-2">
                {recommendations.length} wings ranked
              </span>
            </h2>

            {recommendations.slice(0, 15).map((rec, i) => {
              const isTop3 = i < 3;
              const isSelected = selectedWing?.name === rec.wing.name;
              const color = SERIES_COLORS[rec.wing.series] || '#6b7280';
              const maxScore = recommendations[0]?.score || 1;

              return (
                <div
                  key={rec.wing.name}
                  onClick={() => setSelectedWing(rec.wing)}
                  className={`rounded-xl border p-4 cursor-pointer transition hover:border-gray-600 ${
                    isSelected
                      ? 'border-red-500 bg-gray-900/80'
                      : isTop3
                      ? 'border-gray-700 bg-gray-900/60'
                      : 'border-gray-800 bg-gray-900/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                        i === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : i === 1
                          ? 'bg-gray-400/20 text-gray-300'
                          : i === 2
                          ? 'bg-amber-700/20 text-amber-600'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{rec.wing.displayName}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {rec.wing.series}
                        </span>
                        {rec.areaFit < 0.9 && (
                          <span className="text-xs text-amber-400">
                            ⚠️ {rec.wing.area < getAreaRange(effectiveWeightKg)[0] ? 'Small' : 'Large'} for your weight
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{rec.wing.area} cm²</span>
                        <span>AR {rec.wing.aspectRatio}</span>
                        <span>{rec.wing.span}mm span</span>
                        <span className="text-gray-600">
                          {rec.wing.scoreSource === 'regression' ? 'Predicted' : 'Rated'}
                        </span>
                      </div>

                      {/* Mini score bars */}
                      <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                        {['Lift', 'Glide', 'Speed', 'Carving', 'Pump', 'Comfort'].map((metric) => (
                          <ScoreBar
                            key={metric}
                            label={metric}
                            value={rec.wing.scores[metric] || 0}
                            color={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black" style={{ color }}>
                        {Math.round(rec.score)}
                      </div>
                      <div className="text-xs text-gray-500">score</div>
                      {/* Match bar */}
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(rec.score / maxScore) * 100}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedWing ? (
              <div className="sticky top-20 bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: SERIES_COLORS[selectedWing.series] || '#6b7280' }}
                  />
                  <h3 className="text-lg font-bold">{selectedWing.displayName}</h3>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  {SERIES_DESCRIPTIONS[selectedWing.series]}
                </p>

                {/* Radar Chart */}
                <div className="flex justify-center mb-4">
                  <RadarChart scores={selectedWing.scores} size={200} />
                </div>

                {/* Specs */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Engineering Specs</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500">Area</span>
                      <div className="text-white font-bold">{selectedWing.area} cm²</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500">Aspect Ratio</span>
                      <div className="text-white font-bold">{selectedWing.aspectRatio}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500">Span</span>
                      <div className="text-white font-bold">{selectedWing.span}mm</div>
                    </div>
                    {selectedWing.thickness && (
                      <div className="bg-gray-800 rounded-lg p-2">
                        <span className="text-gray-500">Thickness</span>
                        <div className="text-white font-bold">{selectedWing.thickness}mm</div>
                      </div>
                    )}
                    <div className="bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500">Roll Moment</span>
                      <div className="text-white font-bold">{selectedWing.rollMoment}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500">Pitch Moment</span>
                      <div className="text-white font-bold">{selectedWing.pitchMoment}</div>
                    </div>
                    {selectedWing.volume && (
                      <div className="bg-gray-800 rounded-lg p-2">
                        <span className="text-gray-500">Volume</span>
                        <div className="text-white font-bold">{selectedWing.volume} cm³</div>
                      </div>
                    )}
                    {selectedWing.camber && (
                      <div className="bg-gray-800 rounded-lg p-2">
                        <span className="text-gray-500">Camber</span>
                        <div className="text-white font-bold">{(selectedWing.camber * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Scores */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Performance Scores</h4>
                  {['Lift', 'Glide', 'Speed', 'Carving', 'Pump', 'Comfort'].map((metric) => (
                    <ScoreBar
                      key={metric}
                      label={metric}
                      value={selectedWing.scores[metric] || 0}
                      color={SERIES_COLORS[selectedWing.series] || '#6b7280'}
                    />
                  ))}
                </div>

                {/* Rear Wing Compatibility */}
                {compatData && (() => {
                  // Match selected wing to compatibility data
                  const compatKey = Object.keys(compatData.combinations).find(k => {
                    const normalizedKey = k.replace('ART Pro ', 'ARTPRO');
                    const normalizedWing = selectedWing.name.replace('ARTPRO', 'ART Pro ');
                    return k === selectedWing.displayName || 
                           normalizedKey === selectedWing.name ||
                           selectedWing.displayName.includes(k) ||
                           k.includes(selectedWing.displayName);
                  });
                  
                  if (!compatKey) return null;
                  const compat = compatData.combinations[compatKey];
                  
                  // Determine weight category
                  const getWeightCat = (kg: number): string => {
                    if (kg >= 90) return 'beginner_90plus';
                    if (kg >= 80) return 'progression_80_90';
                    if (kg >= 70) return 'perfect_70_80';
                    if (kg >= 60) return 'advanced_60_70';
                    return 'extreme_under60';
                  };
                  
                  const weightCat = getWeightCat(effectiveWeightKg);
                  const matchingRears = Object.entries(compat.rearWings)
                    .filter(([_, cats]) => cats.includes(weightCat))
                    .map(([name]) => name);
                  
                  if (matchingRears.length === 0) return null;
                  
                  return (
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-800">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase">
                        ✅ Compatible Rear Wings ({effectiveWeightKg}kg)
                      </h4>
                      <div className="space-y-1">
                        {matchingRears.map(rw => (
                          <div key={rw} className="text-xs bg-green-900/20 border border-green-800/30 rounded px-2 py-1 text-green-300">
                            {rw}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-4 text-xs text-gray-600 text-center">
                  Data source: {selectedWing.scoreSource === 'regression' ? 'Regression prediction' : selectedWing.scoreSource}
                </div>
              </div>
            ) : (
              <div className="sticky top-20 bg-gray-900 rounded-xl border border-gray-800 p-6 text-center text-gray-500">
                <span className="text-3xl block mb-2">👆</span>
                <p className="text-sm">Click a wing to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-12 bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">🧪 How the Axmann Model Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-semibold mb-1">📐 Engineering Data</h3>
              <p>
                Every wing is measured for Area, Aspect Ratio, Roll Moment, and Pitch Moment — the four
                key geometry parameters that determine how a foil performs.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">🧮 Regression Model</h3>
              <p>
                20 foils were hand-rated by Evan Axmann at 87kg, creating training data. A regression model
                (R² = 0.84–0.98) predicts performance scores for all {data.wings.length} wings from geometry alone.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">🎯 Smart Ranking</h3>
              <p>
                Your inputs (weight, discipline, conditions, skill) adjust which scores matter most.
                Wing area is matched to rider weight. Result: a personalized ranking from physics, not marketing.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">
            This model was built from Philippe Axmann&apos;s engineering dataset, rated by Evan Axmann.
            Scores are predictions — real-world performance varies with conditions, equipment, and rider style.
          </p>
        </div>
      </div>
    </div>
  );
}
