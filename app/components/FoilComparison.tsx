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
  };
}

import PerformanceMetrics from './PerformanceMetrics';

interface FoilComparisonProps {
  foils: Product[];
}

export default function FoilComparison({ foils }: FoilComparisonProps) {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 300) + '...';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Side-by-Side Comparison
        </h2>
        
        <div className={`grid grid-cols-${Math.min(foils.length, 4)} gap-6`}>
          {foils.map(foil => (
            <div key={foil.id} className="space-y-4">
              {/* Image */}
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-4">
                {foil.image ? (
                  <img
                    src={foil.image}
                    alt={foil.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">No image</div>
                )}
              </div>
              
              {/* Title */}
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {foil.specs.series} {foil.specs.area}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{foil.title}</p>
              </div>
              
              {/* Specs */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Area</span>
                  <span className="font-bold">{foil.specs.area} cm²</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Series</span>
                  <span className="font-bold">{foil.specs.series}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Price</span>
                  <span className="font-bold text-red-600">{foil.price ? `$${foil.price}` : 'N/A'}</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="text-xs text-gray-600 leading-relaxed">
                {foil.description ? stripHtml(foil.description) : 'No description available'}
              </div>
              
              {/* CTA */}
              <a
                href={`https://axisfoils.com/products/${foil.title.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                View on AXIS →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics foils={foils} />
    </div>
  );
}
