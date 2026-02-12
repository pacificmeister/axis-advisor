'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { generateProsCons } from '@/lib/geminiService';

interface Product {
  id: string;
  title: string;
  specs: {
    series: string;
    area: number;
    aspectRatio?: number;
  };
  description?: string;
}

interface ProsCons {
  pros: string[];
  cons: string[];
}

interface Recommendation {
  product: Product;
  score: number;
  reasoning: string;
  prosCons?: ProsCons;
  fbFeedback?: string[];
}

interface FBPost {
  text: string;
  foils_mentioned: string[];
  rider_weight: number | null;
  use_case: string | null;
}

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [fbData, setFbData] = useState<FBPost[]>([]);
  const [formData, setFormData] = useState({
    weight: '',
    skillLevel: '',
    useCase: '',
  });
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingProsCons, setLoadingProsCons] = useState(false);

  // Load product data
  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(r => r.json())
      .then(data => {
        const frontWings = data.collections['front-wings'].products;
        setProducts(frontWings);
      })
      .catch(err => console.error('Failed to load products:', err));

    // Load FB feedback data
    fetch('/data/facebook-riders-feedback.json')
      .then(r => r.json())
      .then(data => {
        setFbData(data.posts || []);
      })
      .catch(err => console.warn('FB data not available:', err));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Match FB feedback to a foil
  const matchFBFeedback = (foilName: string): string[] => {
    const feedback: string[] = [];
    const normalized = foilName.toUpperCase().replace(/\s+/g, ' ');

    for (const post of fbData) {
      // Check if this post mentions this foil
      const mentioned = post.foils_mentioned.some(f => 
        normalized.includes(f.toUpperCase().replace(/\s+/g, ' '))
      );

      if (mentioned && post.text.length > 50) {
        // Extract relevant excerpt
        const excerpt = post.text.split('\n').slice(0, 3).join(' ').substring(0, 200);
        feedback.push(excerpt);
        
        if (feedback.length >= 3) break; // Max 3 excerpts
      }
    }

    return feedback;
  };

  const generateRecommendations = async () => {
    // Convert weight to lbs if needed
    const inputWeight = parseInt(formData.weight) || (weightUnit === 'kg' ? 80 : 175);
    const weight = weightUnit === 'kg' ? Math.round(inputWeight * 2.20462) : inputWeight;
    const { skillLevel, useCase } = formData;

    // Calculate ideal area range based on weight and skill
    let baseArea = weight * 6; // Starting point: ~6 cm²/lb
    
    // Parawing has different skill adjustments (expert-validated)
    if (useCase === 'parawing') {
      // Parawing: less aggressive reduction as skill increases
      if (skillLevel === 'beginner') baseArea *= 1.0;      // ~6 cm²/lb
      else if (skillLevel === 'intermediate') baseArea *= 0.92; // ~5.5 cm²/lb
      else if (skillLevel === 'advanced') baseArea *= 0.9;    // ~5.4 cm²/lb
    } else {
      // Other disciplines: standard skill adjustments
      if (skillLevel === 'beginner') baseArea *= 1.3;
      else if (skillLevel === 'intermediate') baseArea *= 1.0;
      else if (skillLevel === 'advanced') baseArea *= 0.8;
    }

    // Adjust for discipline (not parawing, already handled above)
    const disciplineAdjustments: Record<string, number> = {
      wing: 1.0,
      kite: 0.9,
      prone: 0.85,
      sup: 1.2,
      downwind: 1.3,
      pump: 1.4,
    };
    if (useCase !== 'parawing') {
      baseArea *= disciplineAdjustments[useCase] || 1.0;
    }

    // Define preferred series for each discipline (CURRENT/NEWER ONLY)
    const disciplineSeries: Record<string, string[]> = {
      wing: skillLevel === 'beginner' 
        ? ['Surge', 'BSC'] 
        : skillLevel === 'intermediate' 
          ? ['Surge', 'ART v2', 'Fireball'] 
          : ['Tempo', 'Spitfire', 'ART v2', 'Fireball'],
      // Parawing series change by skill level (expert-validated, current only)
      parawing: skillLevel === 'beginner' 
        ? ['PNG V2', 'Surge', 'Tempo'] 
        : skillLevel === 'intermediate' 
          ? ['Fireball', 'ART v2', 'Surge', 'PNG V2'] 
          : ['Fireball', 'Tempo', 'ART v2', 'Spitfire'],
      kite: skillLevel === 'beginner' 
        ? ['Surge', 'Tempo'] 
        : ['Spitfire', 'ART v2', 'PNG V2', 'Fireball'],
      prone: ['Surge', 'Fireball', 'Tempo'],
      sup: ['PNG V2', 'Surge', 'Tempo'],
      downwind: ['PNG V2', 'Surge', 'ART v2', 'Tempo'],
      pump: ['PNG V2', 'Tempo', 'Surge'],
    };

    const preferredSeries = disciplineSeries[useCase] || [];

    // Filter to only Current/Newer series (exclude Legacy)
    const currentSeries = ['Surge', 'Tempo', 'ART v2', 'Fireball', 'PNG V2', 'Spitfire'];
    const currentProducts = products.filter(p => {
      const series = p.specs.series;
      // Handle PNG V2 detection
      const effectiveSeries = series === 'PNG' && p.title.includes('V2') ? 'PNG V2' : series;
      return currentSeries.includes(effectiveSeries);
    });

    // Score each product
    const scored: Recommendation[] = currentProducts
      .map(product => {
        let score = 100;
        const area = product.specs.area;
        const series = product.specs.series;

        // Check if title contains "V2" for PNG V2 detection
        const effectiveSeries = series === 'PNG' && product.title.includes('V2') ? 'PNG V2' : series;

        // Series match (most important)
        if (!preferredSeries.includes(effectiveSeries)) {
          // Heavy penalty for wrong series (stricter for advanced)
          score -= skillLevel === 'advanced' ? 70 : 50;
        } else {
          const seriesIndex = preferredSeries.indexOf(effectiveSeries);
          // Bonus for being in preferred list, bigger bonus for top choices
          score += (5 - seriesIndex * 2); // +5 for 1st choice, +3 for 2nd, +1 for 3rd, -1 for 4th
        }

        // Area match (critical for safety and performance)
        const areaDiff = Math.abs(area - baseArea);
        const areaPercent = areaDiff / baseArea;
        
        if (areaPercent < 0.1) {
          score += 20; // Perfect match
        } else if (areaPercent < 0.2) {
          score += 10; // Good match
        } else if (areaPercent < 0.3) {
          score += 0; // Acceptable
        } else if (areaPercent < 0.5) {
          score -= 15; // Not ideal
        } else {
          score -= 35; // Poor match
        }

        // Too small is dangerous for beginners
        if (skillLevel === 'beginner' && area < baseArea * 0.8) {
          score -= 30;
        }

        // Too large is inefficient for advanced
        if (skillLevel === 'advanced' && area > baseArea * 1.3) {
          score -= 20;
        }

        // Aspect Ratio (AR) scoring - critical for skill matching
        const ar = product.specs.aspectRatio;
        if (ar) {
          if (skillLevel === 'beginner') {
            // Beginners need lower AR for stability
            if (ar > 12) score -= 25;      // High AR = too fast/twitchy
            else if (ar > 10) score -= 10; // Medium-high AR = challenging
            else if (ar < 9) score += 5;   // Low AR = forgiving, bonus
          } else if (skillLevel === 'intermediate') {
            // Intermediates do well with mid-range AR
            if (ar > 14) score -= 15;      // Very high AR = challenging
            else if (ar > 12) score -= 5;  // High AR = slight penalty
            else if (ar >= 9 && ar <= 11) score += 5; // Sweet spot bonus
          } else if (skillLevel === 'advanced') {
            // Advanced riders can handle high AR, slight bonus for efficiency
            if (ar < 8) score -= 10;       // Too low = inefficient
            else if (ar > 10) score += 5;  // Higher AR = more efficient
          }
        }

        // Match FB feedback
        const fbFeedback = matchFBFeedback(`${effectiveSeries} ${area}`);
        
        // Boost score if there's positive FB feedback
        if (fbFeedback.length > 0) {
          score += 5;
        }

        // Generate reasoning
        let reasoning = '';
        const sizeDesc = area > baseArea * 1.1 ? 'larger' : area < baseArea * 0.9 ? 'smaller' : 'ideal';
        
        if (useCase === 'parawing') {
          if (effectiveSeries === 'Fireball') reasoning = `${skillLevel === 'advanced' ? 'Fast and responsive' : 'Balanced speed and control'}. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'More stable' : 'Maximum speed'} for ${weight}lbs parawinger.`;
          else if (effectiveSeries === 'Tempo') reasoning = `High-performance glide machine. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'Easier to ride' : 'Advanced speed'} for experienced riders.`;
          else if (effectiveSeries === 'Surge') reasoning = `Versatile performer with great pump. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'More lift' : 'Faster pace'} all-rounder.`;
          else if (effectiveSeries === 'PNG V2') reasoning = `High-aspect speed and efficiency. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'More stable, easier' : 'Faster, more responsive'} for your weight.`;
          else if (effectiveSeries === 'Spitfire') reasoning = `Race-proven speed machine. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'More power' : 'Maximum speed'} for ${weight}lbs.`;
          else if (effectiveSeries === 'ART v2') reasoning = `Next-gen glide and pump. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'Easier to ride' : 'High performance'} choice.`;
          else if (effectiveSeries === 'ART') reasoning = `Legendary glide. ${sizeDesc === 'ideal' ? 'Well-matched' : sizeDesc === 'larger' ? 'More forgiving' : 'Advanced option'} for your level.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} option for parawing.`;
        } else if (useCase === 'wing') {
          if (effectiveSeries === 'Surge') reasoning = `${skillLevel === 'beginner' ? 'Perfect starter' : 'Versatile performer'}. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'Extra stability' : 'More speed'} for ${weight}lbs.`;
          else if (effectiveSeries === 'ART v2') reasoning = `Next-gen high-aspect. ${sizeDesc === 'ideal' ? 'Perfect fit' : sizeDesc === 'larger' ? 'Easier to ride' : 'Peak performance'}.`;
          else if (effectiveSeries === 'Tempo') reasoning = `Glide and pump balance. ${sizeDesc === 'ideal' ? 'Great match' : sizeDesc === 'larger' ? 'More lift' : 'Fast and efficient'}.`;
          else if (effectiveSeries === 'Spitfire') reasoning = `Race-proven speed. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'More power' : 'Maximum performance'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Solid' : sizeDesc === 'larger' ? 'Forgiving' : 'Fast'} wing foil.`;
        } else if (useCase === 'prone') {
          if (effectiveSeries === 'Surge') reasoning = `All-around surf performer. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Easy waves' : 'Tight carving'}.`;
          else if (effectiveSeries === 'Fireball') reasoning = `Wave specialist. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'Small wave magic' : 'High performance'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} for prone surf.`;
        } else if (useCase === 'sup' || useCase === 'pump') {
          if (effectiveSeries === 'PNG V2') reasoning = `V2 high-aspect pump king. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Easy starting' : 'More speed'}.`;
          else if (effectiveSeries === 'Tempo' || effectiveSeries === 'Surge') reasoning = `${effectiveSeries} glide machine. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'Easier pump' : 'Faster pace'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Easy' : 'Fast'} for ${useCase === 'pump' ? 'pumping' : 'SUP'}.`;
        } else if (useCase === 'downwind') {
          reasoning = `${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} for connecting bumps and downwind runs.`;
        } else {
          reasoning = `${sizeDesc === 'ideal' ? 'Good match' : sizeDesc === 'larger' ? 'More stable' : 'Faster option'} for your weight and skill.`;
        }

        // Cap score at 100%
        const finalScore = Math.min(Math.max(score, 0), 100);

        return {
          product,
          score: finalScore,
          reasoning,
          fbFeedback: fbFeedback.length > 0 ? fbFeedback : undefined,
        };
      })
      .filter(rec => rec.score > 30) // Filter out really bad matches
      .sort((a, b) => b.score - a.score);

    // Deduplicate by product ID (in case of data issues)
    const seen = new Set<string>();
    const unique = scored.filter(rec => {
      if (seen.has(rec.product.id)) return false;
      seen.add(rec.product.id);
      return true;
    });

    const topThree = unique.slice(0, 3);

    setRecommendations(topThree);
    setStep(4);

    // Generate pros/cons for each recommendation
    setLoadingProsCons(true);
    try {
      const recsWithProsCons = await Promise.all(
        topThree.map(async rec => {
          const effectiveSeries = rec.product.specs.series === 'PNG' && rec.product.title.includes('V2') 
            ? 'PNG V2' 
            : rec.product.specs.series;

          const prosCons = await generateProsCons({
            foilName: `${effectiveSeries} ${rec.product.specs.area}`,
            foilArea: rec.product.specs.area,
            foilSeries: effectiveSeries,
            userWeight: weight,
            userSkill: skillLevel,
            userDiscipline: useCase,
            fbFeedback: rec.fbFeedback,
          });

          return { ...rec, prosCons };
        })
      );

      setRecommendations(recsWithProsCons);
    } catch (error) {
      console.error('Failed to generate pros/cons:', error);
    } finally {
      setLoadingProsCons(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      weight: '',
      skillLevel: '',
      useCase: '',
    });
    setWeightUnit('lbs');
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Foil Recommendation Wizard
          </h1>
          <p className="text-lg text-gray-600">
            Answer a few questions to find your perfect AXIS foil
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`
                    flex-1 h-2 rounded-full mx-1
                    ${i < step ? 'bg-red-600' : i === step ? 'bg-red-400' : 'bg-gray-200'}
                  `}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 text-center">
              Step {Math.min(step, 3)} of 3
            </div>
          </div>

          {/* Step 1: Rider Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-900">
                    Your weight
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-3 py-1 rounded text-sm font-semibold transition ${
                        weightUnit === 'lbs' 
                          ? 'bg-red-600 text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      lbs
                    </button>
                    <button
                      onClick={() => setWeightUnit('kg')}
                      className={`px-3 py-1 rounded text-sm font-semibold transition ${
                        weightUnit === 'kg' 
                          ? 'bg-red-600 text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      kg
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={e => handleChange('weight', e.target.value)}
                  placeholder={weightUnit === 'lbs' ? '175' : '80'}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Skill level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => handleChange('skillLevel', level)}
                      className={`
                        py-3 px-4 rounded-lg font-semibold transition
                        ${formData.skillLevel === level
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.weight || !formData.skillLevel}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Use Case */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Primary use case
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'wing', label: 'Wing Foiling' },
                    { value: 'parawing', label: 'Parawing' },
                    { value: 'kite', label: 'Kite Foiling' },
                    { value: 'prone', label: 'Prone Surf' },
                    { value: 'sup', label: 'SUP Foiling' },
                    { value: 'downwind', label: 'Downwind' },
                    { value: 'pump', label: 'Dock Start / Pump' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleChange('useCase', option.value)}
                      className={`
                        py-3 px-4 rounded-lg font-semibold transition
                        ${formData.useCase === option.value
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.useCase}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Get Recommendations →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation before generating */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Your Answers</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Weight:</span>
                    <span className="text-gray-900">{formData.weight} {weightUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Skill Level:</span>
                    <span className="text-gray-900 capitalize">{formData.skillLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Use Case:</span>
                    <span className="text-gray-900 capitalize">
                      {formData.useCase === 'sup' ? 'SUP Foiling' : 
                       formData.useCase === 'parawing' ? 'Parawing' :
                       formData.useCase === 'wing' ? 'Wing Foiling' :
                       formData.useCase === 'kite' ? 'Kite Foiling' :
                       formData.useCase === 'prone' ? 'Prone Surf' :
                       formData.useCase === 'downwind' ? 'Downwind' :
                       'Dock Start / Pump'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
                >
                  ← Back
                </button>
                <button
                  onClick={generateRecommendations}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Generate Recommendations →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Your Perfect Foils</h2>
                <p className="text-gray-600">
                  Based on {formData.weight}{weightUnit} • {formData.skillLevel} • {formData.useCase === 'sup' ? 'SUP foiling' : 
                    formData.useCase === 'parawing' ? 'parawing' :
                    formData.useCase === 'wing' ? 'wing foiling' :
                    formData.useCase === 'kite' ? 'kite foiling' :
                    formData.useCase === 'prone' ? 'prone surf' :
                    formData.useCase === 'downwind' ? 'downwind' : 'pump foiling'}
                </p>
              </div>

              <div className="space-y-6">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.product.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-600 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm font-bold text-red-600 mb-1">
                          #{index + 1} RECOMMENDATION
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">
                          {rec.product.specs.series} {rec.product.specs.area}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-red-600">
                          {Math.round(rec.score)}%
                        </div>
                        <div className="text-sm text-gray-600">Match</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{rec.reasoning}</p>

                    {/* Pros/Cons */}
                    {loadingProsCons && !rec.prosCons && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    )}

                    {rec.prosCons && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Pros */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h4 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-2">
                            ✓ Why This Works
                          </h4>
                          <ul className="space-y-1">
                            {rec.prosCons.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-green-900 leading-relaxed">
                                • {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                          <h4 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">
                            ⚠ Consider
                          </h4>
                          <ul className="space-y-1">
                            {rec.prosCons.cons.map((con, i) => (
                              <li key={i} className="text-sm text-orange-900 leading-relaxed">
                                • {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* FB Feedback Badge */}
                    {rec.fbFeedback && rec.fbFeedback.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">
                            👥 Real Rider Feedback
                          </span>
                        </div>
                        <p className="text-xs text-blue-900 italic">
                          "{rec.fbFeedback[0].substring(0, 150)}..."
                        </p>
                      </div>
                    )}

                    <a
                      href={`https://axisfoils.com/products/${rec.product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      View on AXIS →
                    </a>
                  </div>
                ))}
              </div>

              <button
                onClick={resetWizard}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
