'use client';

import { useState, useEffect } from 'react';
import FoilComparison from './components/FoilComparison';
import FoilSelector from './components/FoilSelector';
import Header from './components/Header';
import SpecFilters, { FilterState } from '../src/components/SpecFilters';

interface Product {
  id: number;
  handle?: string;
  title: string;
  description?: string;
  image?: string;
  price?: string;
  retailPrice?: number;
  specs: {
    name: string;
    product_type: string;
    area?: number;
    series?: string;
    aspectRatio?: number;
    surfaceArea?: number;
    chord?: number;
  };
}

interface AxisData {
  meta: {
    scraped_at: string;
    source: string;
  };
  collections: {
    'front-wings': {
      products: Product[];
    };
  };
}

export default function Home() {
  const [data, setData] = useState<AxisData | null>(null);
  const [selectedFoils, setSelectedFoils] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'select' | 'compare'>('select');
  const [filters, setFilters] = useState<FilterState | null>(null);

  useEffect(() => {
    // Load the data
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const allFrontWings = data?.collections['front-wings']?.products || [];
  
  // Apply filters
  const frontWings = allFrontWings.filter(foil => {
    if (!filters) return true;
    
    const specs = foil.specs;
    const price = parseFloat(foil.price || '0');
    
    // Filter by series if any selected
    if (filters.series.length > 0 && !filters.series.includes(specs.series || '')) {
      return false;
    }
    
    // Filter by aspect ratio
    if (specs.aspectRatio) {
      if (specs.aspectRatio < filters.aspectRatioMin || specs.aspectRatio > filters.aspectRatioMax) {
        return false;
      }
    }
    
    // Filter by surface area
    if (specs.surfaceArea) {
      if (specs.surfaceArea < filters.surfaceAreaMin || specs.surfaceArea > filters.surfaceAreaMax) {
        return false;
      }
    }
    
    // Filter by chord
    if (specs.chord) {
      if (specs.chord < filters.chordMin || specs.chord > filters.chordMax) {
        return false;
      }
    }
    
    // Filter by price
    if (price > 0) {
      if (price < filters.priceMin || price > filters.priceMax) {
        return false;
      }
    }
    
    return true;
  });

  const handleSelectFoil = (foil: Product) => {
    if (selectedFoils.find(f => f.id === foil.id)) {
      // Deselect
      setSelectedFoils(selectedFoils.filter(f => f.id !== foil.id));
    } else if (selectedFoils.length < 4) {
      // Select (max 4)
      setSelectedFoils([...selectedFoils, foil]);
    }
  };

  const handleCompare = () => {
    if (selectedFoils.length >= 2) {
      setViewMode('compare');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'select' ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-4">
                Compare AXIS Foils
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Select 2-4 front wings to compare side-by-side
              </p>
            </div>
            
            {/* Spec Filters */}
            <SpecFilters
              products={allFrontWings}
              onFilterChange={setFilters}
            />
            
            <div className="mb-8">
              {selectedFoils.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Selected: {selectedFoils.length}/4
                    </h3>
                    {selectedFoils.length >= 2 && (
                      <button
                        onClick={handleCompare}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
                      >
                        Compare Now →
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedFoils.map(foil => (
                      <div
                        key={foil.id}
                        className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2"
                      >
                        <span className="font-semibold text-gray-900">
                          {foil.specs.series} {foil.specs.area}
                        </span>
                        <button
                          onClick={() => handleSelectFoil(foil)}
                          className="text-gray-500 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <FoilSelector
              foils={frontWings}
              selectedFoils={selectedFoils}
              onSelectFoil={handleSelectFoil}
            />
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => setViewMode('select')}
                className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2"
              >
                ← Back to Selection
              </button>
            </div>
            
            <FoilComparison foils={selectedFoils} />
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <img 
              src="/logos/axis-logo-red-bg.jpg" 
              alt="AXIS Foils" 
              className="h-12 w-auto rounded"
            />
            <span className="text-2xl font-bold">ADVISOR</span>
          </div>
          <p className="text-gray-400 text-sm">
            Official comparison tool • Data from axisfoils.com
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <a href="https://axisfoils.com" className="hover:text-white transition">
              Visit AXIS Foils →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
