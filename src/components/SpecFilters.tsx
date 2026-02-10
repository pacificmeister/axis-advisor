'use client';

import { useState, useEffect } from 'react';

interface SpecFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  products: any[];
}

export interface FilterState {
  aspectRatioMin: number;
  aspectRatioMax: number;
  surfaceAreaMin: number;
  surfaceAreaMax: number;
  chordMin: number;
  chordMax: number;
  priceMin: number;
  priceMax: number;
  series: string[];
}

export default function SpecFilters({ onFilterChange, products }: SpecFiltersProps) {
  // Calculate ranges from products
  const calculateRanges = () => {
    const productsWithSpecs = products.filter(p => p.specs?.aspectRatio);
    
    if (productsWithSpecs.length === 0) {
      return {
        ar: { min: 0, max: 20 },
        area: { min: 0, max: 2500 },
        chord: { min: 0, max: 200 },
        price: { min: 0, max: 2000 }
      };
    }

    const ars = productsWithSpecs.map(p => p.specs.aspectRatio);
    const areas = productsWithSpecs.map(p => p.specs.surfaceArea);
    const chords = productsWithSpecs.map(p => p.specs.chord || 0).filter(c => c > 0);
    const prices = productsWithSpecs.map(p => p.retailPrice || 0).filter(c => c > 0);

    return {
      ar: { min: Math.floor(Math.min(...ars)), max: Math.ceil(Math.max(...ars)) },
      area: { min: Math.floor(Math.min(...areas) / 100) * 100, max: Math.ceil(Math.max(...areas) / 100) * 100 },
      chord: { min: Math.floor(Math.min(...chords) / 10) * 10, max: Math.ceil(Math.max(...chords) / 10) * 10 },
      price: { min: Math.floor(Math.min(...prices) / 100) * 100, max: Math.ceil(Math.max(...prices) / 100) * 100 }
    };
  };

  const ranges = calculateRanges();
  
  const [filters, setFilters] = useState<FilterState>({
    aspectRatioMin: ranges.ar.min,
    aspectRatioMax: ranges.ar.max,
    surfaceAreaMin: ranges.area.min,
    surfaceAreaMax: ranges.area.max,
    chordMin: ranges.chord.min,
    chordMax: ranges.chord.max,
    priceMin: ranges.price.min,
    priceMax: ranges.price.max,
    series: []
  });

  // Get unique series
  const allSeries = [...new Set(products.map(p => p.specs.series))].sort();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleRangeChange = (field: keyof FilterState, value: number) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSeriesToggle = (series: string) => {
    setFilters(prev => ({
      ...prev,
      series: prev.series.includes(series)
        ? prev.series.filter(s => s !== series)
        : [...prev.series, series]
    }));
  };

  const handleReset = () => {
    setFilters({
      aspectRatioMin: ranges.ar.min,
      aspectRatioMax: ranges.ar.max,
      surfaceAreaMin: ranges.area.min,
      surfaceAreaMax: ranges.area.max,
      chordMin: ranges.chord.min,
      chordMax: ranges.chord.max,
      priceMin: ranges.price.min,
      priceMax: ranges.price.max,
      series: []
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Filter by Specs</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio: {filters.aspectRatioMin} - {filters.aspectRatioMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min={ranges.ar.min}
              max={ranges.ar.max}
              step={0.1}
              value={filters.aspectRatioMin}
              onChange={(e) => handleRangeChange('aspectRatioMin', parseFloat(e.target.value))}
              className="flex-1"
            />
            <input
              type="range"
              min={ranges.ar.min}
              max={ranges.ar.max}
              step={0.1}
              value={filters.aspectRatioMax}
              onChange={(e) => handleRangeChange('aspectRatioMax', parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        {/* Surface Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surface Area (cm²): {filters.surfaceAreaMin} - {filters.surfaceAreaMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min={ranges.area.min}
              max={ranges.area.max}
              step={50}
              value={filters.surfaceAreaMin}
              onChange={(e) => handleRangeChange('surfaceAreaMin', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="range"
              min={ranges.area.min}
              max={ranges.area.max}
              step={50}
              value={filters.surfaceAreaMax}
              onChange={(e) => handleRangeChange('surfaceAreaMax', parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        {/* Chord */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chord (mm): {filters.chordMin} - {filters.chordMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min={ranges.chord.min}
              max={ranges.chord.max}
              step={5}
              value={filters.chordMin}
              onChange={(e) => handleRangeChange('chordMin', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="range"
              min={ranges.chord.min}
              max={ranges.chord.max}
              step={5}
              value={filters.chordMax}
              onChange={(e) => handleRangeChange('chordMax', parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (USD): ${filters.priceMin} - ${filters.priceMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min={ranges.price.min}
              max={ranges.price.max}
              step={50}
              value={filters.priceMin}
              onChange={(e) => handleRangeChange('priceMin', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="range"
              min={ranges.price.min}
              max={ranges.price.max}
              step={50}
              value={filters.priceMax}
              onChange={(e) => handleRangeChange('priceMax', parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Series Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Filter by Series:
        </label>
        <div className="flex flex-wrap gap-2">
          {allSeries.map(series => (
            <button
              key={series}
              onClick={() => handleSeriesToggle(series)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.series.length === 0 || filters.series.includes(series)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {series}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
