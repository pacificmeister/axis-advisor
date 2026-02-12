'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition group">
          <div className="bg-red-600 px-3 py-1.5 rounded group-hover:bg-red-700 transition">
            <span className="text-lg font-black text-white tracking-tight">AX</span>
          </div>
          <span className="text-lg font-bold text-white">
            ADVISOR
          </span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link 
            href="/search" 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              pathname === '/search' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            LOOK-UP
          </Link>
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
        </nav>
      </div>
    </header>
  );
}
