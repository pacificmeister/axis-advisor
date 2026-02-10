import Link from 'next/link';

export default function Header() {
  return (
    <header className="axis-gradient border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="bg-red-600 text-white px-2 py-1 rounded transform -skew-x-12">
            <span className="text-xl font-black tracking-tighter transform skew-x-12 inline-block">
              AX
            </span>
          </div>
          <span className="text-xl font-black italic text-white">
            ADVISOR
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/wizard" className="text-sm font-semibold text-white hover:text-red-400 transition">
            Recommendation Wizard
          </Link>
          <div className="text-sm text-gray-400 hidden md:block">
            Official Comparison Tool
          </div>
        </nav>
      </div>
    </header>
  );
}
