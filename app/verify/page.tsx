'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

// ─── Types ──────────────────────────────────────────────────────
interface CheckItem {
  id: string;
  label: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'physical' | 'listing' | 'seller';
  result: 'pass' | 'fail' | 'unchecked';
}

interface Product {
  title: string;
  price: string;
  specs: {
    series?: string;
    modelNumber?: number;
    product_type?: string;
    area?: number;
  };
}

interface ReportForm {
  platform: string;
  url: string;
  productClaimed: string;
  askingPrice: string;
  description: string;
  email: string;
}

// ─── Static Data ────────────────────────────────────────────────
const CHECKLIST_ITEMS: Omit<CheckItem, 'result'>[] = [
  // Critical — instant fail
  {
    id: 'serial',
    label: 'Serial Number Present',
    description: 'Genuine AXIS wings have a serial number engraved on the mounting pedestal. A blank pedestal is an INSTANT FAIL — the single fastest check.',
    severity: 'critical',
    category: 'physical',
  },
  {
    id: 'hardware',
    label: 'Clean Hardware Inserts',
    description: 'Check M8 bolt holes for visible filler or epoxy. Genuine = precision-bonded with zero adhesive visible. Visible filler = counterfeit.',
    severity: 'critical',
    category: 'physical',
  },
  {
    id: 'pedestal-layup',
    label: 'Pedestal Junction Layup',
    description: 'Genuine AXIS has BLACK OVERSPRAY covering the pedestal-to-wing transition areas (above AND below mounting plate). Bare, messy carbon fibers = INSTANT FAIL.',
    severity: 'critical',
    category: 'physical',
  },
  {
    id: 'qr-code',
    label: 'QR Code Quality',
    description: 'Genuine QR codes are crisp and scan to AXIS verification. Blurry, low-res QR codes with bleeding modules = counterfeit.',
    severity: 'critical',
    category: 'physical',
  },
  // High priority
  {
    id: 'surface-finish',
    label: 'Surface Finish Quality',
    description: 'Look for orange peel texture, waviness in reflections, inconsistent gloss zones, or dust inclusions. Genuine wings have a flawless, even finish.',
    severity: 'high',
    category: 'physical',
  },
  {
    id: 'trailing-edge',
    label: 'Trailing Edge Precision',
    description: 'Check for rough finish or asymmetric scalloped cutouts (signs of hand-trimming vs CNC machining).',
    severity: 'high',
    category: 'physical',
  },
  {
    id: 'pedestal-quality',
    label: 'Mounting Pedestal Quality',
    description: 'Genuine = precision molded, seamless transition. Counterfeit = glossy black plastic, crude transition, rough bolt holes.',
    severity: 'high',
    category: 'physical',
  },
  {
    id: 'carbon-weave',
    label: 'Carbon Fiber Weave',
    description: 'Genuine AXIS uses high-modulus carbon with consistent density. Counterfeits have coarser weave, inconsistent density, or may be cosmetic carbon over fiberglass.',
    severity: 'high',
    category: 'physical',
  },
  // Medium
  {
    id: 'logo-print',
    label: 'Logo & Text Quality',
    description: 'Check for soft/bleeding print edges vs genuine pad-printing. Look at model ID and bolt spec text for compressed or misaligned fonts.',
    severity: 'medium',
    category: 'physical',
  },
  {
    id: 'parting-line',
    label: 'Mold Parting Line',
    description: 'AXIS post-processes parting lines away. A visible mold seam is a medium-confidence counterfeit indicator.',
    severity: 'medium',
    category: 'physical',
  },
  // Listing red flags
  {
    id: 'price-check',
    label: 'Price Is Realistic',
    description: 'Genuine used AXIS foils typically sell for 60-80% of retail. Anything 40%+ below retail is suspicious. Use the Price Check tab to verify.',
    severity: 'high',
    category: 'listing',
  },
  {
    id: 'actual-photos',
    label: 'Actual Product Photos',
    description: 'Listing shows real photos of the actual item, not stock images from the AXIS website.',
    severity: 'high',
    category: 'listing',
  },
  {
    id: 'wing-cover',
    label: 'Wing Cover/Bag Shown',
    description: 'Genuine wings come with a matching cover. "Stored in another wing\'s cover" is a known scammer excuse — counterfeits don\'t come with covers.',
    severity: 'high',
    category: 'listing',
  },
  {
    id: 'receipt',
    label: 'Receipt or Proof of Purchase',
    description: 'Seller can provide original receipt from an authorized AXIS dealer.',
    severity: 'medium',
    category: 'listing',
  },
  // Seller behavior
  {
    id: 'serial-willingness',
    label: 'Willing to Show Serial Number',
    description: 'Ask the seller for a close-up of the serial number. Ghosting or excuses after this request = classic scammer behavior.',
    severity: 'critical',
    category: 'seller',
  },
  {
    id: 'knowledge',
    label: 'Has Foiling Knowledge',
    description: 'A genuine seller can talk about how the wing rides, what setup they used it with, why they\'re selling.',
    severity: 'medium',
    category: 'seller',
  },
  {
    id: 'local-pickup',
    label: 'Offers Local Pickup',
    description: 'Shipping-only with no local pickup option is a red flag. Scammers avoid in-person transactions.',
    severity: 'medium',
    category: 'seller',
  },
];

const AUTHORIZED_DEALERS = [
  { name: 'AXIS Foils Direct', url: 'https://axisfoils.com', region: 'Global' },
  { name: 'Slingshot Sports', url: 'https://slingshotsports.com', region: 'USA' },
  { name: 'Mackite', url: 'https://www.mackiteboarding.com', region: 'USA (Michigan)' },
  { name: 'Elite Watersports', url: 'https://elitewatersports.com', region: 'USA (FL)' },
  { name: 'Real Watersports', url: 'https://realwatersports.com', region: 'USA (NC)' },
  { name: 'Wind-NC', url: 'https://wind-nc.com', region: 'USA (NC)' },
  { name: 'Hydro Foil', url: 'https://hydrofoil.co.nz', region: 'New Zealand' },
];

const KNOWN_COUNTERFEIT_SOURCES = [
  { name: 'Guanyong Sports / GY Sports HK', platform: 'Alibaba', models: 'GY-HP ART 999, "AXIS Spitfire 1180" clones' },
  { name: 'ABC Sports (Huizhou)', platform: 'Alibaba', models: 'Various AXIS clones (9+ months continuous)' },
  { name: 'Chican 0528 Factory Store', platform: 'AliExpress', models: 'GY-AXIS ART V2 999 Carbon Fiber' },
  { name: 'Various "GY-Axis" stores', platform: 'AliExpress', models: 'Uses exact AXIS names: Ultrashort, Crazyshort, etc.' },
];

// ─── Component ──────────────────────────────────────────────────
export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'price' | 'report' | 'intel'>('checklist');
  const [checks, setChecks] = useState<CheckItem[]>(
    CHECKLIST_ITEMS.map(item => ({ ...item, result: 'unchecked' as const }))
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reportForm, setReportForm] = useState<ReportForm>({
    platform: '',
    url: '',
    productClaimed: '',
    askingPrice: '',
    description: '',
    email: '',
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    fetch('/data/axis-products.json')
      .then(res => res.json())
      .then(data => {
        const allProducts: Product[] = [];
        for (const [, collection] of Object.entries(data.collections)) {
          const col = collection as { products: Product[] };
          if (col.products) {
            allProducts.push(...col.products);
          }
        }
        setProducts(allProducts);
      })
      .catch(console.error);
  }, []);

  // ─── Checklist Logic ────────────────────────────────────────
  const toggleCheck = (id: string, result: 'pass' | 'fail') => {
    setChecks(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, result: c.result === result ? 'unchecked' : result }
          : c
      )
    );
  };

  const criticalFails = checks.filter(c => c.severity === 'critical' && c.result === 'fail').length;
  const highFails = checks.filter(c => c.severity === 'high' && c.result === 'fail').length;
  const totalFails = checks.filter(c => c.result === 'fail').length;
  const totalChecked = checks.filter(c => c.result !== 'unchecked').length;
  const totalPassed = checks.filter(c => c.result === 'pass').length;

  const getVerdict = () => {
    if (totalChecked === 0) return { label: 'Not Yet Checked', color: 'text-gray-400', bg: 'bg-gray-800', icon: '🔍' };
    if (criticalFails > 0) return { label: 'LIKELY COUNTERFEIT', color: 'text-red-400', bg: 'bg-red-900/50', icon: '🚨' };
    if (highFails >= 2) return { label: 'HIGH RISK — Investigate Further', color: 'text-orange-400', bg: 'bg-orange-900/50', icon: '⚠️' };
    if (totalFails > 0) return { label: 'SOME CONCERNS — Proceed with Caution', color: 'text-yellow-400', bg: 'bg-yellow-900/50', icon: '⚡' };
    if (totalPassed >= 10) return { label: 'LIKELY AUTHENTIC', color: 'text-green-400', bg: 'bg-green-900/50', icon: '✅' };
    return { label: 'Keep Checking', color: 'text-blue-400', bg: 'bg-blue-900/50', icon: '🔎' };
  };

  const verdict = getVerdict();

  // ─── Price Check Logic ──────────────────────────────────────
  const getSelectedProductData = () => {
    return products.find(p => p.title === selectedProduct);
  };

  const getPriceAnalysis = () => {
    const product = getSelectedProductData();
    if (!product || !priceInput) return null;

    const retailPrice = parseFloat(product.price);
    const askingPrice = parseFloat(priceInput);
    if (isNaN(retailPrice) || isNaN(askingPrice) || retailPrice === 0) return null;

    const percentOfRetail = (askingPrice / retailPrice) * 100;
    const discount = 100 - percentOfRetail;

    let risk: 'safe' | 'fair' | 'suspicious' | 'scam';
    let explanation: string;

    if (percentOfRetail >= 75) {
      risk = 'safe';
      explanation = `At ${percentOfRetail.toFixed(0)}% of retail ($${retailPrice}), this is a fair used market price. Normal for well-maintained secondhand gear.`;
    } else if (percentOfRetail >= 55) {
      risk = 'fair';
      explanation = `At ${percentOfRetail.toFixed(0)}% of retail ($${retailPrice}), this is a good deal but within normal range for older or well-used gear. Check condition carefully.`;
    } else if (percentOfRetail >= 40) {
      risk = 'suspicious';
      explanation = `At ${percentOfRetail.toFixed(0)}% of retail ($${retailPrice}), this is ${discount.toFixed(0)}% below retail — significantly cheaper than typical used prices. Request serial number and close-up photos.`;
    } else {
      risk = 'scam';
      explanation = `At ${percentOfRetail.toFixed(0)}% of retail ($${retailPrice}), this is ${discount.toFixed(0)}% off — far below any realistic used price. This is highly likely a counterfeit. Do NOT buy without in-person verification.`;
    }

    return { retailPrice, askingPrice, percentOfRetail, discount, risk, explanation };
  };

  const priceAnalysis = getPriceAnalysis();

  const riskColors = {
    safe: { bg: 'bg-green-900/30', border: 'border-green-600', text: 'text-green-400', label: '✅ FAIR PRICE' },
    fair: { bg: 'bg-blue-900/30', border: 'border-blue-600', text: 'text-blue-400', label: '💚 GOOD DEAL' },
    suspicious: { bg: 'bg-orange-900/30', border: 'border-orange-600', text: 'text-orange-400', label: '⚠️ SUSPICIOUS' },
    scam: { bg: 'bg-red-900/30', border: 'border-red-600', text: 'text-red-400', label: '🚨 SCAM ALERT' },
  };

  // ─── Report Logic ───────────────────────────────────────────
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store report in localStorage for now (could be an API endpoint later)
    const reports = JSON.parse(localStorage.getItem('axis-scam-reports') || '[]');
    reports.push({ ...reportForm, timestamp: new Date().toISOString() });
    localStorage.setItem('axis-scam-reports', JSON.stringify(reports));
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 5000);
    setReportForm({ platform: '', url: '', productClaimed: '', askingPrice: '', description: '', email: '' });
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/30 rounded-2xl p-6 sm:p-10 mb-8 border border-red-800/30">
          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl">🛡️</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                Anti-Counterfeit Center
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Protect yourself from counterfeit AXIS foils. Check authenticity, verify prices, and report suspicious listings.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            { key: 'checklist', label: '🔍 Authenticity Check', color: 'red' },
            { key: 'price', label: '💰 Price Reality', color: 'blue' },
            { key: 'report', label: '🚩 Report Listing', color: 'orange' },
            { key: 'intel', label: '🕵️ Threat Intel', color: 'purple' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? tab.color === 'red' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : tab.color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : tab.color === 'orange' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: Authenticity Checklist ─────────────────────── */}
        {activeTab === 'checklist' && (
          <div>
            {/* Verdict Card */}
            <div className={`${verdict.bg} rounded-2xl p-6 mb-8 border border-gray-700`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{verdict.icon}</span>
                <div>
                  <h2 className={`text-2xl font-black ${verdict.color}`}>{verdict.label}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {totalChecked} of {checks.length} items checked • {totalPassed} passed • {totalFails} failed
                    {criticalFails > 0 && ` • ${criticalFails} CRITICAL FAILURES`}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${(totalPassed / checks.length) * 100}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-300"
                  style={{ width: `${(totalFails / checks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist sections */}
            {(['physical', 'listing', 'seller'] as const).map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  {category === 'physical' ? '🔬 Physical Inspection' :
                   category === 'listing' ? '📋 Listing Red Flags' :
                   '🧑 Seller Behavior'}
                </h3>
                <div className="space-y-3">
                  {checks
                    .filter(c => c.category === category)
                    .map(check => (
                      <div
                        key={check.id}
                        className={`bg-white rounded-xl border-2 p-4 transition-all ${
                          check.result === 'pass' ? 'border-green-300 bg-green-50/50' :
                          check.result === 'fail' ? 'border-red-300 bg-red-50/50' :
                          'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                check.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                check.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {check.severity.toUpperCase()}
                              </span>
                              <h4 className="font-bold text-gray-900">{check.label}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{check.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => toggleCheck(check.id, 'pass')}
                              className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                                check.result === 'pass'
                                  ? 'bg-green-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                              }`}
                              title="Pass"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => toggleCheck(check.id, 'fail')}
                              className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                                check.result === 'fail'
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
                              }`}
                              title="Fail"
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {/* Quick tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-blue-900 text-lg mb-3">📌 What to Always Ask a Seller</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Close-up of bolt holes / hardware inserts</li>
                <li>QR code (close enough to scan)</li>
                <li>Serial number on mounting pedestal</li>
                <li>Wing cover/bag</li>
                <li>Receipt or proof of purchase from authorized dealer</li>
              </ol>
            </div>
          </div>
        )}

        {/* ─── TAB: Price Reality Check ───────────────────────── */}
        {activeTab === 'price' && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Price Reality Check</h2>
              <p className="text-gray-600 mb-6">
                Compare an asking price against the official AXIS retail price. Prices 40%+ below retail are a major red flag.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choose a product...</option>
                    {products
                      .filter(p => parseFloat(p.price) > 0)
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map(p => (
                        <option key={p.title} value={p.title}>
                          {p.title} — ${parseFloat(p.price).toFixed(0)} retail
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Asking Price ($)</label>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder="e.g. 499"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {priceAnalysis && (
                <div className={`mt-6 ${riskColors[priceAnalysis.risk].bg} border ${riskColors[priceAnalysis.risk].border} rounded-xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xl font-black ${riskColors[priceAnalysis.risk].text}`}>
                      {riskColors[priceAnalysis.risk].label}
                    </span>
                  </div>

                  {/* Visual bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>$0</span>
                      <span>Retail: ${priceAnalysis.retailPrice.toFixed(0)}</span>
                    </div>
                    <div className="relative h-8 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 to-green-500 rounded-full overflow-hidden">
                      {/* Threshold markers */}
                      <div className="absolute top-0 bottom-0 left-[40%] w-px bg-white/40" />
                      <div className="absolute top-0 bottom-0 left-[55%] w-px bg-white/40" />
                      <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/40" />
                      {/* Price marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                        style={{ left: `${Math.min(priceAnalysis.percentOfRetail, 100)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                          ${priceAnalysis.askingPrice.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-600 font-bold">SCAM</span>
                      <span className="text-orange-500">Suspicious</span>
                      <span className="text-yellow-600">Fair</span>
                      <span className="text-green-600">Normal</span>
                    </div>
                  </div>

                  <p className="text-gray-700">{priceAnalysis.explanation}</p>

                  {priceAnalysis.risk === 'scam' && (
                    <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
                      <p className="text-red-800 font-bold text-sm">
                        ⚠️ At this price, there is virtually no scenario where this is a genuine product.
                        Counterfeit AXIS foils are mass-produced in China for $250-400 and sold at these prices.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Authorized Dealers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-4">🏪 Buy from Authorized Dealers</h3>
              <p className="text-gray-600 mb-4">
                The safest way to get genuine AXIS foils. If a deal seems too good to be true, buy direct instead.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {AUTHORIZED_DEALERS.map(dealer => (
                  <a
                    key={dealer.name}
                    href={dealer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl px-4 py-3 transition group"
                  >
                    <div>
                      <span className="font-bold text-gray-900 group-hover:text-green-700">{dealer.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({dealer.region})</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-green-600">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Report Suspicious Listing ────────────────── */}
        {activeTab === 'report' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">🚩 Report a Suspicious Listing</h2>
            <p className="text-gray-600 mb-6">
              Help protect the foiling community. Reports are reviewed by the AXIS anti-counterfeit team.
            </p>

            {reportSubmitted && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6">
                <p className="text-green-800 font-bold">✅ Report submitted! Thank you for helping protect the community.</p>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Platform *</label>
                  <select
                    value={reportForm.platform}
                    onChange={e => setReportForm(f => ({ ...f, platform: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select platform...</option>
                    <option value="craigslist">Craigslist</option>
                    <option value="facebook">Facebook Marketplace</option>
                    <option value="ebay">eBay</option>
                    <option value="offerup">OfferUp</option>
                    <option value="aliexpress">AliExpress</option>
                    <option value="alibaba">Alibaba</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Listing URL *</label>
                  <input
                    type="url"
                    value={reportForm.url}
                    onChange={e => setReportForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Claimed *</label>
                  <input
                    type="text"
                    value={reportForm.productClaimed}
                    onChange={e => setReportForm(f => ({ ...f, productClaimed: e.target.value }))}
                    placeholder="e.g. AXIS ART V2 939"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Asking Price ($)</label>
                  <input
                    type="text"
                    value={reportForm.askingPrice}
                    onChange={e => setReportForm(f => ({ ...f, askingPrice: e.target.value }))}
                    placeholder="e.g. 499"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Why do you think it&apos;s fake? *</label>
                <textarea
                  value={reportForm.description}
                  onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the red flags you noticed..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Email (optional)</label>
                <input
                  type="email"
                  value={reportForm.email}
                  onChange={e => setReportForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="For follow-up if needed"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-red-600/30"
              >
                Submit Report →
              </button>
            </form>
          </div>
        )}

        {/* ─── TAB: Threat Intel ──────────────────────────────── */}
        {activeTab === 'intel' && (
          <div>
            {/* Known counterfeit sources */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">🕵️ Known Counterfeit Sources</h2>
              <p className="text-gray-600 mb-6">
                These manufacturers and stores are confirmed sources of counterfeit AXIS foils.
                They mass-produce cheap copies using inferior materials and sell them as genuine.
              </p>

              <div className="space-y-4">
                {KNOWN_COUNTERFEIT_SOURCES.map((source, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-red-900 text-lg">{source.name}</h3>
                        <p className="text-red-700 text-sm mt-1">
                          <span className="font-bold">Platform:</span> {source.platform}
                        </p>
                        <p className="text-red-700 text-sm">
                          <span className="font-bold">Known clones:</span> {source.models}
                        </p>
                      </div>
                      <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                        CONFIRMED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How counterfeits are made */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-4">🏭 How Counterfeits Are Made</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Counterfeit AXIS foils are manufactured primarily in Guangdong province, China. Factories reverse-engineer genuine
                  wings by creating molds from original products. Key differences from genuine production:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">🔴 Counterfeits</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Standard carbon (or fiberglass with carbon skin)</li>
                      <li>• Hand-poured epoxy with visible filler</li>
                      <li>• Hand-trimmed trailing edges</li>
                      <li>• No quality control or testing</li>
                      <li>• No serial numbers</li>
                      <li>• Cost: $250-400 wholesale</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">✅ Genuine AXIS</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• High-modulus carbon fiber throughout</li>
                      <li>• Precision-bonded hardware inserts</li>
                      <li>• CNC-finished trailing edges</li>
                      <li>• Tested and quality-controlled</li>
                      <li>• Unique serial number engraved</li>
                      <li>• Retail: $500-900+</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety warning */}
            <div className="bg-gradient-to-br from-red-900 to-gray-900 rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl font-black mb-4">⚠️ Why This Matters — Safety</h3>
              <p className="text-gray-300 mb-4">
                Counterfeit foils aren&apos;t just a trademark issue — they&apos;re a <strong className="text-white">safety hazard</strong>.
                Inferior carbon fiber can fail catastrophically under load, leading to:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-2">💥</span>
                  <p className="font-bold">Wing Delamination</p>
                  <p className="text-gray-400 text-sm">At speed, mid-ride</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-2">🔩</span>
                  <p className="font-bold">Hardware Failure</p>
                  <p className="text-gray-400 text-sm">Bolts pulling out of inserts</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-2">🚑</span>
                  <p className="font-bold">Injury Risk</p>
                  <p className="text-gray-400 text-sm">Broken foil = sharp edges</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-red-500 tracking-tight italic">AXIS</span>
            <span className="text-white font-bold">|</span>
            <span className="text-lg sm:text-2xl font-bold">ADVISOR</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            Anti-Counterfeit Center • Protecting the foiling community
          </p>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            <a href="https://axisfoils.com" className="hover:text-white transition">
              Visit AXIS Foils →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
