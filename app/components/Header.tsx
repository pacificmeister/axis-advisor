'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition group">
          <span className="text-xl font-black text-red-500 tracking-tight italic">AXIS</span>
          <span className="text-white font-bold">|</span>
          <span className="text-lg font-bold text-white">ADVISOR</span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link 
            href="/compare" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              pathname === '/compare' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            COMPARE
          </Link>
          <Link 
            href="/browse" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              pathname === '/browse' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            BROWSE
          </Link>
          <Link 
            href="/wizard" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              pathname === '/wizard' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            WIZARD
          </Link>
          <Link 
            href="/contribute" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
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
