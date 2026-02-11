'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';

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

interface Recommendation {
  product: Product;
  score: number;
  reasoning: string;
}

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    weight: '',
    skillLevel: '',
    useCase: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Load product data
  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(r => r.json())
      .then(data => {
        const frontWings = data.collections['front-wings'].products;
        setProducts(frontWings);
      })
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendations = () => {
    const weight = parseInt(formData.weight) || 175;
    const { skillLevel, useCase } = formData;

    // Calculate ideal area range based on weight and skill
    let baseArea = weight * 6; // Starting point: ~6 cm²/lb
    
    // Adjust for skill level
    if (skillLevel === 'beginner') baseArea *= 1.3;
    else if (skillLevel === 'intermediate') baseArea *= 1.0;
    else if (skillLevel === 'advanced') baseArea *= 0.8;

    // Adjust for discipline
    const disciplineAdjustments: Record<string, number> = {
      wing: 1.0,
      parawing: 1.0,
      kite: 0.9,
      prone: 0.85,
      sup: 1.2,
      downwind: 1.3,
      pump: 1.4,
    };
    baseArea *= disciplineAdjustments[useCase] || 1.0;

    // Define preferred series for each discipline
    const disciplineSeries: Record<string, string[]> = {
      wing: skillLevel === 'beginner' ? ['BSC'] : skillLevel === 'intermediate' ? ['BSC', 'HPS', 'ART'] : ['ART', 'ART v2', 'HPS', 'Spitfire'],
      parawing: skillLevel === 'beginner' ? ['BSC', 'HPS'] : ['PNG V2', 'PNG', 'Spitfire', 'ART v2', 'ART', 'HPS'],
      kite: skillLevel === 'beginner' ? ['BSC', 'HPS'] : ['Spitfire', 'ART v2', 'PNG V2', 'ART', 'HPS'],
      prone: ['BSC', 'SP', 'HPS'],
      sup: ['PNG', 'PNG V2', 'BSC', 'Surge'],
      downwind: ['PNG', 'PNG V2', 'ART', 'ART v2', 'HPS', 'Surge'],
      pump: ['PNG', 'PNG V2', 'Tempo', 'Surge'],
    };

    const preferredSeries = disciplineSeries[useCase] || [];

    // Score each product
    const scored: Recommendation[] = products
      .map(product => {
        let score = 100;
        const area = product.specs.area;
        const series = product.specs.series;

        // Check if title contains "V2" for PNG V2 detection
        const effectiveSeries = series === 'PNG' && product.title.includes('V2') ? 'PNG V2' : series;

        // Series match (most important)
        if (!preferredSeries.includes(effectiveSeries)) {
          score -= 50; // Heavy penalty for wrong series
        } else {
          const seriesIndex = preferredSeries.indexOf(effectiveSeries);
          score -= seriesIndex * 5; // Prefer earlier series in list
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

        // Generate reasoning
        let reasoning = '';
        const sizeDesc = area > baseArea * 1.1 ? 'larger' : area < baseArea * 0.9 ? 'smaller' : 'ideal';
        
        if (useCase === 'parawing') {
          if (effectiveSeries === 'PNG V2') reasoning = `High-aspect speed and efficiency. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'More stable, easier' : 'Faster, more responsive'} for your weight.`;
          else if (effectiveSeries === 'Spitfire') reasoning = `Race-proven speed machine. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'More power' : 'Maximum speed'} for ${weight}lbs.`;
          else if (effectiveSeries === 'ART v2') reasoning = `Next-gen glide and pump. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'Easier to ride' : 'High performance'} choice.`;
          else if (effectiveSeries === 'ART') reasoning = `Legendary glide. ${sizeDesc === 'ideal' ? 'Well-matched' : sizeDesc === 'larger' ? 'More forgiving' : 'Advanced option'} for your level.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} option for parawing.`;
        } else if (useCase === 'wing') {
          if (effectiveSeries === 'BSC') reasoning = `${skillLevel === 'beginner' ? 'Perfect starter' : 'Versatile performer'}. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'Extra stability' : 'More speed'} for ${weight}lbs.`;
          else if (effectiveSeries === 'HPS') reasoning = `Popular high-aspect. ${sizeDesc === 'ideal' ? 'Great fit' : sizeDesc === 'larger' ? 'Easier to ride' : 'Performance focused'}.`;
          else if (effectiveSeries === 'ART') reasoning = `Ultimate glide. ${sizeDesc === 'ideal' ? 'Well-suited' : sizeDesc === 'larger' ? 'More accessible' : 'Peak performance'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Solid' : sizeDesc === 'larger' ? 'Forgiving' : 'Fast'} wing foil.`;
        } else if (useCase === 'prone') {
          if (effectiveSeries === 'BSC') reasoning = `All-around performer. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Easy waves' : 'Tight carving'}.`;
          else if (effectiveSeries === 'SP') reasoning = `Carving specialist. ${sizeDesc === 'ideal' ? 'Ideal' : sizeDesc === 'larger' ? 'Small wave magic' : 'High performance'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} for prone.`;
        } else if (useCase === 'sup' || useCase === 'pump') {
          if (effectiveSeries === 'PNG' || effectiveSeries === 'PNG V2') reasoning = `${effectiveSeries === 'PNG V2' ? 'V2 high-aspect' : 'Classic'} pump king. ${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Easy starting' : 'More speed'}.`;
          else if (effectiveSeries === 'Tempo' || effectiveSeries === 'Surge') reasoning = `${effectiveSeries} glide machine. ${sizeDesc === 'ideal' ? 'Excellent' : sizeDesc === 'larger' ? 'Easier pump' : 'Faster pace'}.`;
          else reasoning = `${sizeDesc === 'ideal' ? 'Good' : sizeDesc === 'larger' ? 'Easy' : 'Fast'} for ${useCase === 'pump' ? 'pumping' : 'SUP'}.`;
        } else if (useCase === 'downwind') {
          reasoning = `${sizeDesc === 'ideal' ? 'Perfect' : sizeDesc === 'larger' ? 'Stable' : 'Fast'} for connecting bumps and downwind runs.`;
        } else {
          reasoning = `${sizeDesc === 'ideal' ? 'Good match' : sizeDesc === 'larger' ? 'More stable' : 'Faster option'} for your weight and skill.`;
        }

        return {
          product,
          score,
          reasoning,
        };
      })
      .filter(rec => rec.score > 30) // Filter out really bad matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setRecommendations(scored);
    setStep(4);
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      weight: '',
      skillLevel: '',
      useCase: '',
    });
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
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Your weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={e => handleChange('weight', e.target.value)}
                  placeholder="175"
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
                    <span className="text-gray-900">{formData.weight} lbs</span>
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
                  Based on {formData.weight}lbs • {formData.skillLevel} • {formData.useCase === 'sup' ? 'SUP foiling' : 
                    formData.useCase === 'parawing' ? 'parawing' :
                    formData.useCase === 'wing' ? 'wing foiling' :
                    formData.useCase === 'kite' ? 'kite foiling' :
                    formData.useCase === 'prone' ? 'prone surf' :
                    formData.useCase === 'downwind' ? 'downwind' : 'pump foiling'}
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.product.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
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
