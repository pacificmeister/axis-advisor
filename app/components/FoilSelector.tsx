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

interface FoilSelectorProps {
  foils: Product[];
  selectedFoils: Product[];
  onSelectFoil: (foil: Product) => void;
}

export default function FoilSelector({ foils, selectedFoils, onSelectFoil }: FoilSelectorProps) {
  // Group by series
  const seriesGroups = foils.reduce((acc, foil) => {
    const series = foil.specs.series || 'Other';
    if (!acc[series]) acc[series] = [];
    acc[series].push(foil);
    return acc;
  }, {} as Record<string, Product[]>);

  // Sort each series by area
  Object.keys(seriesGroups).forEach(series => {
    seriesGroups[series].sort((a, b) => 
      (a.specs.area || 0) - (b.specs.area || 0)
    );
  });

  const seriesOrder = ['ARTPRO', 'ART', 'HPS', 'BSC', 'PNG', 'SP', 'Spitfire', 'Fireball', 'Surge', 'Tempo'];

  return (
    <div className="space-y-8">
      {seriesOrder.map(series => {
        const seriesFoils = seriesGroups[series];
        if (!seriesFoils) return null;

        return (
          <div key={series} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4 border-b pb-3">
              {series} Series
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesFoils.map(foil => {
                const isSelected = selectedFoils.some(f => f.id === foil.id);
                
                return (
                  <button
                    key={foil.id}
                    onClick={() => onSelectFoil(foil)}
                    className={`
                      relative border-2 rounded-lg p-4 transition-all hover:shadow-md
                      ${isSelected 
                        ? 'border-red-600 bg-red-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                    
                    <div className="aspect-square mb-3 flex items-center justify-center">
                      {foil.image ? (
                        <img
                          src={foil.image}
                          alt={foil.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900">
                        {foil.specs.area || '—'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {foil.price ? `$${foil.price}` : 'Price N/A'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
