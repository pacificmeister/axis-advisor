'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  weight: string;
  weightUnit: 'kg' | 'lbs';
  frontWing: string;
  rearWing: string;
  fuselage: string;
  mast: string;
  board: string;
  disciplines: string[];
  conditions: string;
  upgradedFrom: string;
  verdict: string;
  listAsContributor: boolean;
}

const DISCIPLINES = [
  'Prone Surf',
  'Wing',
  'Kite',
  'Windfoil',
  'Downwind',
  'SUP',
  'Tow',
  'Wake',
  'Parawing',
  'Dock Start',
  'Pump'
];

export default function ContributePage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    weight: '',
    weightUnit: 'kg',
    frontWing: '',
    rearWing: '',
    fuselage: '',
    mast: '',
    board: '',
    disciplines: [],
    conditions: '',
    upgradedFrom: '',
    verdict: '',
    listAsContributor: true
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisciplineToggle = (discipline: string) => {
    setFormData(prev => ({
      ...prev,
      disciplines: prev.disciplines.includes(discipline)
        ? prev.disciplines.filter(d => d !== discipline)
        : [...prev.disciplines, discipline]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Validate required fields
    if (!formData.weight || !formData.frontWing || !formData.disciplines.length) {
      setError('Please fill in weight, front wing, and at least one discipline');
      setSubmitting(false);
      return;
    }

    try {
      // Submit to our API route
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          weightKg: formData.weightUnit === 'kg' 
            ? parseFloat(formData.weight) 
            : Math.round(parseFloat(formData.weight) * 0.453592)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your setup has been submitted. You're helping build the most accurate 
              AXIS sizing guide in the community.
            </p>
            {formData.email && (
              <p className="text-sm text-gray-500 mb-6">
                We'll notify you at <strong>{formData.email}</strong> when the 
                sizing tool is updated.
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Link 
                href="/wizard"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Try the Wizard →
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    weight: '',
                    weightUnit: 'kg',
                    frontWing: '',
                    rearWing: '',
                    fuselage: '',
                    mast: '',
                    board: '',
                    disciplines: [],
                    conditions: '',
                    upgradedFrom: '',
                    verdict: '',
                    listAsContributor: true
                  });
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
              >
                Submit Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            🎯 Contribute Your Setup
          </h1>
          <p className="text-lg text-gray-600">
            Help build the community-verified AXIS sizing guide. Your real-world 
            feedback helps others find their perfect setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info (Optional) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              About You <span className="text-gray-400 font-normal text-sm">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name or nickname"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="For early access notification"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.listAsContributor}
                  onChange={e => setFormData({ ...formData, listAsContributor: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  List my name on the contributors page
                </span>
              </label>
            </div>
          </div>

          {/* Weight - Required */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Your Weight <span className="text-red-500">*</span>
            </h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  placeholder={formData.weightUnit === 'kg' ? '75' : '165'}
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'kg' })}
                  className={`px-4 py-3 font-semibold transition ${
                    formData.weightUnit === 'kg'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'lbs' })}
                  className={`px-4 py-3 font-semibold transition ${
                    formData.weightUnit === 'lbs'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          {/* Setup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Your Setup
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Front Wing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.frontWing}
                  onChange={e => setFormData({ ...formData, frontWing: e.target.value })}
                  placeholder="e.g., Surge 890, Fireball 1000, ART V2 999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rear Wing / Stabilizer
                </label>
                <input
                  type="text"
                  value={formData.rearWing}
                  onChange={e => setFormData({ ...formData, rearWing: e.target.value })}
                  placeholder="e.g., Surf Skinny 300, Progressive 425, Skinny 40"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fuselage
                  </label>
                  <input
                    type="text"
                    value={formData.fuselage}
                    onChange={e => setFormData({ ...formData, fuselage: e.target.value })}
                    placeholder="e.g., Advance+ Ultra Short"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mast
                  </label>
                  <input
                    type="text"
                    value={formData.mast}
                    onChange={e => setFormData({ ...formData, mast: e.target.value })}
                    placeholder="e.g., 82 HM, 75 Carbon"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Board
                </label>
                <input
                  type="text"
                  value={formData.board}
                  onChange={e => setFormData({ ...formData, board: e.target.value })}
                  placeholder="e.g., 4'6 prone, 5'0 wing, 73L SUP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Discipline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Discipline <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(discipline => (
                <button
                  key={discipline}
                  type="button"
                  onClick={() => handleDisciplineToggle(discipline)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                    formData.disciplines.includes(discipline)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {discipline}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions & Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Conditions & Experience
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Conditions it works best
                </label>
                <input
                  type="text"
                  value={formData.conditions}
                  onChange={e => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="e.g., Knee to head high, 15+ knots, small bumps"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What did you upgrade from?
                </label>
                <input
                  type="text"
                  value={formData.upgradedFrom}
                  onChange={e => setFormData({ ...formData, upgradedFrom: e.target.value })}
                  placeholder="e.g., ART V2 999, Spitfire 960, other brand"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your verdict / review
                </label>
                <textarea
                  value={formData.verdict}
                  onChange={e => setFormData({ ...formData, verdict: e.target.value })}
                  placeholder="What do you love about this setup? Any downsides? Would you recommend it for riders like you?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition"
            >
              {submitting ? 'Submitting...' : 'Submit My Setup 🚀'}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-500">
            Your data helps the community. We never share email addresses.
          </p>
        </form>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="text-4xl font-black">AXIS</span>
            <span className="ml-2 text-red-600 font-bold">ADVISOR</span>
          </div>
          <p className="text-gray-400 text-sm">
            Community-powered sizing guide
          </p>
        </div>
      </footer>
    </div>
  );
}
