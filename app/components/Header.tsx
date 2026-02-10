import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Image 
            src="/logos/axis-circle.png" 
            alt="AXIS Foils" 
            width={40} 
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-lg font-black text-white leading-tight">
              AXIS FOILS
            </span>
            <span className="text-xs font-semibold text-red-400 leading-tight">
              Comparison Tool
            </span>
          </div>
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
