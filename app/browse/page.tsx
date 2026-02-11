'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';

interface SeriesInfo {
  name: string;
  displayName: string;
  category: 'current' | 'legacy' | 'rear' | 'fuselage' | 'mast';
  description: string;
  foilCount?: number;
  image?: string;
}

export default function BrowsePage() {
  const [foilData, setFoilData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const foils = data.collections['front-wings'].products;
        setFoilData(foils);
      });
  }, []);

  // Define series with order and descriptions
  const seriesDatabase: SeriesInfo[] = [
    // CURRENT / NEWER FRONT WINGS (newest to oldest)
    {
      name: 'Surge',
      displayName: 'Surge',
      category: 'current',
      description: 'High-performance wings for speed and efficiency',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/Surge-Complete-table.jpg'
    },
    {
      name: 'Tempo',
      displayName: 'Tempo',
      category: 'current',
      description: 'All-around performance for versatile riding',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/Tempo-Complete-table.jpg'
    },
    {
      name: 'ART v2',
      displayName: 'ART v2',
      category: 'current',
      description: 'Next-gen high-aspect with improved stability',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/ARTv2-table_665cd809-d9eb-4a81-9d87-c1e5171d06fd.jpg'
    },
    {
      name: 'Fireball',
      displayName: 'Fireball',
      category: 'current',
      description: 'Speed demon for strong wind and waves',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/Fireball-Complete-table.jpg'
    },
    {
      name: 'PNG',
      displayName: 'PNG v2',
      category: 'current',
      description: 'Pump and glide king for dock starts',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/PNG-Complete-table.jpg'
    },
    {
      name: 'Spitfire',
      displayName: 'Spitfire',
      category: 'current',
      description: 'Freestyle specialist for aggressive riding',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/Family---table_1024x1024.png'
    },

    // LEGACY FRONT WINGS
    {
      name: 'ART',
      displayName: 'ART (Legacy)',
      category: 'legacy',
      description: 'Original high-aspect research series',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/ART_Front-wing-tables_bb05daa3-372e-489e-9d0a-4ca4defc055c_2048x2048.jpg'
    },
    {
      name: 'BSC',
      displayName: 'BSC',
      category: 'legacy',
      description: 'Beginner Series - forgiving and stable',
    },
    {
      name: 'HPS',
      displayName: 'HPS',
      category: 'legacy',
      description: 'High Performance Series - speed focused',
    },
    {
      name: 'SP',
      displayName: 'SP',
      category: 'legacy',
      description: 'Surf Performance - carving specialist',
    },

    // REAR WINGS
    {
      name: 'Skinny Link',
      displayName: 'Skinny Link',
      category: 'rear',
      description: 'Modular titanium link rear wing system',
    },
    {
      name: 'Surf Skinny',
      displayName: 'Surf Skinny',
      category: 'rear',
      description: 'Surf-specific skinny rear wings',
    },
    {
      name: 'Skinny',
      displayName: 'Skinny',
      category: 'rear',
      description: 'High aspect rear wings for speed',
    },
    {
      name: 'Progressive',
      displayName: 'Progressive',
      category: 'rear',
      description: 'Balanced all-around rear wings',
    },
    {
      name: 'Speed',
      displayName: 'Speed',
      category: 'rear',
      description: 'Maximum speed rear stabilizers',
    },
    {
      name: 'Freeride',
      displayName: 'Freeride',
      category: 'rear',
      description: 'Stable freeride rear wings',
    },
    {
      name: 'Pump',
      displayName: 'Pump',
      category: 'rear',
      description: 'Optimized for pumping efficiency',
    },

    // FUSELAGES
    {
      name: 'Ti Link',
      displayName: 'Ti Link',
      category: 'fuselage',
      description: 'Titanium modular fuselage system',
    },
    {
      name: 'Black Advance+ FATTY',
      displayName: 'Black Advance+ FATTY',
      category: 'fuselage',
      description: 'Heavy-duty thick fuselage',
    },
    {
      name: 'Black Advance+',
      displayName: 'Black Advance+',
      category: 'fuselage',
      description: 'Premium carbon fuselage',
    },
    {
      name: 'Black Advance 20',
      displayName: 'Black Advance 20',
      category: 'fuselage',
      description: '20-inch fuselage length',
    },
    {
      name: 'Red Advance',
      displayName: 'Red Advance',
      category: 'fuselage',
      description: 'Mid-tier carbon fuselage',
    },
    {
      name: 'Red',
      displayName: 'Red',
      category: 'fuselage',
      description: 'Standard aluminum fuselage',
    },

    // MASTS
    {
      name: 'Carbon Integrated Foil Drive',
      displayName: 'Carbon Integrated Foil Drive',
      category: 'mast',
      description: 'Integrated carbon mast for Foil Drive system',
    },
    {
      name: 'PRO Ultra High Modulus Carbon',
      displayName: 'PRO Ultra High Modulus Carbon',
      category: 'mast',
      description: 'Ultimate performance carbon mast',
    },
    {
      name: 'Power Carbon High Modulus',
      displayName: 'Power Carbon High Modulus',
      category: 'mast',
      description: 'Premium high-modulus carbon mast',
    },
    {
      name: 'Power Carbon',
      displayName: 'Power Carbon',
      category: 'mast',
      description: 'Standard carbon performance mast',
    },
    {
      name: 'Power Carbon FATTY',
      displayName: 'Power Carbon FATTY',
      category: 'mast',
      description: 'Thick carbon mast for heavy riders',
    },
    {
      name: '19mm Aluminium',
      displayName: '19mm Aluminium',
      category: 'mast',
      description: 'Durable aluminum mast',
    },
  ];

  // Count foils per series from actual data
  const getSeriesCount = (seriesName: string) => {
    return foilData.filter(f => f.specs.series === seriesName).length;
  };

  const currentSeries = seriesDatabase.filter(s => s.category === 'current');
  const legacySeries = seriesDatabase.filter(s => s.category === 'legacy');
  const rearSeries = seriesDatabase.filter(s => s.category === 'rear');
  const fuselageSeries = seriesDatabase.filter(s => s.category === 'fuselage');
  const mastSeries = seriesDatabase.filter(s => s.category === 'mast');

  const SeriesCard = ({ series }: { series: SeriesInfo }) => {
    const count = getSeriesCount(series.name);
    const hasData = count > 0;

    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-red-600 hover:shadow-lg transition group">
        {series.image && (
          <div className="aspect-video bg-gray-50 relative overflow-hidden">
            <img
              src={series.image}
              alt={series.displayName}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-black text-gray-900">
              {series.displayName}
            </h3>
            {hasData && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                {count} foils
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {series.description}
          </p>

          {hasData ? (
            <Link
              href={`/series/${series.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition text-sm"
            >
              View Models →
            </Link>
          ) : (
            <span className="inline-block bg-gray-200 text-gray-500 font-bold py-2 px-6 rounded-lg text-sm cursor-not-allowed">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Browse AXIS Product Line
          </h1>
          <p className="text-lg text-gray-600">
            Explore by series - from newest innovations to proven classics
          </p>
        </div>

        {/* CURRENT FRONT WINGS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-black text-gray-900">
              Current Front Wings
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              NEWEST
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSeries.map(series => (
              <SeriesCard key={series.name} series={series} />
            ))}
          </div>
        </section>

        {/* LEGACY FRONT WINGS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-black text-gray-900">
              Legacy Front Wings
            </h2>
            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
              PROVEN
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legacySeries.map(series => (
              <SeriesCard key={series.name} series={series} />
            ))}
          </div>
        </section>

        {/* REAR WINGS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Rear Wings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rearSeries.map(series => (
              <SeriesCard key={series.name} series={series} />
            ))}
          </div>
        </section>

        {/* FUSELAGES */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Fuselages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fuselageSeries.map(series => (
              <SeriesCard key={series.name} series={series} />
            ))}
          </div>
        </section>

        {/* MASTS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Masts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mastSeries.map(series => (
              <SeriesCard key={series.name} series={series} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
