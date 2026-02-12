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
  const [allData, setAllData] = useState<any>({});

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const foils = data.collections['front-wings'].products;
        setFoilData(foils);
        setAllData(data.collections);
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
      image: 'https://axisfoils.com/cdn/shop/files/Surge-family-Flat_6up_1296x.png?v=1763771333'
    },
    {
      name: 'Tempo',
      displayName: 'Tempo',
      category: 'current',
      description: 'All-around performance for versatile riding',
      image: 'https://axisfoils.com/cdn/shop/files/Tempofamily2_1296x.png?v=1759345835'
    },
    {
      name: 'ART v2',
      displayName: 'ART v2',
      category: 'current',
      description: 'Next-gen high-aspect with improved stability',
      image: 'https://axisfoils.com/cdn/shop/files/ARTV2_family-flat-5up_9d413ff4-e31d-41f3-9eb1-c275d615571e_1024x1024.jpg?v=1732312421'
    },
    {
      name: 'Fireball',
      displayName: 'Fireball',
      category: 'current',
      description: 'Speed demon for strong wind and waves',
      image: 'https://axisfoils.com/cdn/shop/files/Fireball_family_1500-_-1750_1296x.png?v=1759718992'
    },
    {
      name: 'PNG v2',
      displayName: 'PNG v2',
      category: 'current',
      description: 'Pump and glide king for dock starts',
      image: 'https://axisfoils.com/cdn/shop/files/PNGv2_family_top_1296x.jpg?v=1745321257'
    },
    {
      name: 'Spitfire',
      displayName: 'Spitfire',
      category: 'current',
      description: 'Freestyle specialist for aggressive riding',
      image: 'https://axisfoils.com/cdn/shop/files/Spitfire_1180-family.587_03f11212-24be-44e0-af8f-5c22a0f50ecc_1296x.jpg?v=1707208494'
    },

    // LEGACY FRONT WINGS
    {
      name: 'ART',
      displayName: 'ART (Legacy)',
      category: 'legacy',
      description: 'Original high-aspect research series',
      image: 'https://axisfoils.com/cdn/shop/products/999HERO1_1296x.jpg?v=1678998958'
    },
    {
      name: 'BSC',
      displayName: 'BSC',
      category: 'legacy',
      description: 'Beginner Series - forgiving and stable',
      image: 'https://axisfoils.com/cdn/shop/products/BSC-family-1_1296x.jpg?v=1679174114'
    },
    {
      name: 'HPS',
      displayName: 'HPS',
      category: 'legacy',
      description: 'High Performance Series - speed focused',
      image: 'https://axisfoils.com/cdn/shop/products/New-Black-Series-Wings_1296x.jpg?v=1679171555'
    },
    {
      name: 'SP',
      displayName: 'SP',
      category: 'legacy',
      description: 'Surf Performance - carving specialist',
      image: 'https://axisfoils.com/cdn/shop/products/SP_family_17_1296x.jpg?v=1679015790'
    },
    {
      name: 'PNG',
      displayName: 'PNG (Legacy)',
      category: 'legacy',
      description: 'Original Pump and Glide series',
      image: 'https://axisfoils.com/cdn/shop/products/PNG_family_23_1296x.jpg?v=1679014621'
    },

    // REAR WINGS
    {
      name: 'Skinny Link',
      displayName: 'Skinny Link',
      category: 'rear',
      description: 'Modular titanium link rear wing system',
      image: 'https://axisfoils.com/cdn/shop/files/Linkskinny-stack3_1296x.png?v=1759516284'
    },
    {
      name: 'Surf Skinny',
      displayName: 'Surf Skinny',
      category: 'rear',
      description: 'Surf-specific skinny rear wings',
      image: 'https://axisfoils.com/cdn/shop/files/Surf-Skinny-Rears-family-stack_1296x.png?v=1759451679'
    },
    {
      name: 'Skinny',
      displayName: 'Skinny',
      category: 'rear',
      description: 'High aspect rear wings for speed',
      image: 'https://axisfoils.com/cdn/shop/files/Skinny-Rears_family_SS_1296x.jpg?v=1726740896'
    },
    {
      name: 'Progressive',
      displayName: 'Progressive',
      category: 'rear',
      description: 'Balanced all-around rear wings',
      image: 'https://axisfoils.com/cdn/shop/products/Pro_family_52_49e461fd-aa86-4e45-8a6a-f27181595941_1296x.jpg?v=1679090538'
    },
    {
      name: 'Speed',
      displayName: 'Speed',
      category: 'rear',
      description: 'Maximum speed rear stabilizers',
      image: 'https://axisfoils.com/cdn/shop/products/Speed_family_24_2_0f5974f5-a8b4-4922-8928-280994de3a32_1296x.jpg?v=1679122501'
    },
    {
      name: 'Freeride',
      displayName: 'Freeride',
      category: 'rear',
      description: 'Stable freeride rear wings',
      image: 'https://axisfoils.com/cdn/shop/products/Free_family_38_050c5f24-da1b-458c-ad38-77bd3f579767_1296x.jpg?v=1679362639'
    },
    {
      name: 'Pump',
      displayName: 'Pump',
      category: 'rear',
      description: 'Optimized for pumping efficiency',
      image: 'https://axisfoils.com/cdn/shop/products/460-60-v2_front_1296x.jpg?v=1679123238'
    },

    // FUSELAGES
    {
      name: 'Ti Link',
      displayName: 'Ti Link',
      category: 'fuselage',
      description: 'Titanium modular fuselage system',
      image: 'https://axisfoils.com/cdn/shop/files/Ti-Link_1296x.png?v=1759716829'
    },
    {
      name: 'Black Advance+ FATTY',
      displayName: 'Black Advance+ FATTY',
      category: 'fuselage',
      description: 'Heavy-duty thick fuselage',
      image: 'https://axisfoils.com/cdn/shop/files/Fatty-family_heli_1296x.png?v=1759733930'
    },
    {
      name: 'Black Advance+',
      displayName: 'Black Advance+',
      category: 'fuselage',
      description: 'Premium carbon fuselage',
      image: 'https://axisfoils.com/cdn/shop/files/Black_Adv__zincfuselagee-familhy_1296x.jpg?v=1726765108'
    },
    {
      name: 'Black Advance 20',
      displayName: 'Black Advance 20',
      category: 'fuselage',
      description: '20-inch fuselage length',
      image: 'https://cdn.shopify.com/s/files/1/0076/2006/7439/files/Black_Advance_20_familuy-45.png?v=1760543243'
    },
    {
      name: 'Red Advance',
      displayName: 'Red Advance',
      category: 'fuselage',
      description: 'Mid-tier carbon fuselage',
      image: 'https://axisfoils.com/cdn/shop/products/axis-foils-red-advance-fuselage-family-bottom_3ddce3fb-4752-40e6-9da0-655f90522f8d_1296x.jpg?v=1679130567'
    },
    {
      name: 'Red',
      displayName: 'Red',
      category: 'fuselage',
      description: 'Standard aluminum fuselage',
      image: 'https://axisfoils.com/cdn/shop/products/Red_Fuselage_23_0bb1f99e-5086-4b2a-abbd-d6fff37407f4_1296x.jpg?v=1679128968'
    },

    // MASTS
    {
      name: 'Carbon Integrated Foil Drive',
      displayName: 'Carbon Integrated Foil Drive',
      category: 'mast',
      description: 'Integrated carbon mast for Foil Drive system',
      image: 'https://axisfoils.com/cdn/shop/files/PCPRO-fd-ultra-_-non2up_1296x.png?v=1759924051'
    },
    {
      name: 'PRO Ultra High Modulus Carbon',
      displayName: 'PRO Ultra High Modulus Carbon',
      category: 'mast',
      description: 'Ultimate performance carbon mast',
      image: 'https://axisfoils.com/cdn/shop/files/PCPRO-4updesc_d4b7356c-1d12-4bf5-b073-348a030ec506_1296x.jpg?v=1720091138'
    },
    {
      name: 'Power Carbon High Modulus',
      displayName: 'Power Carbon High Modulus',
      category: 'mast',
      description: 'Premium high-modulus carbon mast',
      image: 'https://axisfoils.com/cdn/shop/products/34a1e46d-6ee1-4d1d-8df1-4c5200a00070_1b493cde-db55-4972-ad7f-c5fe17c2ac3d_1296x.jpg?v=1678994028'
    },
    {
      name: 'Power Carbon',
      displayName: 'Power Carbon',
      category: 'mast',
      description: 'Standard carbon performance mast',
      image: 'https://axisfoils.com/cdn/shop/products/PC_family_06_1296x.jpg?v=1678993958'
    },
    {
      name: 'Power Carbon FATTY',
      displayName: 'Power Carbon FATTY',
      category: 'mast',
      description: 'Thick carbon mast for heavy riders',
      image: 'https://axisfoils.com/cdn/shop/files/Fatty-800_900_1296x.png?v=1759733930'
    },
    {
      name: '19mm Aluminium',
      displayName: '19mm Aluminium',
      category: 'mast',
      description: 'Durable aluminum mast',
      image: 'https://axisfoils.com/cdn/shop/products/19mm_Alloy_Mast-family_fcb0b7ec-80d3-4869-9db4-da515fe12393_1296x.jpg?v=1678913596'
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

  // Map series to AXIS website URLs
  const getAxisUrl = (series: SeriesInfo): string => {
    const urlMap: Record<string, string> = {
      // Rear wings
      'Skinny Link': 'https://axisfoils.com/collections/rear-wings-1/skinny-link',
      'Surf Skinny': 'https://axisfoils.com/collections/rear-wings-1/surf-skinny',
      'Skinny': 'https://axisfoils.com/collections/rear-wings-1/skinny',
      'Progressive': 'https://axisfoils.com/collections/rear-wings-1/progressive',
      'Speed': 'https://axisfoils.com/collections/rear-wings-1/speed',
      'Freeride': 'https://axisfoils.com/collections/rear-wings-1/freeride',
      'Pump': 'https://axisfoils.com/collections/rear-wings-1/pump',
      // Fuselages
      'Ti Link': 'https://axisfoils.com/collections/fuselages/ti-link',
      'Black Advance+ FATTY': 'https://axisfoils.com/collections/fuselages/black-advance-fatty',
      'Black Advance+': 'https://axisfoils.com/collections/fuselages/black-advance',
      'Black Advance 20': 'https://axisfoils.com/collections/fuselages/black-advance-20',
      'Red Advance': 'https://axisfoils.com/collections/fuselages/red-advance',
      'Red': 'https://axisfoils.com/collections/fuselages/red',
      // Masts
      'Carbon Integrated Foil Drive': 'https://axisfoils.com/collections/masts/carbon-integrated-foil-drive',
      'PRO Ultra High Modulus Carbon': 'https://axisfoils.com/collections/masts/pro-ultra-high-modulus-carbon',
      'Power Carbon High Modulus': 'https://axisfoils.com/collections/masts/power-carbon-high-modulus',
      'Power Carbon': 'https://axisfoils.com/collections/masts/power-carbon',
      'Power Carbon FATTY': 'https://axisfoils.com/collections/masts/power-carbon-fatty',
      '19mm Aluminium': 'https://axisfoils.com/collections/masts/19mm-aluminium',
    };
    return urlMap[series.name] || `https://axisfoils.com/collections/${series.category === 'rear' ? 'rear-wings-1' : series.category === 'fuselage' ? 'fuselages' : 'masts'}`;
  };

  const SeriesCard = ({ series }: { series: SeriesInfo }) => {
    const count = getSeriesCount(series.name);
    const isFrontWing = series.category === 'current' || series.category === 'legacy';
    const hasData = isFrontWing ? count > 0 : true; // Non-front-wings always have external links

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
            {isFrontWing && count > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                {count} foils
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {series.description}
          </p>

          {isFrontWing ? (
            hasData ? (
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
            )
          ) : (
            <a
              href={getAxisUrl(series)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition text-sm"
            >
              View on AXIS ↗
            </a>
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
