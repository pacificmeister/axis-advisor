'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo - always visible, styled to match AXIS branding */}
        <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-90 transition group shrink-0">
          <span className="text-xl sm:text-2xl font-black text-red-500 tracking-tight" style={{fontStyle: 'italic'}}>AXIS</span>
          <span className="text-white font-bold text-lg sm:text-xl">|</span>
          <span className="text-base sm:text-lg font-bold text-white tracking-wide">ADVISOR</span>
        </Link>
        
        {/* Nav - responsive sizing */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link 
            href="/compare" 
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              pathname === '/compare' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            COMPARE
          </Link>
          <Link 
            href="/browse" 
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition hidden sm:block ${
              pathname === '/browse' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            BROWSE
          </Link>
          <Link 
            href="/wizard" 
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              pathname === '/wizard' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            WIZARD
          </Link>
          <Link 
            href="/contribute" 
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition hidden sm:block ${
              pathname === '/contribute' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            CONTRIBUTE
          </Link>
        </nav>
      </div>
    </header>
  );
}
