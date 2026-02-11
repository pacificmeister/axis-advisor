'use client';

import { useState, useEffect } from 'react';
import { Range } from 'react-range';

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
  const allSeries = Array.from(new Set(products.map(p => p.specs.series))).sort();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

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
            Aspect Ratio: {filters.aspectRatioMin.toFixed(1)} - {filters.aspectRatioMax.toFixed(1)}
          </label>
          <Range
            step={0.1}
            min={ranges.ar.min}
            max={ranges.ar.max}
            values={[filters.aspectRatioMin, filters.aspectRatioMax]}
            onChange={(values) => setFilters(prev => ({
              ...prev,
              aspectRatioMin: values[0],
              aspectRatioMax: values[1]
            }))}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ddd',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '6px',
                    backgroundColor: '#dc2626',
                    borderRadius: '3px',
                    left: `${((filters.aspectRatioMin - ranges.ar.min) / (ranges.ar.max - ranges.ar.min)) * 100}%`,
                    right: `${100 - ((filters.aspectRatioMax - ranges.ar.min) / (ranges.ar.max - ranges.ar.min)) * 100}%`
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#374151',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            )}
          />
        </div>

        {/* Surface Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surface Area (cm²): {filters.surfaceAreaMin} - {filters.surfaceAreaMax}
          </label>
          <Range
            step={50}
            min={ranges.area.min}
            max={ranges.area.max}
            values={[filters.surfaceAreaMin, filters.surfaceAreaMax]}
            onChange={(values) => setFilters(prev => ({
              ...prev,
              surfaceAreaMin: values[0],
              surfaceAreaMax: values[1]
            }))}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ddd',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '6px',
                    backgroundColor: '#374151',
                    borderRadius: '3px',
                    left: `${((filters.surfaceAreaMin - ranges.area.min) / (ranges.area.max - ranges.area.min)) * 100}%`,
                    right: `${100 - ((filters.surfaceAreaMax - ranges.area.min) / (ranges.area.max - ranges.area.min)) * 100}%`
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#374151',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            )}
          />
        </div>

        {/* Chord */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chord (mm): {filters.chordMin} - {filters.chordMax}
          </label>
          <Range
            step={5}
            min={ranges.chord.min}
            max={ranges.chord.max}
            values={[filters.chordMin, filters.chordMax]}
            onChange={(values) => setFilters(prev => ({
              ...prev,
              chordMin: values[0],
              chordMax: values[1]
            }))}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ddd',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '6px',
                    backgroundColor: '#374151',
                    borderRadius: '3px',
                    left: `${((filters.chordMin - ranges.chord.min) / (ranges.chord.max - ranges.chord.min)) * 100}%`,
                    right: `${100 - ((filters.chordMax - ranges.chord.min) / (ranges.chord.max - ranges.chord.min)) * 100}%`
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#374151',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            )}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (USD): ${filters.priceMin} - ${filters.priceMax}
          </label>
          <Range
            step={50}
            min={ranges.price.min}
            max={ranges.price.max}
            values={[filters.priceMin, filters.priceMax]}
            onChange={(values) => setFilters(prev => ({
              ...prev,
              priceMin: values[0],
              priceMax: values[1]
            }))}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ddd',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '6px',
                    backgroundColor: '#374151',
                    borderRadius: '3px',
                    left: `${((filters.priceMin - ranges.price.min) / (ranges.price.max - ranges.price.min)) * 100}%`,
                    right: `${100 - ((filters.priceMax - ranges.price.min) / (ranges.price.max - ranges.price.min)) * 100}%`
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#374151',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            )}
          />
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
