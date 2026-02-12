'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Link from 'next/link';

interface Foil {
  id: number;
  title: string;
  image: string;
  price: string;
  available: boolean;
  url: string;
  specs: {
    name: string;
    area: number;
    series: string;
    aspectRatio?: number;
    wingspan?: number;
  };
}

export default function SeriesPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [foils, setFoils] = useState<Foil[]>([]);
  const [seriesName, setSeriesName] = useState('');

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const allFoils = data.collections['front-wings'].products;
        
        // Map slug back to series name
        const slugToSeries: { [key: string]: string } = {
          'surge': 'Surge',
          'tempo': 'Tempo',
          'art-v2': 'ART v2',
          'fireball': 'Fireball',
          'spitfire': 'Spitfire',
          'png': 'PNG',
          'art': 'ART',
          'bsc': 'BSC',
          'hps': 'HPS',
          'sp': 'SP',
        };

        const series = slugToSeries[slug] || '';
        setSeriesName(series);

        // Filter foils by series
        const filtered = allFoils.filter((f: Foil) => f.specs.series === series);
        
        // Sort by area (descending)
        filtered.sort((a: Foil, b: Foil) => b.specs.area - a.specs.area);
        
        setFoils(filtered);
      });
  }, [slug]);

  if (!seriesName) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/browse" className="text-red-600 hover:text-red-700 font-semibold text-sm">
            ← Back to Browse
          </Link>
        </div>

        {/* Series Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {seriesName} Series
          </h1>
          <p className="text-lg text-gray-600">
            {foils.length} models available
          </p>
        </div>

        {foils.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No foils found in this series</p>
            <Link
              href="/browse"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Browse All Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foils.map(foil => (
              <div
                key={foil.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-red-600 hover:shadow-lg transition"
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
                    {foil.title}
                  </h3>
                  
                  <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Surface Area:</span>
                      <span className="font-semibold">{foil.specs.area} cm²</span>
                    </div>
                    {foil.specs.aspectRatio && (
                      <div className="flex justify-between">
                        <span>Aspect Ratio:</span>
                        <span className="font-semibold">{foil.specs.aspectRatio.toFixed(2)}</span>
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
        )}
      </main>
    </div>
  );
}
