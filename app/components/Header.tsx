import Link from 'next/link';

export default function Header() {
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition group">
          <div className="bg-red-600 px-4 py-2 rounded group-hover:bg-red-700 transition">
            <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              AXIS FOILS<sup className="text-xs">®</sup>
            </span>
          </div>
          <span className="text-sm font-semibold text-red-400">
            Comparison Tool
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/search" className="text-sm font-semibold text-white hover:text-red-400 transition">
            Search & Filter
          </Link>
          <Link href="/browse" className="text-sm font-semibold text-white hover:text-red-400 transition">
            Browse by Series
          </Link>
          <Link href="/wizard" className="text-sm font-semibold text-white hover:text-red-400 transition">
            Recommendation Wizard
          </Link>
          <a 
            href="https://axisfoils.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition hidden md:block"
          >
            axisfoils.com →
          </a>
        </nav>
      </div>
    </header>
  );
}
