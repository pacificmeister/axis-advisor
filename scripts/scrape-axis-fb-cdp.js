#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const GROUP_URL = 'https://www.facebook.com/groups/axisfoilriders/';
const PAGE_URL = 'https://www.facebook.com/axisfoils';

const now = new Date();
const ts = now.toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
const outDir = path.join(process.cwd(), 'axis-advisor', 'archives');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `fb-scan-${ts}.json`);

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function getWsEndpoint(){
  const r = await fetch('http://127.0.0.1:18793/json/version');
  if(!r.ok) throw new Error(`CDP /json/version failed: ${r.status}`);
  const j = await r.json();
  if(!j.webSocketDebuggerUrl) throw new Error('No webSocketDebuggerUrl in CDP response');
  return j.webSocketDebuggerUrl;
}

async function clickText(page, text){
  return await page.evaluate(async (needle) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const want = norm(needle);
    const candidates = [...document.querySelectorAll('div,span,a,button')];
    for (const el of candidates) {
      const t = norm(el.innerText || el.textContent);
      if (!t || !t.includes(want)) continue;
      const r = el.getBoundingClientRect();
      const visible = r.width > 4 && r.height > 4 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight;
      if (!visible) continue;
      el.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 80));
      el.click();
      return true;
    }
    return false;
  }, text);
}

async function expandEverything(page, rounds=8){
  const labels = [
    'See more', 'View more comments', 'View more replies', 'View previous comments', 'View previous replies',
    'Most relevant', 'All comments', 'Newest', 'Most recent'
  ];
  for(let i=0;i<rounds;i++){
    let clicks = 0;
    for(const label of labels){
      for(let k=0;k<10;k++){
        const ok = await clickText(page, label);
        if(!ok) break;
        clicks++;
      }
    }
    await page.evaluate(() => window.scrollBy(0, Math.floor(window.innerHeight*0.8)));
    await sleep(1200);
    if(clicks === 0 && i > 2) break;
  }
}

async function collectArticles(page, source){
  const articles = await page.$$('[role="article"]');
  const rows = [];
  for(let i=0;i<articles.length;i++){
    try{
      const article = articles[i];
      const text = (await page.evaluate(el => (el.innerText || '').trim(), article));
      if(!text || text.length < 40) continue;
      const data = await page.evaluate((el) => {
        const anchors = [...el.querySelectorAll('a[href]')].map(a => a.href);
        const permalink = anchors.find(h => /\/posts\/|\/permalink\//.test(h)) || anchors.find(h => /facebook\.com/.test(h)) || null;
        const lines = (el.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
        const poster = lines[0] || null;
        const reactions = lines.filter(l => /\b(Like|Comment|Share|reactions?)\b/i.test(l)).slice(0,5);
        return { poster, permalink, reactions };
      }, article);
      rows.push({ source, index: i, text, ...data });
    } catch {}
  }
  return rows;
}

function extractFoils(text){
  const out = new Set();
  const re = /\b(ART\s?PRO|ART\s?V2|ART|HPS|BSC|PNG|SURGE|SPITFIRE|FIREBALL|TEMPO)\s*-?\s*(\d{3,4})\b/gi;
  let m;
  while((m=re.exec(text))) out.add(`${m[1].toUpperCase().replace(/\s+/g,' ')} ${m[2]}`);
  return [...out];
}

function extractWeightKg(text){
  let m = text.match(/\b(\d{2,3})\s?kg\b/i);
  if(m) return parseInt(m[1],10);
  m = text.match(/\b(\d{2,3})\s?(lb|lbs|pounds)\b/i);
  if(m) return Math.round(parseInt(m[1],10)/2.20462);
  return null;
}

function detectDiscipline(text){
  const t = text.toLowerCase();
  if(t.includes('wing')) return 'wing';
  if(t.includes('downwind') || t.includes('dw ')) return 'downwind';
  if(t.includes('prone') || t.includes('surf')) return 'prone/surf';
  if(t.includes('pump') || t.includes('dock')) return 'pump';
  if(t.includes('kite')) return 'kite';
  if(t.includes('efoil') || t.includes('foil drive') || t.includes('foildrive')) return 'efoil/assist';
  return null;
}

function sentiment(text){
  const t = text.toLowerCase();
  const pos = ['love','great','awesome','best','works','stoked','amazing','improved','perfect'].filter(w=>t.includes(w)).length;
  const neg = ['hate','bad','broken','issue','problem','disappoint','hard','worse','drag'].filter(w=>t.includes(w)).length;
  if(pos>neg) return 'positive';
  if(neg>pos) return 'negative';
  return 'neutral';
}

(async () => {
  const result = { meta: { scraped_at: now.toISOString(), method: 'puppeteer-cdp', cdpPort: 18793 }, failures: [], riders_group: {}, official_page: {} };
  let browser;
  try {
    const ws = await getWsEndpoint();
    browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null });

    const page = await browser.newPage();
    page.setDefaultTimeout(45000);

    // PART 1
    await page.goto(GROUP_URL, { waitUntil: 'domcontentloaded' });
    await sleep(6000);
    const body1 = await page.evaluate(() => document.body.innerText.slice(0, 5000));
    if(/log in|login|password/i.test(body1)){
      result.failures.push('Facebook appears logged out when opening AXIS riders group.');
    }
    await clickText(page, 'New posts');
    await clickText(page, 'Most recent');
    await expandEverything(page, 10);
    const groupPosts = await collectArticles(page, 'axis_riders_group');
    result.riders_group = {
      url: GROUP_URL,
      captured_posts: groupPosts.length,
      posts: groupPosts.map(p => ({
        ...p,
        foils_mentioned: extractFoils(p.text),
        rider_weight_kg: extractWeightKg(p.text),
        discipline: detectDiscipline(p.text),
        sentiment: sentiment(p.text)
      }))
    };

    // PART 2
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await sleep(5000);
    await expandEverything(page, 8);
    const officialPosts = await collectArticles(page, 'axis_official_page');
    const unanswered = officialPosts.filter(p => /\?/.test(p.text) && !/answered|thanks|thank you/i.test(p.text)).slice(0, 40);
    result.official_page = {
      url: PAGE_URL,
      captured_posts: officialPosts.length,
      unanswered_candidates: unanswered.length,
      posts: officialPosts.map(p => ({
        ...p,
        foils_mentioned: extractFoils(p.text),
        rider_weight_kg: extractWeightKg(p.text),
        discipline: detectDiscipline(p.text),
        sentiment: sentiment(p.text)
      }))
    };

    await page.close();

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ok:true,outPath,groupPosts:groupPosts.length,officialPosts:officialPosts.length,failures:result.failures},null,2));
  } catch (e) {
    result.failures.push(String(e && e.stack || e));
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ok:false,outPath,error:String(e)},null,2));
    process.exitCode = 1;
  } finally {
    try { if (browser) await browser.disconnect(); } catch {}
  }
})();
