#!/usr/bin/env python3
"""
AXIS Riders Facebook Scraper - STANDALONE VERSION
Run this on your local machine while logged into Facebook
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
AXIS_RIDERS_GROUP = "https://www.facebook.com/groups/axisfoilriders"
OUTPUT_FILE = Path.home() / "axis-riders-data.json"
MAX_POSTS = 100
SCROLL_ITERATIONS = 10

def extract_foil_mentions(text: str) -> list:
    """Extract AXIS foil model mentions"""
    foils = []
    patterns = [
        r'\b(ART|ARTPRO|HPS|BSC|PNG|SP)\s*(\d{3,4})\b',
        r'\b(Spitfire|Fireball|Surge|Tempo)\s*(\d{3,4})\b',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            series = match.group(1).upper()
            area = match.group(2)
            foils.append(f"{series} {area}")
    
    return list(set(foils))

def extract_weight(text: str) -> int or None:
    """Extract rider weight"""
    patterns = [
        r'(\d{2,3})\s*(lbs?|pounds?)',
        r'(\d{2,3})\s*kg',
        r'I weigh\s*(\d{2,3})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            weight = int(match.group(1))
            if 'kg' in match.group(0).lower():
                weight = int(weight * 2.2)
            return weight
    return None

def extract_use_case(text: str) -> str or None:
    """Extract use case"""
    text_lower = text.lower()
    
    if any(w in text_lower for w in ['wing', 'winging', 'wing foil']):
        return 'wing'
    elif any(w in text_lower for w in ['prone', 'surf foil']):
        return 'prone'
    elif any(w in text_lower for w in ['sup foil', 'stand up', 'paddl']):
        return 'sup'
    elif any(w in text_lower for w in ['downwind', 'down wind', 'dw']):
        return 'downwind'
    elif any(w in text_lower for w in ['pump', 'dock start']):
        return 'pump'
    elif any(w in text_lower for w in ['kite', 'kiting']):
        return 'kite'
    return None

def extract_sentiment(text: str) -> str:
    """Extract sentiment"""
    text_lower = text.lower()
    positive = ['love', 'amazing', 'perfect', 'great', 'awesome', 'excellent', 'best']
    negative = ['hate', 'terrible', 'worst', 'bad', 'disappointing']
    
    pos_count = sum(1 for w in positive if w in text_lower)
    neg_count = sum(1 for w in negative if w in text_lower)
    
    if pos_count > neg_count:
        return 'positive'
    elif neg_count > pos_count:
        return 'negative'
    return 'neutral'

async def scrape():
    """Main scraper"""
    print("=" * 60)
    print("🚀 AXIS Riders Facebook Scraper")
    print("=" * 60)
    print(f"\nGroup: {AXIS_RIDERS_GROUP}")
    print(f"Output: {OUTPUT_FILE}\n")
    
    data = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "source": AXIS_RIDERS_GROUP,
            "version": "1.0"
        },
        "posts": [],
        "statistics": {
            "total_posts": 0,
            "foil_mentions": {},
            "weight_recommendations": [],
            "use_case_feedback": {}
        }
    }
    
    async with async_playwright() as p:
        print("📱 Launching browser...")
        browser = await p.chromium.launch(headless=False)
        
        print("🌐 Opening Facebook...")
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        print(f"🔗 Navigating to AXIS Riders group...")
        await page.goto(AXIS_RIDERS_GROUP, wait_until='domcontentloaded', timeout=60000)
        await asyncio.sleep(3)
        
        print(f"📍 Current URL: {page.url}\n")
        
        if "login" in page.url.lower():
            print("⚠️  NOT LOGGED IN!")
            print("\n📋 PLEASE:")
            print("   1. Log into Facebook in the browser window")
            print("   2. Navigate to the AXIS Riders group")
            print("   3. Make sure you can see posts")
            print("   4. Come back here and press Enter\n")
            input("Press Enter when ready...")
            await page.goto(AXIS_RIDERS_GROUP, wait_until='domcontentloaded')
            await asyncio.sleep(3)
        
        print("✅ On group page!\n")
        
        print(f"📜 Scrolling to load posts (this takes ~{SCROLL_ITERATIONS * 2} seconds)...")
        for i in range(SCROLL_ITERATIONS):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            if (i + 1) % 3 == 0:
                print(f"   Scrolled {i+1}/{SCROLL_ITERATIONS} times...")
        
        print("\n🔍 Extracting posts...")
        posts = await page.query_selector_all('[role="article"]')
        print(f"   Found {len(posts)} post containers\n")
        
        processed = 0
        for i, post in enumerate(posts[:MAX_POSTS]):
            try:
                text = await post.inner_text()
                
                if len(text) < 50:
                    continue
                
                foils = extract_foil_mentions(text)
                weight = extract_weight(text)
                use_case = extract_use_case(text)
                sentiment = extract_sentiment(text)
                
                if foils or weight or use_case:
                    data["posts"].append({
                        "id": f"post_{processed}",
                        "text": text[:500],
                        "foils_mentioned": foils,
                        "rider_weight": weight,
                        "use_case": use_case,
                        "sentiment": sentiment,
                        "scraped_at": datetime.now().isoformat()
                    })
                    
                    for foil in foils:
                        data["statistics"]["foil_mentions"][foil] = \
                            data["statistics"]["foil_mentions"].get(foil, 0) + 1
                    
                    if weight and foils:
                        data["statistics"]["weight_recommendations"].append({
                            "weight": weight,
                            "foil": foils[0],
                            "use_case": use_case,
                            "sentiment": sentiment
                        })
                    
                    if use_case and foils:
                        if use_case not in data["statistics"]["use_case_feedback"]:
                            data["statistics"]["use_case_feedback"][use_case] = []
                        data["statistics"]["use_case_feedback"][use_case].extend(foils)
                    
                    processed += 1
                    if processed % 5 == 0:
                        print(f"   Processed {processed} relevant posts...")
                
            except Exception as e:
                continue
        
        data["statistics"]["total_posts"] = len(data["posts"])
        
        await browser.close()
        
        # Save data
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        
        print("\n" + "=" * 60)
        print("✅ SCRAPING COMPLETE!")
        print("=" * 60)
        print(f"\n📊 Results:")
        print(f"   Total posts with data: {data['statistics']['total_posts']}")
        print(f"   Unique foils mentioned: {len(data['statistics']['foil_mentions'])}")
        print(f"   Weight recommendations: {len(data['statistics']['weight_recommendations'])}")
        print(f"\n💾 Data saved to: {OUTPUT_FILE}")
        print("\n📤 NEXT STEP:")
        print(f"   Send the file to Herbert:")
        print(f"   {OUTPUT_FILE}\n")

if __name__ == "__main__":
    try:
        asyncio.run(scrape())
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
