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
  volume?: number;
  chord?: number;
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

interface FilterRanges {
  area: { min: number; max: number };
  aspectRatio: { min: number; max: number };
  wingspan: { min: number; max: number };
  volume: { min: number; max: number };
  chord: { min: number; max: number };
  price: { min: number; max: number };
}

// Series categorization matching browse page
const SERIES_ORDER = {
  current: ['Surge', 'Tempo', 'ART v2', 'Fireball', 'PNG v2', 'Spitfire'],
  legacy: ['ART', 'BSC', 'HPS', 'SP', 'PNG'],
};

const CATEGORY_LABELS: Record<string, { label: string; badge?: string; badgeColor?: string }> = {
  current: { label: 'Current Front Wings', badge: 'NEWEST', badgeColor: 'bg-green-100 text-green-700' },
  legacy: { label: 'Legacy Front Wings', badge: 'PROVEN', badgeColor: 'bg-gray-200 text-gray-600' },
};

export default function SearchPage() {
  const [allFoils, setAllFoils] = useState<Foil[]>([]);
  const [filteredFoils, setFilteredFoils] = useState<Foil[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    series: [] as string[],
    areaMin: 0,
    areaMax: 10000,
    aspectRatioMin: 4,
    aspectRatioMax: 21,
    wingspanMin: 600,
    wingspanMax: 1800,
    volumeMin: 0,
    volumeMax: 5000,
    chordMin: 0,
    chordMax: 500,
    priceMin: 0,
    priceMax: 2000,
  });

  const [ranges, setRanges] = useState<FilterRanges>({
    area: { min: 0, max: 10000 },
    aspectRatio: { min: 0, max: 20 },
    wingspan: { min: 0, max: 2000 },
    volume: { min: 0, max: 5000 },
    chord: { min: 0, max: 500 },
    price: { min: 0, max: 2000 },
  });

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const foils = data.collections['front-wings'].products;
        setAllFoils(foils);
        setFilteredFoils(foils);

        // Get unique series
        const series = Array.from(new Set(foils.map((f: Foil) => f.specs.series))).sort();
        setAvailableSeries(series as string[]);

        // Calculate actual ranges from data
        const newRanges = {
          area: {
            min: Math.floor(Math.min(...foils.map((f: Foil) => f.specs.area)) / 100) * 100,
            max: Math.ceil(Math.max(...foils.map((f: Foil) => f.specs.area)) / 100) * 100,
          },
          aspectRatio: {
            min: 0,
            max: 20,
          },
          wingspan: {
            min: 0,
            max: 2000,
          },
          volume: {
            min: 0,
            max: 5000,
          },
          chord: {
            min: 0,
            max: 500,
          },
          price: {
            min: Math.floor(Math.min(...foils.map((f: Foil) => parseFloat(f.price))) / 100) * 100,
            max: Math.ceil(Math.max(...foils.map((f: Foil) => parseFloat(f.price))) / 100) * 100,
          },
        };

        setRanges(newRanges);
        setFilters(prev => ({
          ...prev,
          areaMin: newRanges.area.min,
          areaMax: newRanges.area.max,
          priceMin: newRanges.price.min,
          priceMax: newRanges.price.max,
        }));
      });
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = allFoils.filter(foil => {
      // Series filter
      if (filters.series.length > 0 && !filters.series.includes(foil.specs.series)) {
        return false;
      }

      // Area filter
      if (foil.specs.area < filters.areaMin || foil.specs.area > filters.areaMax) {
        return false;
      }

      // Aspect Ratio filter - only apply if user changed from defaults (4-21)
      const hasArFilter = filters.aspectRatioMin > 4 || filters.aspectRatioMax < 21;
      if (hasArFilter && foil.specs.aspectRatio) {
        if (foil.specs.aspectRatio < filters.aspectRatioMin || 
            foil.specs.aspectRatio > filters.aspectRatioMax) {
          return false;
        }
      }

      // Wingspan filter - only apply if user changed from defaults (600-1800)
      const hasWingspanFilter = filters.wingspanMin > 600 || filters.wingspanMax < 1800;
      if (hasWingspanFilter && foil.specs.wingspan) {
        if (foil.specs.wingspan < filters.wingspanMin || 
            foil.specs.wingspan > filters.wingspanMax) {
          return false;
        }
      }

      // Volume filter
      const hasVolumeFilter = filters.volumeMin > 0 || filters.volumeMax < 5000;
      if (hasVolumeFilter) {
        if (!foil.specs.volume || 
            foil.specs.volume < filters.volumeMin || 
            foil.specs.volume > filters.volumeMax) {
          return false;
        }
      }

      // Chord filter
      const hasChordFilter = filters.chordMin > 0 || filters.chordMax < 500;
      if (hasChordFilter) {
        if (!foil.specs.chord || 
            foil.specs.chord < filters.chordMin || 
            foil.specs.chord > filters.chordMax) {
          return false;
        }
      }

      // Price filter
      const price = parseFloat(foil.price);
      if (price < filters.priceMin || price > filters.priceMax) {
        return false;
      }

      return true;
    });

    setFilteredFoils(filtered);
  }, [filters, allFoils]);

  const toggleSeries = (series: string) => {
    setFilters(prev => ({
      ...prev,
      series: prev.series.includes(series)
        ? prev.series.filter(s => s !== series)
        : [...prev.series, series],
    }));
  };

  const resetFilters = () => {
    setFilters({
      series: [],
      areaMin: ranges.area.min,
      areaMax: ranges.area.max,
      aspectRatioMin: ranges.aspectRatio.min,
      aspectRatioMax: ranges.aspectRatio.max,
      wingspanMin: ranges.wingspan.min,
      wingspanMax: ranges.wingspan.max,
      volumeMin: ranges.volume.min,
      volumeMax: ranges.volume.max,
      chordMin: ranges.chord.min,
      chordMax: ranges.chord.max,
      priceMin: ranges.price.min,
      priceMax: ranges.price.max,
    });
  };

  // Helper to get category for a series
  const getCategory = (series: string): 'current' | 'legacy' => {
    if (SERIES_ORDER.current.includes(series)) return 'current';
    return 'legacy';
  };

  // Group and sort foils by category and series
  const groupedFoils = () => {
    const groups: Record<string, Record<string, Foil[]>> = {
      current: {},
      legacy: {},
    };

    // Group by category then series
    filteredFoils.forEach(foil => {
      const category = getCategory(foil.specs.series);
      if (!groups[category][foil.specs.series]) {
        groups[category][foil.specs.series] = [];
      }
      groups[category][foil.specs.series].push(foil);
    });

    // Sort foils within each series by area
    Object.keys(groups).forEach(category => {
      Object.keys(groups[category]).forEach(series => {
        groups[category][series].sort((a, b) => a.specs.area - b.specs.area);
      });
    });

    return groups;
  };

  const grouped = groupedFoils();

  // Get ordered series for a category
  const getOrderedSeries = (category: 'current' | 'legacy') => {
    const seriesInCategory = Object.keys(grouped[category]);
    return SERIES_ORDER[category].filter(s => seriesInCategory.includes(s));
  };

  const FoilCard = ({ foil }: { foil: Foil }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-red-600 hover:shadow-md transition">
      {/* Foil Image */}
      <div className="aspect-video bg-gray-50 relative">
        <img
          src={foil.image}
          alt={foil.title}
          className="w-full h-full object-contain p-3"
        />
        {!foil.available && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            OUT OF STOCK
          </div>
        )}
      </div>

      {/* Foil Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {/* Extract model name from title - handles ART v2 correctly */}
          {foil.title.replace(/ Carbon.*| Ultra.*| -.*| Hydrofoil.*/i, '').replace('AXIS ', '')}
        </h3>
        
        <div className="space-y-1 mb-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Area:</span>
            <span className="font-medium">{foil.specs.area} cm²</span>
          </div>
          {foil.specs.aspectRatio && (
            <div className="flex justify-between">
              <span>AR:</span>
              <span className="font-medium">{foil.specs.aspectRatio.toFixed(2)}</span>
            </div>
          )}
          {foil.specs.wingspan && (
            <div className="flex justify-between">
              <span>Span:</span>
              <span className="font-medium">{foil.specs.wingspan} mm</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            ${foil.price}
          </span>
          <a
            href={foil.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            View →
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Search & Filter Foils
          </h1>
          <p className="text-lg text-gray-600">
            Filter by specs: AR, wingspan, surface area, and more
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Series Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Series</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSeries.map(series => (
                    <label key={series} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.series.includes(series)}
                        onChange={() => toggleSeries(series)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{series}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Surface Area Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Surface Area (cm²)
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={ranges.area.min}
                    max={ranges.area.max}
                    step={50}
                    value={filters.areaMin}
                    onChange={e => setFilters(prev => ({ ...prev, areaMin: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={ranges.area.min}
                    max={ranges.area.max}
                    step={50}
                    value={filters.areaMax}
                    onChange={e => setFilters(prev => ({ ...prev, areaMax: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{filters.areaMin}</span>
                    <span>{filters.areaMax}</span>
                  </div>
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Price ($)</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={ranges.price.min}
                    max={ranges.price.max}
                    step={50}
                    value={filters.priceMin}
                    onChange={e => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={ranges.price.min}
                    max={ranges.price.max}
                    step={50}
                    value={filters.priceMax}
                    onChange={e => setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>${filters.priceMin}</span>
                    <span>${filters.priceMax}</span>
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Aspect Ratio
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={4}
                    max={21}
                    step={0.5}
                    value={filters.aspectRatioMin}
                    onChange={e => setFilters(prev => ({ ...prev, aspectRatioMin: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={4}
                    max={21}
                    step={0.5}
                    value={filters.aspectRatioMax}
                    onChange={e => setFilters(prev => ({ ...prev, aspectRatioMax: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{filters.aspectRatioMin}</span>
                    <span>{filters.aspectRatioMax}</span>
                  </div>
                </div>
              </div>

              {/* Wingspan Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Wingspan (mm)
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={600}
                    max={1800}
                    step={50}
                    value={filters.wingspanMin}
                    onChange={e => setFilters(prev => ({ ...prev, wingspanMin: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={600}
                    max={1800}
                    step={50}
                    value={filters.wingspanMax}
                    onChange={e => setFilters(prev => ({ ...prev, wingspanMax: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{filters.wingspanMin}</span>
                    <span>{filters.wingspanMax}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredFoils.length}</span> of {allFoils.length} foils
              </div>
            </div>

            {filteredFoils.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">No foils match your filters</p>
                <button
                  onClick={resetFilters}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Current Front Wings */}
                {getOrderedSeries('current').length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-black text-gray-900">
                        {CATEGORY_LABELS.current.label}
                      </h2>
                      <span className={`px-2 py-1 ${CATEGORY_LABELS.current.badgeColor} text-xs font-bold rounded-full`}>
                        {CATEGORY_LABELS.current.badge}
                      </span>
                    </div>
                    
                    {getOrderedSeries('current').map(series => (
                      <div key={series} className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                          {series}
                          <span className="text-sm font-normal text-gray-500">
                            ({grouped.current[series].length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {grouped.current[series].map(foil => (
                            <FoilCard key={foil.id} foil={foil} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {/* Legacy Front Wings */}
                {getOrderedSeries('legacy').length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-black text-gray-900">
                        {CATEGORY_LABELS.legacy.label}
                      </h2>
                      <span className={`px-2 py-1 ${CATEGORY_LABELS.legacy.badgeColor} text-xs font-bold rounded-full`}>
                        {CATEGORY_LABELS.legacy.badge}
                      </span>
                    </div>
                    
                    {getOrderedSeries('legacy').map(series => (
                      <div key={series} className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                          {series}
                          <span className="text-sm font-normal text-gray-500">
                            ({grouped.legacy[series].length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {grouped.legacy[series].map(foil => (
                            <FoilCard key={foil.id} foil={foil} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
