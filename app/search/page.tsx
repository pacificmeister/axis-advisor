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

export default function SearchPage() {
  const [allFoils, setAllFoils] = useState<Foil[]>([]);
  const [filteredFoils, setFilteredFoils] = useState<Foil[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    series: [] as string[],
    areaMin: 0,
    areaMax: 10000,
    aspectRatioMin: 0,
    aspectRatioMax: 20,
    wingspanMin: 0,
    wingspanMax: 2000,
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

      // Aspect Ratio filter - only apply if user changed from defaults (0-20)
      const hasArFilter = filters.aspectRatioMin > 0 || filters.aspectRatioMax < 20;
      if (hasArFilter) {
        // If filter is active, require the foil to have AR data AND match range
        if (!foil.specs.aspectRatio || 
            foil.specs.aspectRatio < filters.aspectRatioMin || 
            foil.specs.aspectRatio > filters.aspectRatioMax) {
          return false;
        }
      }

      // Wingspan filter - only apply if user changed from defaults (0-2000)
      const hasWingspanFilter = filters.wingspanMin > 0 || filters.wingspanMax < 2000;
      if (hasWingspanFilter) {
        if (!foil.specs.wingspan || 
            foil.specs.wingspan < filters.wingspanMin || 
            foil.specs.wingspan > filters.wingspanMax) {
          return false;
        }
      }

      // Volume filter - only apply if user changed from defaults (0-5000)
      const hasVolumeFilter = filters.volumeMin > 0 || filters.volumeMax < 5000;
      if (hasVolumeFilter) {
        if (!foil.specs.volume || 
            foil.specs.volume < filters.volumeMin || 
            foil.specs.volume > filters.volumeMax) {
          return false;
        }
      }

      // Chord filter - only apply if user changed from defaults (0-500)
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

              {/* Note about missing specs */}
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> AR, wingspan, volume, and chord filters coming soon! 
                  Currently extracting these specs from AXIS product pages.
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFoils.map(foil => (
                  <div
                    key={foil.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-red-600 transition"
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
                        {foil.specs.volume && (
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span className="font-semibold">{foil.specs.volume} cm³</span>
                          </div>
                        )}
                        {foil.specs.chord && (
                          <div className="flex justify-between">
                            <span>Chord:</span>
                            <span className="font-semibold">{foil.specs.chord} mm</span>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
