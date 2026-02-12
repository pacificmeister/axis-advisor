'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import RadarChart from '../components/RadarChart';

interface Product {
  id: number;
  handle?: string;
  title: string;
  description?: string;
  image?: string;
  price?: string;
  specs: {
    name: string;
    product_type: string;
    area?: number;
    series?: string;
    aspectRatio?: number;
    wingspan?: number;
    volume?: number;
    modelNumber?: number;
  };
}

interface FBPost {
  text: string;
  foils_mentioned: string[];
  rider_weight: number | null;
  use_case: string | null;
}

// Generate AI-style analysis for a foil
function generateAnalysis(foil: Product, isReference: boolean): string {
  const series = foil.specs.series || '';
  const area = foil.specs.area || 0;
  const ar = foil.specs.aspectRatio || 0;
  
  const analyses: Record<string, string> = {
    'Surge': `The ${series} ${area} is a dedicated wave weapon designed for intuitive handling. It excels at aggressive carving and breaching wingtips without stalling, making it the top choice for riders who want to shred the pocket. It feels stable yet incredibly reactive, offering a confidence-inspiring platform for prone surfing or wave-focused winging where turning is the priority.`,
    'ART v2': `The ${series} ${area} is an efficiency monster engineered for speed and glide. It rewards an active rider with the ability to connect endless bumps and pump effortlessly between swells. While it turns surprisingly well for its span, its true nature is high-speed connection and downwind travel, requiring higher takeoff speeds than more surf-oriented designs.`,
    'ART': `The ${series} ${area} is the legendary high-aspect glide machine that defined a generation of performance foiling. Known for its efficient pump and ability to maintain flight with minimal input, it excels at connecting swells and downwind runs while still offering responsive turning for its aspect ratio.`,
    'Fireball': `The ${series} ${area} is a high-aspect performer built for speed without sacrificing maneuverability. With an AR of ${ar.toFixed(1)}, it offers exceptional glide efficiency while remaining playful in the turn. Perfect for riders seeking the ultimate balance of speed, pump, and carving performance.`,
    'Tempo': `The ${series} ${area} represents the next generation of ultra-high-aspect design. Built with Ti-Link technology for maximum stiffness, it delivers unparalleled glide and pump efficiency. Don't let the low surface area scare you - it's surprisingly accessible while offering advanced riders a new dimension of performance.`,
    'Spitfire': `The ${series} ${area} is a race-proven speed machine designed for upwind performance and raw velocity. Its high-aspect design cuts through the water with minimal drag, rewarding skilled riders with exceptional efficiency. Best suited for advanced riders seeking maximum performance in competitive conditions.`,
    'PNG V2': `The ${series} ${area} V2 is the latest evolution of the legendary PNG series. Refined for improved pump and glide characteristics, it excels at dock starts, downwind runs, and connecting bumps over long distances. The high-aspect design demands good technique but rewards with unmatched efficiency.`,
    'PNG': `The ${series} ${area} is a high-aspect workhorse designed for pump foiling and downwind adventures. Its efficient profile excels at maintaining flight with minimal energy input, making it the go-to choice for dock starts and bump connection. A classic design that continues to impress.`,
    'BSC': `The ${series} ${area} is a forgiving all-rounder that builds confidence. Its moderate aspect ratio provides stability during learning while still offering enough performance to grow into. An excellent choice for beginners or riders seeking a predictable, easy-to-ride platform.`,
    'HPS': `The ${series} ${area} delivers high-performance surf characteristics in a refined package. Designed for riders who prioritize turning and wave-riding feel, it offers quick response and tight carving ability while maintaining stability in critical sections.`,
    'SP': `The ${series} ${area} is a compact performer optimized for smaller conditions and tighter turns. Its lower aspect ratio provides instant response and forgiveness, making it ideal for prone surfing or riders seeking maximum maneuverability.`,
  };
  
  return analyses[series] || `The ${series} ${area} offers ${ar > 10 ? 'high-aspect efficiency and glide' : ar > 8 ? 'balanced performance across disciplines' : 'forgiving handling and tight turning'}. With ${area}cm² of surface area, it's suited for ${area > 1100 ? 'heavier riders or light-wind conditions' : area > 900 ? 'medium-weight riders in average conditions' : 'lighter riders or stronger wind'}.`;
}

// Match FB feedback to a foil
function matchFBFeedback(fbData: FBPost[], foilName: string): string[] {
  const feedback: string[] = [];
  const normalized = foilName.toUpperCase().replace(/\s+/g, ' ');
  const areaMatch = foilName.match(/\d{3,4}/);
  const area = areaMatch ? areaMatch[0] : null;

  for (const post of fbData) {
    // Check if this post mentions this foil by name or just area
    const mentioned = post.foils_mentioned.some(f => 
      normalized.includes(f.toUpperCase().replace(/\s+/g, ' '))
    );
    
    // Also check for bare area mentions like "the 950" or "1010"
    const areaInText = area && post.text.match(new RegExp(`\\b${area}\\b`));

    if ((mentioned || areaInText) && post.text.length > 50) {
      // Extract the actual content, skipping author name and metadata
      const lines = post.text.split('\n').filter((line: string) => {
        const l = line.trim().toLowerCase();
        return line.length > 20 && 
          !l.includes('like') && 
          !l.includes('reply') && 
          !l.includes('top contributor') &&
          !l.includes('group expert') &&
          !l.includes('rising contributor') &&
          !l.match(/^\d+[dwmy]$/);
      });
      
      if (lines.length > 0) {
        const authorFull = post.text.split('\n')[0]?.trim() || 'Rider';
        // Extract just the name part (before : or ( which indicates metadata)
        const namePart = authorFull.split(/[:(]/)[0]?.trim() || 'Rider';
        // Convert name to initials for privacy (max 3 initials)
        const author = namePart.split(' ')
          .filter(w => w.length > 0 && /^[A-Za-z]/.test(w))
          .slice(0, 3)
          .map(w => w[0].toUpperCase())
          .join('') || 'R';
        const excerpt = lines[0].substring(0, 150);
        feedback.push(`${author}: ${excerpt}`);
      }
      
      if (feedback.length >= 2) break;
    }
  }

  return feedback;
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fbData, setFbData] = useState<FBPost[]>([]);
  const [primaryFoil, setPrimaryFoil] = useState<Product | null>(null);
  const [referenceFoil, setReferenceFoil] = useState<Product | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(r => r.json())
      .then(data => {
        const frontWings = data.collections['front-wings'].products;
        setProducts(frontWings);
      })
      .catch(err => console.error('Failed to load products:', err));

    fetch('/data/facebook-riders-feedback.json')
      .then(r => r.json())
      .then(data => setFbData(data.posts || []))
      .catch(err => console.warn('FB data not available:', err));
  }, []);

  const handleCompare = () => {
    if (primaryFoil && referenceFoil) {
      setShowComparison(true);
    }
  };

  const getRadarData = (foil: Product) => {
    const ar = foil.specs.aspectRatio || 9;
    const area = foil.specs.area || 1000;
    const series = foil.specs.series || '';
    
    // Series-specific performance profiles based on real-world characteristics
    // Each series has distinct DNA that AR alone doesn't capture
    const seriesProfiles: Record<string, { speed: number; pump: number; glide: number; turning: number }> = {
      'Tempo': { speed: 95, pump: 72, glide: 78, turning: 45 },      // Ultra-speed focused, Ti-Link stiffness
      'Fireball': { speed: 78, pump: 90, glide: 92, turning: 58 },   // Balanced high-AR, excellent pump/glide
      'Surge': { speed: 62, pump: 75, glide: 72, turning: 88 },      // Surf-oriented, more roll/turn feel
      'ART v2': { speed: 72, pump: 95, glide: 95, turning: 52 },     // Efficiency monster, pump/glide king
      'ART': { speed: 68, pump: 88, glide: 90, turning: 55 },        // Classic efficiency design
      'Spitfire': { speed: 55, pump: 58, glide: 52, turning: 95 },   // Low AR surf, tight turns
      'PNG V2': { speed: 65, pump: 85, glide: 82, turning: 60 },     // Pump foil specialist
      'PNG': { speed: 62, pump: 82, glide: 80, turning: 62 },        // Classic pump foil
      'BSC': { speed: 45, pump: 50, glide: 48, turning: 85 },        // Beginner friendly, forgiving
      'HPS': { speed: 58, pump: 60, glide: 55, turning: 90 },        // High-performance surf
    };
    
    const profile = seriesProfiles[series] || { speed: 60, pump: 60, glide: 60, turning: 60 };
    
    // Lift is primarily determined by area (more area = more lift)
    const lift = Math.min(100, Math.max(20, (area - 600) / 12 + 20));
    
    // Fine-tune based on AR within series (higher AR in series = slightly faster, less turning)
    const arBonus = (ar - 10) * 1.5; // Small adjustment based on AR
    
    return {
      speed: Math.min(100, Math.max(20, profile.speed + arBonus)),
      lift: lift,
      turning: Math.min(100, Math.max(20, profile.turning - arBonus)),
      pump: Math.min(100, Math.max(20, profile.pump)),
      glide: Math.min(100, Math.max(20, profile.glide)),
    };
  };

  // Sort products by series and area for better UX
  const sortedProducts = [...products].sort((a, b) => {
    const seriesOrder = ['Tempo', 'Surge', 'ART v2', 'Fireball', 'Spitfire', 'PNG', 'ART', 'BSC', 'HPS', 'SP'];
    const aIdx = seriesOrder.indexOf(a.specs.series || '');
    const bIdx = seriesOrder.indexOf(b.specs.series || '');
    if (aIdx !== bIdx) return aIdx - bIdx;
    return (a.specs.area || 0) - (b.specs.area || 0);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Primary Foil Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Primary Foil Model
              </label>
              <select
                value={primaryFoil?.id || ''}
                onChange={e => {
                  const foil = products.find(p => p.id === parseInt(e.target.value));
                  setPrimaryFoil(foil || null);
                  setShowComparison(false);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-lg font-semibold"
              >
                <option value="">Select a foil...</option>
                {sortedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.specs.series} {p.specs.modelNumber || p.specs.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Foil Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Comparison Reference
              </label>
              <select
                value={referenceFoil?.id || ''}
                onChange={e => {
                  const foil = products.find(p => p.id === parseInt(e.target.value));
                  setReferenceFoil(foil || null);
                  setShowComparison(false);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none text-lg font-semibold"
              >
                <option value="">Select a foil...</option>
                {sortedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.specs.series} {p.specs.modelNumber || p.specs.area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compare Button */}
          <div className="text-center">
            <button
              onClick={handleCompare}
              disabled={!primaryFoil || !referenceFoil}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-full text-lg transition shadow-lg"
            >
              COMPARE NOW →
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {showComparison && primaryFoil && referenceFoil && (
          <>
            {/* Foil Comparison Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Foil Comparison</h2>
              </div>

              {/* Three-Column Layout: Primary | Radar | Reference */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Primary Foil */}
                <div className="text-center">
                  {/* Foil Silhouette */}
                  <div className="mb-6">
                    {primaryFoil.image ? (
                      <img 
                        src={primaryFoil.image} 
                        alt={primaryFoil.title}
                        className="w-48 h-32 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Big Specs */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-4xl font-black text-blue-600">
                        {primaryFoil.specs.aspectRatio?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Aspect Ratio
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-blue-600">
                        {primaryFoil.specs.wingspan || primaryFoil.specs.area}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Span (mm)
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-blue-600">
                        {primaryFoil.specs.area}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Area (cm²)
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-blue-600">
                        {primaryFoil.specs.volume || '—'}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Volume (cm³)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar Chart in Center */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs">
                    <RadarChart 
                      foils={[primaryFoil, referenceFoil]}
                      compact={true}
                    />
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-semibold">{primaryFoil.specs.series} {primaryFoil.specs.modelNumber || primaryFoil.specs.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-semibold">{referenceFoil.specs.series} {referenceFoil.specs.modelNumber || referenceFoil.specs.area}</span>
                    </div>
                  </div>
                </div>

                {/* Reference Foil */}
                <div className="text-center">
                  {/* Foil Silhouette */}
                  <div className="mb-6">
                    {referenceFoil.image ? (
                      <img 
                        src={referenceFoil.image} 
                        alt={referenceFoil.title}
                        className="w-48 h-32 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Big Specs */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-4xl font-black text-orange-500">
                        {referenceFoil.specs.aspectRatio?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Aspect Ratio
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-orange-500">
                        {referenceFoil.specs.wingspan || referenceFoil.specs.area}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Span (mm)
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-orange-500">
                        {referenceFoil.specs.area}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Area (cm²)
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-orange-500">
                        {referenceFoil.specs.volume || '—'}
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Volume (cm³)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Primary Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-black text-blue-600 mb-2">
                  {primaryFoil.specs.series} {primaryFoil.specs.modelNumber || primaryFoil.specs.area}
                </h3>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Analysis
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {generateAnalysis(primaryFoil, false)}
                </p>
                
                {/* FB Feedback */}
                {(() => {
                  const feedback = matchFBFeedback(fbData, `${primaryFoil.specs.series} ${primaryFoil.specs.modelNumber || primaryFoil.specs.area}`);
                  if (feedback.length === 0) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                        👥 Community Feedback
                      </h5>
                      {feedback.map((fb, i) => (
                        <p key={i} className="text-sm text-gray-600 italic mb-2">
                          "{fb}..."
                        </p>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Reference Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-black text-orange-500 mb-2">
                  {referenceFoil.specs.series} {referenceFoil.specs.modelNumber || referenceFoil.specs.area}
                </h3>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Analysis
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {generateAnalysis(referenceFoil, true)}
                </p>
                
                {/* FB Feedback */}
                {(() => {
                  const feedback = matchFBFeedback(fbData, `${referenceFoil.specs.series} ${referenceFoil.specs.modelNumber || referenceFoil.specs.area}`);
                  if (feedback.length === 0) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h5 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
                        👥 Community Feedback
                      </h5>
                      {feedback.map((fb, i) => (
                        <p key={i} className="text-sm text-gray-600 italic mb-2">
                          "{fb}..."
                        </p>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Quick Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500 font-semibold">Spec</th>
                      <th className="text-center py-2 text-blue-600 font-bold">{primaryFoil.specs.series} {primaryFoil.specs.modelNumber || primaryFoil.specs.area}</th>
                      <th className="text-center py-2 text-orange-500 font-bold">{referenceFoil.specs.series} {referenceFoil.specs.modelNumber || referenceFoil.specs.area}</th>
                      <th className="text-center py-2 text-gray-500 font-semibold">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 text-gray-600">Aspect Ratio</td>
                      <td className="py-3 text-center font-bold">{primaryFoil.specs.aspectRatio?.toFixed(2) || '—'}</td>
                      <td className="py-3 text-center font-bold">{referenceFoil.specs.aspectRatio?.toFixed(2) || '—'}</td>
                      <td className="py-3 text-center">
                        {primaryFoil.specs.aspectRatio && referenceFoil.specs.aspectRatio ? (
                          <span className={primaryFoil.specs.aspectRatio > referenceFoil.specs.aspectRatio ? 'text-green-600' : 'text-red-600'}>
                            {primaryFoil.specs.aspectRatio > referenceFoil.specs.aspectRatio ? '+' : ''}
                            {(primaryFoil.specs.aspectRatio - referenceFoil.specs.aspectRatio).toFixed(2)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 text-gray-600">Area (cm²)</td>
                      <td className="py-3 text-center font-bold">{primaryFoil.specs.area}</td>
                      <td className="py-3 text-center font-bold">{referenceFoil.specs.area}</td>
                      <td className="py-3 text-center">
                        {primaryFoil.specs.area && referenceFoil.specs.area ? (
                          <span className={primaryFoil.specs.area > referenceFoil.specs.area ? 'text-green-600' : 'text-red-600'}>
                            {primaryFoil.specs.area > referenceFoil.specs.area ? '+' : ''}
                            {primaryFoil.specs.area - referenceFoil.specs.area}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 text-gray-600">Price</td>
                      <td className="py-3 text-center font-bold">${primaryFoil.price || '—'}</td>
                      <td className="py-3 text-center font-bold">${referenceFoil.price || '—'}</td>
                      <td className="py-3 text-center">
                        {primaryFoil.price && referenceFoil.price ? (
                          <span className={parseFloat(primaryFoil.price) < parseFloat(referenceFoil.price) ? 'text-green-600' : 'text-red-600'}>
                            {parseFloat(primaryFoil.price) < parseFloat(referenceFoil.price) ? '-' : '+'}
                            ${Math.abs(parseFloat(primaryFoil.price) - parseFloat(referenceFoil.price)).toFixed(0)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="bg-red-600 text-white px-2 py-1 font-black text-xl">AXIS</span>
            <span className="ml-2 text-white font-bold text-xl">FOILS®</span>
          </div>
          <p className="text-gray-400 text-sm">
            Official comparison tool • Data from axisfoils.com
          </p>
        </div>
      </footer>
    </div>
  );
}
