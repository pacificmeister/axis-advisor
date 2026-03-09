'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface KnowledgeData {
  series: Record<string, SeriesKnowledge>;
  downwind_progression: DownwindProgression;
  setup_guides: Record<string, SetupGuide>;
  common_pitfalls: Pitfall[];
  fuselage_guide: any;
  mast_guide: any;
}

interface SeriesKnowledge {
  name: string;
  tagline: string;
  character: string;
  who_its_for: string;
  disciplines: string[];
  expert_quotes?: ExpertQuote[];
  community_insights?: string[];
  models?: Record<string, ModelInfo>;
  warnings?: string[];
  not_ideal_for?: string;
}

interface ModelInfo {
  highlight?: string;
  notes?: string;
  rider_feedback?: string;
  weight_range?: string;
}

interface ExpertQuote {
  expert: string;
  quote: string;
  context: string;
}

interface DownwindProgression {
  title: string;
  steps: ProgressionStep[];
}

interface ProgressionStep {
  step: number;
  wing: string;
  description: string;
  skill_level: string;
}

interface SetupGuide {
  title: string;
  front_wing: string;
  rear_wing: string;
  fuselage: string;
  mast: string;
  notes: string;
}

interface Pitfall {
  issue: string;
  description: string;
  solution: string;
}

const SERIES_ORDER = ['PNG', 'BSC', 'HPS', 'ART', 'ART V2', 'ART Pro', 'Spitfire', 'Fireball', 'Tempo', 'Surge'];

const SERIES_COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  PNG: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-700' },
  BSC: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', text: 'text-green-700' },
  HPS: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', text: 'text-purple-700' },
  ART: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', text: 'text-orange-700' },
  'ART V2': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-700' },
  'ART Pro': { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', text: 'text-red-700' },
  Spitfire: { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-800', text: 'text-cyan-700' },
  Fireball: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800', text: 'text-rose-700' },
  Tempo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800', text: 'text-indigo-700' },
  Surge: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-800', text: 'text-teal-700' },
};

type Tab = 'series' | 'progression' | 'setups' | 'pitfalls' | 'experts' | 'survey';

interface SurveyData {
  meta: { source: string; title: string; total_responses: number; date_captured: string; platform: string };
  demographics: {
    weight_distribution: Record<string, number>;
    experience: Record<string, number>;
    locations: string[];
  };
  discipline_participation: Record<string, { yes: number; no: number; pct: number }>;
  top_wings_by_discipline: Record<string, { responses: number; top: string[] }>;
  product_demand_signals: string[];
}

export default function InsightsPage() {
  const [knowledge, setKnowledge] = useState<KnowledgeData | null>(null);
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('series');
  const [activeSeries, setActiveSeries] = useState<string>('Fireball');

  useEffect(() => {
    fetch('/data/axis-knowledge.json')
      .then(r => r.json())
      .then(setKnowledge)
      .catch(console.error);
    fetch('/data/survey-stats-2026-03.json')
      .then(r => r.json())
      .then(setSurvey)
      .catch(console.error);
  }, []);

  if (!knowledge) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-gray-500">Loading community insights...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'series', label: 'By Series', icon: '🏄' },
    { key: 'progression', label: 'Progression Paths', icon: '📈' },
    { key: 'setups', label: 'Setup Guides', icon: '🔧' },
    { key: 'pitfalls', label: 'Common Pitfalls', icon: '⚠️' },
    { key: 'experts', label: 'Expert Insights', icon: '🎯' },
    { key: 'survey', label: 'Community Survey', icon: '📊' },
  ];

  const currentSeries = knowledge.series[activeSeries];
  const colors = SERIES_COLORS[activeSeries] || SERIES_COLORS['PNG'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 rounded-2xl p-6 sm:p-10 mb-8 border border-blue-800/30">
          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl">🧠</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                Community Insights
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Real rider feedback, expert reviews, setup guides, and progression paths — all the insider knowledge from Mark Shinn, Yvon Labarthe, Fred Bonnet, Philippe Axman, and the global AXIS community.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: By Series ───────────────────────────────────── */}
        {activeTab === 'series' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Series selector sidebar */}
            <div className="lg:w-56 shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-4 py-3">
                  <span className="text-white font-bold text-sm">Select Series</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {SERIES_ORDER.filter(s => knowledge.series[s]).map(seriesName => {
                    const sc = SERIES_COLORS[seriesName] || SERIES_COLORS['PNG'];
                    return (
                      <button
                        key={seriesName}
                        onClick={() => setActiveSeries(seriesName)}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition ${
                          activeSeries === seriesName
                            ? `${sc.bg} ${sc.text} border-l-4 ${sc.border}`
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {seriesName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Series detail panel */}
            {currentSeries && (
              <div className="flex-1 space-y-6">
                {/* Header card */}
                <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-black text-gray-900">{currentSeries.name}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge} shrink-0`}>
                      AXIS LINEUP
                    </span>
                  </div>
                  <p className={`font-bold text-lg mb-2 ${colors.text}`}>{currentSeries.tagline}</p>
                  <p className="text-gray-700 mb-4">{currentSeries.character}</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Who It&apos;s For</span>
                      <p className="text-gray-800 text-sm mt-1">{currentSeries.who_its_for}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Disciplines</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentSeries.disciplines.map(d => (
                          <span key={d} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {currentSeries.not_ideal_for && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                      <span className="text-yellow-800 text-sm">⚠️ <strong>Not ideal for:</strong> {currentSeries.not_ideal_for}</span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {currentSeries.warnings && currentSeries.warnings.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                    <h3 className="font-bold text-orange-900 mb-3">⚠️ Know Before You Buy</h3>
                    <ul className="space-y-2">
                      {currentSeries.warnings.map((w, i) => (
                        <li key={i} className="text-orange-800 text-sm flex gap-2">
                          <span className="shrink-0">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expert Quotes */}
                {currentSeries.expert_quotes && currentSeries.expert_quotes.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-black text-gray-900 text-lg mb-4">🎯 Expert Quotes</h3>
                    <div className="space-y-4">
                      {currentSeries.expert_quotes.map((q, i) => (
                        <div key={i} className="border-l-4 border-red-500 pl-4">
                          <blockquote className="text-gray-800 italic mb-1">&ldquo;{q.quote}&rdquo;</blockquote>
                          <div className="text-sm text-gray-500">
                            <span className="font-bold text-gray-700">{q.expert}</span>
                            {q.context && <span> — {q.context}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Insights */}
                {currentSeries.community_insights && currentSeries.community_insights.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-black text-gray-900 text-lg mb-4">💬 Community Insights</h3>
                    <ul className="space-y-3">
                      {currentSeries.community_insights.map((insight, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 text-sm">
                          <span className="shrink-0 text-blue-500">▶</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Models */}
                {currentSeries.models && Object.keys(currentSeries.models).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-black text-gray-900 text-lg mb-4">📋 Key Models</h3>
                    <div className="space-y-4">
                      {Object.entries(currentSeries.models).map(([model, info]) => (
                        <div key={model} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-black text-gray-900">{model}</span>
                            {(info as ModelInfo).weight_range && (
                              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                                {(info as ModelInfo).weight_range}
                              </span>
                            )}
                          </div>
                          {(info as ModelInfo).highlight && (
                            <p className={`text-sm font-bold ${colors.text} mb-1`}>{(info as ModelInfo).highlight}</p>
                          )}
                          {(info as ModelInfo).notes && (
                            <p className="text-sm text-gray-700">{(info as ModelInfo).notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Progression Paths ───────────────────────────── */}
        {activeTab === 'progression' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">{knowledge.downwind_progression.title}</h2>
              <p className="text-gray-600 mb-8">The proven path from beginner to elite downwind foiler on AXIS gear.</p>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-green-300 to-red-300 hidden sm:block" />
                
                <div className="space-y-6">
                  {knowledge.downwind_progression.steps.map(step => (
                    <div key={step.step} className="flex gap-6">
                      <div className="shrink-0 w-16 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl z-10 ${
                          step.step === 1 ? 'bg-blue-500' :
                          step.step === 2 ? 'bg-green-500' :
                          step.step === 3 ? 'bg-orange-500' :
                          'bg-red-600'
                        }`}>
                          {step.step}
                        </div>
                      </div>
                      <div className={`flex-1 rounded-xl border-2 p-5 mb-2 ${
                        step.step === 1 ? 'border-blue-200 bg-blue-50' :
                        step.step === 2 ? 'border-green-200 bg-green-50' :
                        step.step === 3 ? 'border-orange-200 bg-orange-50' :
                        'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-gray-900">{step.wing}</h3>
                          <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold">
                            {step.skill_level}
                          </span>
                        </div>
                        <p className="text-gray-700">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* General progression principles */}
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl font-black mb-4">📌 Progression Principles</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">🐢 Don&apos;t Rush</h4>
                  <p className="text-gray-300 text-sm">Stay on each step until you&apos;re consistent. Moving up too fast is the #1 mistake in downwind.</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">🔧 Setup Matters</h4>
                  <p className="text-gray-300 text-sm">Wrong fuselage or mast can make even a good wing feel terrible. Match your components to your discipline.</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">⚖️ Weight Matters</h4>
                  <p className="text-gray-300 text-sm">The same wing feels completely different at 65kg vs 90kg. Always consider rider weight when reading reviews.</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">🌊 Conditions Matter</h4>
                  <p className="text-gray-300 text-sm">ART is magic in smooth water, terrible in chop. Spitfire handles chop. Know your conditions before buying.</p>
                </div>
              </div>
            </div>

            {/* Wing → Discipline matrix */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-4">🗺️ Series × Discipline Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left font-bold text-gray-700 px-3 py-2 rounded-l-lg">Series</th>
                      <th className="text-center font-bold text-gray-700 px-3 py-2">Wing</th>
                      <th className="text-center font-bold text-gray-700 px-3 py-2">SUP DW</th>
                      <th className="text-center font-bold text-gray-700 px-3 py-2">Prone/Surf</th>
                      <th className="text-center font-bold text-gray-700 px-3 py-2">Pump</th>
                      <th className="text-center font-bold text-gray-700 px-3 py-2 rounded-r-lg">Skill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { s: 'PNG', wing: '⭐⭐⭐', dw: '⭐⭐⭐', prone: '⭐', pump: '⭐⭐⭐⭐⭐', skill: 'Beginner' },
                      { s: 'BSC', wing: '⭐⭐⭐⭐⭐', dw: '⭐⭐', prone: '⭐⭐⭐', pump: '⭐⭐', skill: 'Beginner-Int' },
                      { s: 'HPS', wing: '⭐⭐⭐⭐', dw: '⭐⭐', prone: '⭐⭐⭐', pump: '⭐⭐', skill: 'Int-Adv' },
                      { s: 'Spitfire', wing: '⭐⭐⭐', dw: '⭐⭐⭐⭐', prone: '⭐⭐⭐⭐⭐', pump: '⭐⭐', skill: 'Int-Adv' },
                      { s: 'ART V2', wing: '⭐⭐⭐⭐⭐', dw: '⭐⭐⭐', prone: '⭐⭐⭐', pump: '⭐⭐', skill: 'Advanced' },
                      { s: 'Fireball', wing: '⭐⭐', dw: '⭐⭐⭐⭐⭐', prone: '⭐', pump: '⭐⭐⭐⭐⭐', skill: 'Advanced' },
                      { s: 'Tempo', wing: '⭐', dw: '⭐⭐⭐⭐⭐', prone: '⭐', pump: '⭐⭐⭐⭐⭐', skill: 'Expert' },
                      { s: 'Surge', wing: '⭐⭐⭐', dw: '⭐', prone: '⭐⭐⭐⭐⭐', pump: '⭐⭐', skill: 'Int-Adv' },
                    ].map(row => (
                      <tr key={row.s} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-bold text-gray-900">{row.s}</td>
                        <td className="px-3 py-2 text-center text-xs">{row.wing}</td>
                        <td className="px-3 py-2 text-center text-xs">{row.dw}</td>
                        <td className="px-3 py-2 text-center text-xs">{row.prone}</td>
                        <td className="px-3 py-2 text-center text-xs">{row.pump}</td>
                        <td className="px-3 py-2 text-center text-xs font-medium text-gray-600">{row.skill}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Setup Guides ───────────────────────────────── */}
        {activeTab === 'setups' && (
          <div className="space-y-6">
            <p className="text-gray-600">Complete setup recommendations from the AXIS community and experts.</p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {Object.entries(knowledge.setup_guides).map(([key, guide]) => (
                <div key={key} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-4 border-b border-gray-100 pb-3">{guide.title}</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0">🏄</span>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Front Wing</div>
                        <div className="font-bold text-gray-900">{guide.front_wing}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0">🔙</span>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Rear Wing</div>
                        <div className="font-bold text-gray-900">{guide.rear_wing}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0">🔗</span>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Fuselage</div>
                        <div className="font-bold text-gray-900">{guide.fuselage}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0">📏</span>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Mast</div>
                        <div className="font-bold text-gray-900">{guide.mast}</div>
                      </div>
                    </div>
                    {guide.notes && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm">{guide.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fuselage quick guide */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-black text-gray-900 text-xl mb-4">🔗 Fuselage Color Guide</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-black text-red-900 mb-2">RED Fuselage</h4>
                  <p className="text-red-700 text-sm mb-2">For larger span, thicker wings:</p>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>✓ PNG series (all sizes)</li>
                    <li>✓ BSC 1060, 1120 (thick profile)</li>
                    <li>✓ Large Spitfire</li>
                    <li>✓ 3/4 block aluminum — strongest connection</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                  <h4 className="font-black text-white mb-2">BLACK Fuselage</h4>
                  <p className="text-gray-300 text-sm mb-2">For thinner, performance wings:</p>
                  <ul className="text-gray-200 text-sm space-y-1">
                    <li>✓ ART, ART V2, ART Pro</li>
                    <li>✓ HPS (all sizes)</li>
                    <li>✓ Fireball (all sizes)</li>
                    <li>✓ Tempo (Ti Link preferred)</li>
                    <li>✓ Surge (all sizes)</li>
                    <li>✓ BSC 890 and smaller</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Advance+</strong> = mast position 60mm further forward. For advanced surf/tight turns. 
                  NOT called &ldquo;Advance 20&rdquo; — that doesn&apos;t exist.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Common Pitfalls ─────────────────────────────── */}
        {activeTab === 'pitfalls' && (
          <div className="space-y-6">
            <p className="text-gray-600">Hard-won lessons from the AXIS community. Learn from other riders&apos; mistakes.</p>
            
            <div className="space-y-4">
              {knowledge.common_pitfalls.map((pitfall, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
                    <h3 className="font-black text-orange-900 text-lg flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{pitfall.issue}</span>
                    </h3>
                  </div>
                  <div className="px-6 py-4 grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">The Problem</div>
                      <p className="text-gray-700 text-sm">{pitfall.description}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-xs font-bold text-green-700 uppercase mb-2">✅ The Fix</div>
                      <p className="text-green-800 text-sm">{pitfall.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product name corrections */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-black text-gray-900 text-lg mb-4">🚫 Products That Don&apos;t Exist</h3>
              <p className="text-gray-600 text-sm mb-4">These names circulate in the community but are wrong. Don&apos;t get confused.</p>
              <div className="space-y-3">
                {[
                  { wrong: 'Spitfire 1150', correct: 'Spitfire 1180' },
                  { wrong: 'PNG 1210', correct: 'PNG 1200' },
                  { wrong: 'Surge 1100', correct: 'Surge 1010' },
                  { wrong: 'Advance 20', correct: 'Advance+ (the + is key)' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-500 font-bold">{item.wrong}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-bold">{item.correct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: Expert Insights ─────────────────────────────── */}
        {activeTab === 'experts' && (
          <div className="space-y-8">
            {/* Expert profiles */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Mark Shinn', role: 'AXIS Company Rep', icon: '🏄‍♂️', note: 'Direct AXIS insider, extensive testing of all wings' },
                { name: 'Yvon Labarthe', role: 'Swiss Lake/Ocean Tester', icon: '📊', note: 'Systematic tester, direct contact with Adrian Roper. 7 detailed video reviews.' },
                { name: 'Fred Bonnet', role: 'Elite SUP DW Racer', icon: '🏆', note: 'Top competitive DW racer, trusted for SUP downwind recommendations' },
                { name: 'Philippe Axman', role: 'AXIS Team Rider', icon: '🎯', note: '~70kg, extensive Tempo time, competition DW specialist' },
              ].map(expert => (
                <div key={expert.name} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-3">{expert.icon}</div>
                  <h3 className="font-black text-gray-900 mb-1">{expert.name}</h3>
                  <div className="text-xs font-bold text-red-600 mb-2">{expert.role}</div>
                  <p className="text-gray-600 text-xs">{expert.note}</p>
                </div>
              ))}
            </div>

            {/* All expert quotes organized */}
            <div className="space-y-6">
              {/* Mark Shinn */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-black text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <span>🏄‍♂️</span> Mark Shinn — AXIS Insider
                </h3>
                <div className="space-y-4">
                  {[
                    { quote: "Best AXIS foil I've ridden to date.", context: "Surge 1010 — after testing" },
                    { quote: "I prefer the 1350 for light winds, it has a lot of control. On the 1350 I use the psycho short as it pumps so well.", context: "Fireball light wind setup" },
                    { quote: "For the 1500 or 1750 you really need the fatty mast and fuse and they are slower...", context: "Fireball 1500/1750 requirements" },
                    { quote: "There is only 70cm available for the Tempo. We don't have a choice in that... Sometimes Adrian makes our life simple!", context: "Tempo fuselage options" },
                    { quote: "The Surge is designed to RIP waves and be easy to pump back out too.", context: "Surge design philosophy" },
                  ].map((q, i) => (
                    <div key={i} className="border-l-4 border-red-500 pl-4">
                      <blockquote className="text-gray-800 italic mb-1">&ldquo;{q.quote}&rdquo;</blockquote>
                      <span className="text-sm text-gray-500">{q.context}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yvon Labarthe */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-black text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <span>📊</span> Yvon Labarthe — The Systematic Tester
                </h3>
                <div className="space-y-4">
                  {[
                    { quote: "FB 1500 v2 is magic! You will almost double your pumping time with the 1500 compared to the 1350. Cruising speed 17-18 km/h.", context: "Fireball 1500 review" },
                    { quote: "The FB 1750 opens the hour of pumping to everyone.", context: "Fireball 1750 review" },
                    { quote: "FB 1160: I rode it all summer, it's my favorite foil for riding. Did almost all boats, downwind, super long downwind.", context: "Fireball 1160 — summer all-rounder" },
                    { quote: "Tempo 1090: nothing glides better in the world. It looks like the FB 1070 with 200cm² less. 15-20% less effort than FB 1070.", context: "Tempo 1090 review" },
                    { quote: "With ART v2 1099, I have 25% less glide than FB 1160. Fireball wins for pumping. ART v2 turns 5-10% better rail-to-rail.", context: "ART V2 vs Fireball" },
                    { quote: "If you weigh more than 85kg, the Fati mast and fuselage are rigorous to have good control [with Fireball 1500].", context: "Mast recommendation for heavy riders" },
                  ].map((q, i) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4">
                      <blockquote className="text-gray-800 italic mb-1">&ldquo;{q.quote}&rdquo;</blockquote>
                      <span className="text-sm text-gray-500">{q.context}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Philippe Axman */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-black text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <span>🎯</span> Philippe Axman — Competition DW Specialist
                </h3>
                <div className="space-y-4">
                  {[
                    { quote: "Tempos carry more speed and glide vs equivalent Fireball. Tempo 960 = plenty of speed to win a race.", context: "Tempo vs Fireball comparison" },
                    { quote: "You need to reduce rear wing size when you go longer fuselage. Otherwise hard to pump. Longer fuse + smaller tail = same pitch stability + faster racing speed.", context: "Fuselage and rear wing relationship" },
                    { quote: "Tempo 960 and 1090 should cover most Leucate race forecasts.", context: "Competition advice for SFT France 2026" },
                  ].map((q, i) => (
                    <div key={i} className="border-l-4 border-green-500 pl-4">
                      <blockquote className="text-gray-800 italic mb-1">&ldquo;{q.quote}&rdquo;</blockquote>
                      <span className="text-sm text-gray-500">{q.context}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fred Bonnet */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-black text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <span>🏆</span> Fred Bonnet — Elite DW Racer
                </h3>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <blockquote className="text-gray-800 italic mb-1">&ldquo;Fireball 1160 — unbelievable, effortless.&rdquo;</blockquote>
                  <span className="text-sm text-gray-500">Top pick for intermediate/advanced SUP downwind</span>
                </div>
              </div>
            </div>

            {/* Community riders */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-black text-gray-900 text-xl mb-4">💬 Community Riders</h3>
              <div className="space-y-4">
                {[
                  {
                    rider: "Dmitry Evseev",
                    weight: "75kg",
                    role: "Competitive DW/UDW, Mauritius",
                    text: "FB 940 is my favorite — needs good waves/wind but flies when conditions cooperate. Daily driver is FB 1070, light wind backup is FB 1250.",
                    foil: "Fireball 940/1070"
                  },
                  {
                    rider: "Aurelien J",
                    weight: "75kg",
                    role: "Discord community member",
                    text: "Surge 830: Very comfortable, turns well, confidence-inspiring. Makes it feel alive and like it wants to turn. Setup: Advance Ultrashort fuse, Skinny 360.",
                    foil: "Surge 830"
                  },
                  {
                    rider: "Danny Perez",
                    weight: null,
                    role: "Facebook AXIS Riders group",
                    text: "Learned on PNG 1310 & 1300. Went from standard to Advance+ fuselage and it made the foils so much more responsive and maneuverable for such large spans.",
                    foil: "PNG 1310/1300"
                  },
                ].map((rider, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-bold text-gray-900">{rider.rider}</span>
                        {rider.weight && <span className="text-gray-500 text-sm ml-2">({rider.weight})</span>}
                        <div className="text-xs text-gray-500">{rider.role}</div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full shrink-0">{rider.foil}</span>
                    </div>
                    <p className="text-gray-700 text-sm italic">&ldquo;{rider.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'survey' && survey && (
          <div className="space-y-8">
            {/* Header */}
            <div className="rounded-2xl bg-gray-900 text-white p-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">📊</span>
                <div>
                  <h2 className="text-2xl font-bold">{survey.meta.title}</h2>
                  <p className="text-gray-400 text-sm">{survey.meta.source} · {survey.meta.platform} · {survey.meta.date_captured}</p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-red-400">{survey.meta.total_responses}</div>
                  <div className="text-gray-400 text-sm">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-400">{survey.demographics.locations.length}</div>
                  <div className="text-gray-400 text-sm">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-400">{Object.keys(survey.discipline_participation).length}</div>
                  <div className="text-gray-400 text-sm">Disciplines</div>
                </div>
              </div>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeAaOSDn2dJu0aKkHARBbVfOw3sGgfT2-xyrv4e9PzaZ0BVDg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl"
              >
                🗳️ Take the Survey
              </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Distribution */}
              <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⚖️ Rider Weight Distribution</h3>
                {Object.entries(survey.demographics.weight_distribution).map(([key, count]) => {
                  const label = key.replace(/_/g, ' ').replace('kg', ' kg').replace('under ', '<').replace('over ', '>');
                  const pct = Math.round((count / survey.meta.total_responses) * 100);
                  return (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{label}</span>
                        <span className="font-semibold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Experience */}
              <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Experience Level</h3>
                {Object.entries(survey.demographics.experience).map(([key, count]) => {
                  const label = key.replace('less_than_1yr', '<1 year').replace('1_2yrs', '1–2 years').replace('2_4yrs', '2–4 years').replace('4plus_yrs', '4+ years');
                  const pct = Math.round((count / survey.meta.total_responses) * 100);
                  const colors = ['bg-yellow-400', 'bg-orange-400', 'bg-red-500', 'bg-red-700'];
                  const idx = Object.keys(survey.demographics.experience).indexOf(key);
                  return (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx] || 'bg-gray-500'} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discipline Participation */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏄 Discipline Participation (ranked)</h3>
              <div className="space-y-3">
                {Object.entries(survey.discipline_participation)
                  .sort((a, b) => b[1].pct - a[1].pct)
                  .map(([key, data]) => {
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    const hue = data.pct > 60 ? 'bg-red-500' : data.pct > 30 ? 'bg-orange-400' : data.pct > 10 ? 'bg-yellow-400' : 'bg-gray-300';
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-40 text-sm text-gray-600 shrink-0">{label}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${hue} rounded-full`} style={{ width: `${data.pct}%` }} />
                        </div>
                        <div className="text-sm font-bold text-gray-800 w-12 text-right">{data.pct}%</div>
                        <div className="text-xs text-gray-400 w-12">{data.yes}/{survey.meta.total_responses}</div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top Wings by Discipline */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">🪁 Top Wings by Discipline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(survey.top_wings_by_discipline).map(([disc, data]) => {
                  const label = disc.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={disc} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">{label}</h4>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{data.responses} riders</span>
                      </div>
                      <ul className="space-y-1">
                        {data.top.map((wing, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-gray-300 mt-0.5">#{i + 1}</span>
                            <span className="text-gray-700">{wing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Demand Signals */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📣 Product Demand Signals</h3>
              <div className="space-y-3">
                {survey.product_demand_signals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-amber-500 text-lg mt-0.5">⚡</span>
                    <p className="text-gray-800 text-sm">{signal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🌍 Where Riders Are From</h3>
              <div className="flex flex-wrap gap-2">
                {survey.demographics.locations.map((loc, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-sm">{loc}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-2xl font-black text-red-500 tracking-tight italic">AXIS</span>
            <span className="text-white font-bold">|</span>
            <span className="text-2xl font-bold">ADVISOR</span>
          </div>
          <p className="text-gray-400 text-sm">
            Community Insights • Powered by real rider feedback
          </p>
        </div>
      </footer>
    </div>
  );
}
