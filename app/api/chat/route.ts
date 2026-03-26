import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Build condensed knowledge base at module load time (cached)
function buildKnowledgeBase(): string {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const knowledge = JSON.parse(fs.readFileSync(path.join(dataDir, 'axis-knowledge.json'), 'utf8'));
    const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, 'shopify-catalog.json'), 'utf8'));

    const lines: string[] = [];

    // Product families
    lines.push('=== AXIS FOILS PRODUCT FAMILIES ===');
    const series = knowledge.series || {};
    for (const [key, v] of Object.entries(series) as [string, any][]) {
      lines.push(`\n${key} - ${v.tagline || ''}`);
      lines.push(`  ${(v.character || '').substring(0, 200)}`);
      lines.push(`  Best for: ${v.who_its_for || ''}`);
      lines.push(`  Disciplines: ${(v.disciplines || []).join(', ')}`);
      lines.push(`  Fuselage series: ${v.fuselage || ''}`);
      const models = v.models || {};
      const modelStr = Object.entries(models)
        .slice(0, 10)
        .map(([m, info]: [string, any]) => `${m}: ${(info.highlight || '').substring(0, 70)}`)
        .join(' | ');
      if (modelStr) lines.push(`  Models: ${modelStr}`);
      const quotes = (v.expert_quotes || []).slice(0, 1);
      if (quotes.length) {
        lines.push(`  Expert tip (${quotes[0].expert}): "${(quotes[0].quote || '').substring(0, 180)}"`);
      }
    }

    // Fuselage guide
    lines.push('\n=== FUSELAGE GUIDE ===');
    const fg = knowledge.fuselage_guide || {};
    lines.push(fg.overview || '');
    const redSizes = Object.entries(fg.red_series?.sizes || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    lines.push(`RED Series sizes: ${redSizes}`);
    const blkSizes = Object.entries(fg.black_series?.sizes || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    lines.push(`BLACK Series sizes: ${blkSizes}`);

    // Mast guide
    lines.push('\n=== MAST GUIDE ===');
    const mg = knowledge.mast_guide || {};
    for (const [, v] of Object.entries(mg) as [string, any][]) {
      if (!v || typeof v !== 'object') continue;
      const warn = v.warning ? ` | ⚠️ WARNING: ${(v.warning as string).substring(0, 150)}` : '';
      lines.push(`${v.name || ''}: ${(v.character || '').substring(0, 130)} | For: ${(v.who_its_for || '').substring(0, 80)}${warn}`);
    }

    // Products (available only, skip hidden/merch)
    lines.push('\n=== AVAILABLE PRODUCTS (with links) ===');
    const skipTypes = new Set(['OPTIONS_HIDDEN_PRODUCT', 'OPTIONS_HIDDEN_PRODUCTS', 'Merch', 'Gear Bag', 'Board Leash', 'Strap', 'Screw', 'Mount', 'Adapter']);
    const available = (catalog as any[]).filter((p: any) => p.available && !skipTypes.has(p.product_type || ''));

    const byType: Record<string, any[]> = {};
    for (const p of available) {
      const pt = p.product_type || 'Other';
      if (!byType[pt]) byType[pt] = [];
      byType[pt].push(p);
    }

    const typeOrder = ['Foil Complete', 'Foil Wing', 'Mast', 'Fuselage', 'Foil Board', 'Other'];
    const sortedTypes = [
      ...typeOrder.filter(t => byType[t]),
      ...Object.keys(byType).filter(t => !typeOrder.includes(t))
    ];

    for (const pt of sortedTypes) {
      const prods = byType[pt] || [];
      lines.push(`\n${pt}:`);
      for (const p of prods) {
        lines.push(`  ${p.title}: ${p.url}`);
      }
    }

    return lines.join('\n');
  } catch (err) {
    console.error('Failed to build knowledge base:', err);
    return '(Knowledge base unavailable)';
  }
}

// Cache knowledge base at module load time
const KNOWLEDGE_BASE = buildKnowledgeBase();

const SYSTEM_PROMPT = `You are the AXIS Foiling Guide — a knowledgeable, friendly expert assistant for AXIS Foils (axisfoils.com). You help riders find the perfect foil setup for their riding style, skill level, and conditions.

## YOUR IDENTITY
- Name: AXIS Foiling Guide
- Tone: Warm, expert, enthusiastic about foiling — like talking to a knowledgeable friend at the foil shop
- Be concise but thorough. Get to the point, then elaborate if needed.
- Use product links whenever you recommend something

## CONTACT & SUPPORT RULES
- **Warranty questions**: "Please contact the dealer where you purchased your gear. If you purchased from axisfoils.com directly, email axisfoils@gmail.com. See the warranty policy: https://axisfoils.com/pages/warrant-policy"
- **General inquiries / questions you can't answer**: "Email info@axisfoils.com — the AXIS team will be happy to help!"
- **When unsure**: "Let me connect you with our team — please email info@axisfoils.com"

## STRICT RULES
- NEVER discuss counterfeits, fakes, or unauthorized products
- NEVER make up product specs — only use what's in the knowledge base
- Always link to the actual axisfoils.com product URL when recommending
- If a product URL isn't in your knowledge base, direct to https://axisfoils.com

## QUICK REFERENCE

**Product Families:**
- **Surge** — Wave riding specialist, surf/prone, sharp turns, handles turbulence
- **Fireball (FB)** — F1 of downwind, high camber, low stall speed, DW racing
- **Tempo** — Ultra-high-aspect DW with Ti Link, next-gen efficiency
- **ART V2** — Forgiving high-aspect, all-round performance, choppy water capable
- **ART / ART Pro** — Elite high-aspect, smooth water only, needs Power Carbon mast
- **Spitfire** — Wave weapon + DW chop, sharp turns
- **PNG / PNG V2** — Beginner pump foil, legendary glide, light wind king
- **BSC** — True all-rounder beginner/intermediate, early pop-up
- **HPS** — Speed + accessibility, stepping stone from BSC to ART

**Fuselage Series:**
- **RED Series**: For larger/thicker wings — PNG (all), BSC 1060/1120. 3/4 block aluminum, 4x 8mm bolts.
- **BLACK Series**: For thinner/performance wings — ART, Fireball, Surge, Tempo, HPS, Spitfire, BSC 890 and smaller

**Mast Guide:**
- **19mm Aluminum**: Most reliable, stiffest aluminum, best all-around. Start here.
- **Power Carbon (Carbon Pro)**: Performance standard, immediate response. Essential for ART series.
- **Ultra Pro / Ultra High Modulus**: Lightest, ultimate stiffness. ⚠️ NOT for Fireball 1500/1750 — breakage risk!
- **Fatty Mast**: Strongest, for heavy riders or big wings like FB1500/1750

**Fuselage Sizes (general guidance):**
- Standard/Long: Heavier riders 240lb+, largest wings
- Short/Ultrashort: Most popular intermediate/advanced sizes
- Crazyshort/Psychoshort: Advanced carving, max maneuverability

**Downwind Progression Path:**
1. PNG 1300 (learn to catch bumps)
2. Spitfire 1180 or Fireball 1160 (step up)
3. Fireball 1000-1160 (intermediate DW)
4. Tempo / ART Pro (advanced racing)

## KNOWLEDGE BASE
${KNOWLEDGE_BASE}`;

// Simple in-memory rate limiting (per deployment instance)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  const maxRequests = 100; // per hour per IP

  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // CORS headers for Shopify embedding
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages || [];

    // Validate
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Limit conversation length (max 20 turns)
    const trimmedMessages = messages.slice(-20);

    // Validate message format
    const validMessages = trimmedMessages
      .filter(m => m.role && m.content && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role as 'user' | 'assistant', content: String(m.content).substring(0, 2000) }));

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Stream the response
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: validMessages,
    });

    // Create a ReadableStream to pipe the SSE data
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again or email info@axisfoils.com' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
