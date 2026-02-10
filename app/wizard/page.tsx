'use client';

import { useState } from 'react';
import Header from '../components/Header';

interface Recommendation {
  model: string;
  series: string;
  area: number;
  score: number;
  reasoning: string;
}

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: '',
    skillLevel: '',
    useCase: '',
    conditions: '',
    style: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendations = () => {
    const weight = parseInt(formData.weight) || 175;
    const recs: Recommendation[] = [];

    // Simple recommendation logic (will be enhanced with Facebook data)
    if (formData.useCase === 'wing') {
      if (formData.skillLevel === 'beginner') {
        recs.push({
          model: 'BSC 1060',
          series: 'BSC',
          area: 1060,
          score: 95,
          reasoning: 'Perfect beginner wing foil. Easy lift, forgiving, wide speed range.',
        });
        recs.push({
          model: 'BSC 1200',
          series: 'BSC',
          area: 1200,
          score: 90,
          reasoning: 'Larger surface for lighter winds. Very stable and confidence-inspiring.',
        });
      } else if (formData.skillLevel === 'intermediate') {
        recs.push({
          model: 'HPS 880',
          series: 'HPS',
          area: 880,
          score: 95,
          reasoning: 'Most popular wing foil. Great speed, accessible high aspect.',
        });
        recs.push({
          model: 'ART 899',
          series: 'ART',
          area: 899,
          score: 92,
          reasoning: 'Amazing glide and pump. Surprisingly easy for high aspect.',
        });
        recs.push({
          model: 'BSC 890',
          series: 'BSC',
          area: 890,
          score: 88,
          reasoning: 'Bridge between beginner and performance. Super versatile.',
        });
      } else if (formData.skillLevel === 'advanced') {
        recs.push({
          model: 'ART 799',
          series: 'ART',
          area: 799,
          score: 95,
          reasoning: 'Insane speed and glide. Still turns well. Peak performance.',
        });
        recs.push({
          model: 'ARTPRO 879',
          series: 'ARTPRO',
          area: 879,
          score: 93,
          reasoning: 'Next-gen design. Even faster than ART with better control.',
        });
        recs.push({
          model: 'HPS 780',
          series: 'HPS',
          area: 780,
          score: 90,
          reasoning: 'High-speed performance, great for strong wind days.',
        });
      }
    } else if (formData.useCase === 'parawing') {
      // Parawing uses similar foils to kiting - high aspect for speed and efficiency
      if (formData.skillLevel === 'beginner') {
        recs.push({
          model: 'BSC 1060',
          series: 'BSC',
          area: 1060,
          score: 95,
          reasoning: 'Great starter for parawing. Forgiving, easy to control, handles gusts well.',
        });
        recs.push({
          model: 'HPS 1080',
          series: 'HPS',
          area: 1080,
          score: 90,
          reasoning: 'Stable high aspect intro. Good speed range for learning wind control.',
        });
      } else if (formData.skillLevel === 'intermediate') {
        recs.push({
          model: 'HPS 880',
          series: 'HPS',
          area: 880,
          score: 95,
          reasoning: 'Perfect parawing foil. Fast, efficient, great upwind performance.',
        });
        recs.push({
          model: 'ART 899',
          series: 'ART',
          area: 899,
          score: 93,
          reasoning: 'Excellent glide for light wind days. Pumps through lulls easily.',
        });
        recs.push({
          model: 'HPS 780',
          series: 'HPS',
          area: 780,
          score: 88,
          reasoning: 'High-wind weapon. Super fast and efficient in strong wind.',
        });
      } else if (formData.skillLevel === 'advanced') {
        recs.push({
          model: 'ART 799',
          series: 'ART',
          area: 799,
          score: 95,
          reasoning: 'Ultimate parawing speed machine. Unreal glide and upwind ability.',
        });
        recs.push({
          model: 'ARTPRO 879',
          series: 'ARTPRO',
          area: 879,
          score: 93,
          reasoning: 'Next-gen speed. Even faster than ART with better low-end.',
        });
        recs.push({
          model: 'HPS 730',
          series: 'HPS',
          area: 730,
          score: 90,
          reasoning: 'Small and fast for strong wind days. Maximum efficiency.',
        });
      }
    } else if (formData.useCase === 'prone') {
      if (formData.skillLevel === 'beginner') {
        recs.push({
          model: 'BSC 810',
          series: 'BSC',
          area: 810,
          score: 95,
          reasoning: 'Most popular prone foil. Easy paddling, great wave feel.',
        });
      } else if (formData.skillLevel === 'intermediate') {
        recs.push({
          model: 'SP 860',
          series: 'SP',
          area: 860,
          score: 95,
          reasoning: 'Loose carving specialist. Perfect for small-medium waves.',
        });
        recs.push({
          model: 'BSC 810',
          series: 'BSC',
          area: 810,
          score: 90,
          reasoning: 'All-rounder. Works in any conditions.',
        });
      } else {
        recs.push({
          model: 'SP 760',
          series: 'SP',
          area: 760,
          score: 95,
          reasoning: 'Maximum carving performance. Fast and loose.',
        });
        recs.push({
          model: 'HPS 730',
          series: 'HPS',
          area: 730,
          score: 92,
          reasoning: 'Speed demon for bigger waves. Incredible glide.',
        });
      }
    } else if (formData.useCase === 'sup') {
      if (formData.skillLevel === 'beginner') {
        recs.push({
          model: 'PNG 1310',
          series: 'PNG',
          area: 1310,
          score: 95,
          reasoning: 'Pump and glide king. Easy to get up, pumps forever.',
        });
      } else {
        recs.push({
          model: 'PNG 1010',
          series: 'PNG',
          area: 1010,
          score: 95,
          reasoning: 'Sweet spot for SUP foiling. Pump + speed balance.',
        });
        recs.push({
          model: 'BSC 890',
          series: 'BSC',
          area: 890,
          score: 90,
          reasoning: 'Versatile performer. Great in varied conditions.',
        });
      }
    } else if (formData.useCase === 'downwind') {
      recs.push({
        model: 'ART 1099',
        series: 'ART',
        area: 1099,
        score: 95,
        reasoning: 'Ultimate downwind foil. Glide for days, connects bumps effortlessly.',
      });
      recs.push({
        model: 'HPS 1080',
        series: 'HPS',
        area: 1080,
        score: 92,
        reasoning: 'Fast downwind machine. More accessible than ART.',
      });
    } else if (formData.useCase === 'pump') {
      recs.push({
        model: 'PNG 1310',
        series: 'PNG',
        area: 1310,
        score: 95,
        reasoning: 'THE dock starting foil. Endless pump efficiency.',
      });
      recs.push({
        model: 'PNG 1010',
        series: 'PNG',
        area: 1010,
        score: 90,
        reasoning: 'Smaller PNG for more speed once up. Still pumps great.',
      });
    }

    // Adjust for weight
    if (weight < 150) {
      recs.forEach(rec => {
        if (rec.area > 1000) rec.score -= 5;
      });
    } else if (weight > 200) {
      recs.forEach(rec => {
        if (rec.area < 800) rec.score -= 10;
        if (rec.area > 1000) rec.score += 5;
      });
    }

    // Sort by score
    recs.sort((a, b) => b.score - a.score);
    setRecommendations(recs.slice(0, 3));
    setStep(4);
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      weight: '',
      skillLevel: '',
      useCase: '',
      conditions: '',
      style: '',
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
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
                    { value: 'prone', label: 'Prone Surf' },
                    { value: 'sup', label: 'SUP Foiling' },
                    { value: 'downwind', label: 'Downwind' },
                    { value: 'pump', label: 'Dock Start / Pump' },
                    { value: 'kite', label: 'Kite Foiling' },
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.useCase}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Style & Conditions */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Riding style preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['speed', 'carving', 'balanced'].map(style => (
                    <button
                      key={style}
                      onClick={() => handleChange('style', style)}
                      className={`
                        py-3 px-4 rounded-lg font-semibold transition
                        ${formData.style === style
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Typical conditions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['light', 'medium', 'strong', 'variable'].map(cond => (
                    <button
                      key={cond}
                      onClick={() => handleChange('conditions', cond)}
                      className={`
                        py-3 px-4 rounded-lg font-semibold transition
                        ${formData.conditions === cond
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {cond.charAt(0).toUpperCase() + cond.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
                >
                  ← Back
                </button>
                <button
                  onClick={generateRecommendations}
                  disabled={!formData.style || !formData.conditions}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Get Recommendations →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Your Perfect Foils
                </h2>
                <p className="text-gray-600">
                  Based on {formData.weight}lbs • {formData.skillLevel} • {formData.useCase}
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-red-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs font-bold text-red-600 mb-1">
                          #{index + 1} RECOMMENDATION
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">
                          {rec.series} {rec.area}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-red-600">
                          {rec.score}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{rec.reasoning}</p>
                    <a
                      href={`https://axisfoils.com/search?q=${rec.model.replace(' ', '+')}`}
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
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition"
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
