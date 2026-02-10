import RadarChart from './RadarChart';

interface Product {
  id: number;
  title: string;
  specs: {
    area?: number;
    series?: string;
  };
}

interface PerformanceMetricsProps {
  foils: Product[];
}

// Performance profiles based on AXIS series characteristics
const seriesProfiles: Record<string, {
  speed: number;
  turning: number;
  pump: number;
  glide: number;
  lift: number;
}> = {
  'ARTPRO': { speed: 10, turning: 8, pump: 9, glide: 10, lift: 7 },
  'ART': { speed: 9, turning: 8, pump: 9, glide: 9, lift: 8 },
  'HPS': { speed: 9, turning: 7, pump: 7, glide: 9, lift: 7 },
  'BSC': { speed: 7, turning: 8, pump: 7, glide: 7, lift: 9 },
  'PNG': { speed: 6, turning: 7, pump: 10, glide: 8, lift: 8 },
  'SP': { speed: 6, turning: 10, pump: 8, glide: 7, lift: 8 },
  'Spitfire': { speed: 7, turning: 9, pump: 8, glide: 7, lift: 8 },
  'Fireball': { speed: 8, turning: 8, pump: 8, glide: 8, lift: 7 },
  'Surge': { speed: 7, turning: 8, pump: 8, glide: 8, lift: 8 },
  'Tempo': { speed: 8, turning: 7, pump: 7, glide: 8, lift: 8 },
};

const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function PerformanceMetrics({ foils }: PerformanceMetricsProps) {
  const chartData = foils.map((foil, index) => {
    const series = foil.specs.series || 'BSC';
    const profile = seriesProfiles[series] || seriesProfiles['BSC'];
    
    return {
      name: `${series} ${foil.specs.area}`,
      metrics: profile,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-black text-gray-900 mb-6">
        Performance Comparison
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Radar Chart */}
        <div>
          <RadarChart data={chartData} />
        </div>
        
        {/* Legend & Descriptions */}
        <div className="space-y-6">
          {/* Legend */}
          <div>
            <h3 className="font-bold text-lg mb-3">Foils</h3>
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-gray-900">{item.name}</span>
              </div>
            ))}
          </div>
          
          {/* Metric Descriptions */}
          <div>
            <h3 className="font-bold text-lg mb-3">Metrics Explained</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-900">Speed:</span> Top-end velocity and acceleration
              </div>
              <div>
                <span className="font-semibold text-gray-900">Turning:</span> Carving ability and maneuverability
              </div>
              <div>
                <span className="font-semibold text-gray-900">Pump:</span> Efficiency when pumping to generate speed
              </div>
              <div>
                <span className="font-semibold text-gray-900">Glide:</span> Ability to maintain speed without power
              </div>
              <div>
                <span className="font-semibold text-gray-900">Lift:</span> Early takeoff and low-speed performance
              </div>
            </div>
          </div>
          
          {/* Note */}
          <div className="text-xs text-gray-500 italic border-t pt-4">
            Performance metrics based on AXIS series characteristics. 
            Ratings are relative (1-10 scale) and approximate.
          </div>
        </div>
      </div>
    </div>
  );
}
