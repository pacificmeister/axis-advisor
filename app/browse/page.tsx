'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface FoilSpecs {
  name: string;
  product_type: string;
  area: number;
  series: string;
  aspectRatio?: number;
  wingspan?: number;
}

interface Foil {
  id: number;
  handle: string;
  title: string;
  description: string;
  image: string;
  price: string;
  available: boolean;
  url: string;
  specs: FoilSpecs;
  tags: string[];
}

interface SeriesGroup {
  name: string;
  foils: Foil[];
  isLegacy: boolean;
}

export default function BrowsePage() {
  const [seriesGroups, setSeriesGroups] = useState<SeriesGroup[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const foils = data.collections['front-wings'].products;
        
        // Define current vs legacy series
        const currentSeries = ['Spitfire', 'ART v2', 'Fireball', 'PNG', 'Surge', 'Tempo'];
        const legacySeries = ['ART', 'BSC', 'HPS', 'SP'];
        
        // Group by series
        const grouped: { [key: string]: Foil[] } = {};
        foils.forEach((foil: Foil) => {
          const series = foil.specs.series || 'Other';
          if (!grouped[series]) grouped[series] = [];
          grouped[series].push(foil);
        });

        // Sort foils within each series by area (descending)
        Object.keys(grouped).forEach(series => {
          grouped[series].sort((a, b) => b.specs.area - a.specs.area);
        });

        // Create series groups with legacy flag
        const groups: SeriesGroup[] = Object.keys(grouped).map(series => ({
          name: series,
          foils: grouped[series],
          isLegacy: legacySeries.includes(series),
        }));

        // Sort: current series first (alphabetically), then legacy series (alphabetically)
        groups.sort((a, b) => {
          if (a.isLegacy !== b.isLegacy) {
            return a.isLegacy ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        });

        setSeriesGroups(groups);
        
        // Auto-expand first series
        if (groups.length > 0) {
          setExpandedSeries(groups[0].name);
        }
      });
  }, []);

  const toggleSeries = (seriesName: string) => {
    setExpandedSeries(expandedSeries === seriesName ? null : seriesName);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Browse by Series
          </h1>
          <p className="text-lg text-gray-600">
            Explore all AXIS front wings organized by family
          </p>
        </div>

        <div className="space-y-4">
          {seriesGroups.map(group => (
            <div
              key={group.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Series Header */}
              <button
                onClick={() => toggleSeries(group.name)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-gray-900">
                    {group.name}
                  </h2>
                  {group.isLegacy && (
                    <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">
                      LEGACY
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {group.foils.length} foils
                  </span>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    expandedSeries === group.name ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Series Foils */}
              {expandedSeries === group.name && (
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {group.foils.map(foil => (
                      <div
                        key={foil.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-red-600 transition"
                      >
                        {/* Foil Image */}
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={foil.image}
                            alt={foil.title}
                            className="w-full h-full object-contain p-4"
                          />
                          {!foil.available && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                              OUT OF STOCK
                            </div>
                          )}
                        </div>

                        {/* Foil Info */}
                        <div className="p-4">
                          <h3 className="text-xl font-black text-gray-900 mb-2">
                            {foil.specs.series} {foil.specs.area}
                          </h3>
                          
                          <div className="space-y-1 mb-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Surface Area:</span>
                              <span className="font-semibold">{foil.specs.area} cm²</span>
                            </div>
                            {foil.specs.aspectRatio && (
                              <div className="flex justify-between">
                                <span>Aspect Ratio:</span>
                                <span className="font-semibold">{foil.specs.aspectRatio}</span>
                              </div>
                            )}
                            {foil.specs.wingspan && (
                              <div className="flex justify-between">
                                <span>Wingspan:</span>
                                <span className="font-semibold">{foil.specs.wingspan} mm</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-black text-red-600">
                              ${foil.price}
                            </div>
                            <a
                              href={foil.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                            >
                              View →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
