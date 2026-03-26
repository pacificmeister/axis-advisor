'use client';

import { useEffect } from 'react';

export default function ChatDemoPage() {
  useEffect(() => {
    // Load the chat widget script
    const script = document.createElement('script');
    script.src = '/chat-widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script);
      const widget = document.getElementById('axis-chat-widget');
      if (widget) widget.remove();
      const toggle = document.getElementById('axis-chat-toggle');
      if (toggle) toggle.remove();
      const panel = document.getElementById('axis-chat-panel');
      if (panel) panel.remove();
      const styles = document.getElementById('axis-chat-styles');
      if (styles) styles.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white py-4 px-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#CC2929] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M2 18 C6 12, 14 8, 22 10"/>
              <path d="M2 18 C4 22, 8 22, 10 20"/>
              <path d="M10 20 L22 10"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight">AXIS Foils</div>
            <div className="text-[#CC2929] text-xs uppercase tracking-widest font-medium">Chat Widget Demo</div>
          </div>
        </div>
        <div className="ml-auto">
          <span className="bg-[#CC2929] text-white text-xs font-semibold px-3 py-1 rounded-full">
            axisfoils.com
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">AXIS Foiling Guide — Chat Widget Demo</h1>
          <p className="text-gray-600 text-lg">
            This is the live demo of the AXIS Foiling Guide AI chat assistant. The chat bubble appears in the bottom-right corner.
          </p>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#CC2929] text-white text-xs flex items-center justify-center font-bold">1</span>
              Try These Questions
            </h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "I'm a beginner, what foil should I start with?"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "What's the difference between Fireball and Tempo?"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "Which mast should I use with the Fireball 1500?"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "I weigh 90kg, what fuselage size for winging?"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "Best foil for SUP downwind racing progression?"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC2929] mt-0.5">→</span>
                "What does a Black Crazyshort fuselage fit?"
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#CC2929] text-white text-xs flex items-center justify-center font-bold">2</span>
              Shopify Embed Code
            </h2>
            <p className="text-gray-500 text-sm mb-3">Paste this into your Shopify theme (before <code>&lt;/body&gt;</code>):</p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
              {'<script src="https://axis-advisor.vercel.app/chat-widget.js"><\/script>'}
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Works on any page. No configuration needed. Self-contained, no external dependencies.
            </p>
          </div>
        </div>

        {/* Product family reference */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Families the AI Knows</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Surge', desc: 'Wave / Surf / Prone', color: '#CC2929' },
              { name: 'Fireball', desc: 'DW Racing / Pump', color: '#CC2929' },
              { name: 'Tempo', desc: 'Ultra-HA DW (Ti Link)', color: '#CC2929' },
              { name: 'ART V2', desc: 'All-round performance', color: '#CC2929' },
              { name: 'Spitfire', desc: 'Wave + Chop DW', color: '#CC2929' },
              { name: 'PNG / PNG V2', desc: 'Beginner pump / glide', color: '#CC2929' },
              { name: 'BSC', desc: 'True all-rounder', color: '#666' },
              { name: 'HPS', desc: 'Speed + accessibility', color: '#666' },
              { name: 'ART / ART Pro', desc: 'Elite smooth water', color: '#666' },
            ].map(({ name, desc, color }) => (
              <div key={name} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}></span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical details */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Technical Details</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Model</div>
              <div className="text-gray-300">Claude Sonnet 4 (Anthropic)</div>
            </div>
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Backend</div>
              <div className="text-gray-300">Next.js API Route (Vercel)</div>
            </div>
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Knowledge Base</div>
              <div className="text-gray-300">308 products + expert data</div>
            </div>
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Streaming</div>
              <div className="text-gray-300">Server-Sent Events (SSE)</div>
            </div>
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Session Limit</div>
              <div className="text-gray-300">20 messages per session</div>
            </div>
            <div>
              <div className="text-[#CC2929] font-medium mb-1">Dependencies</div>
              <div className="text-gray-300">Zero (self-contained widget)</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm">
        AXIS Foils AI Assistant Demo &bull;{' '}
        <a href="https://axisfoils.com" className="text-[#CC2929] hover:underline">axisfoils.com</a>
      </footer>
    </div>
  );
}
