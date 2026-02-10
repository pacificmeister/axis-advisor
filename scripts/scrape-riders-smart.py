#!/usr/bin/env python3
"""
Smart AXIS Riders scraper - using proven fb-axis-monitor approach
"""

import asyncio
import json
import re
import random
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

# Config
AXIS_RIDERS_GROUP = "https://www.facebook.com/groups/axisfoilriders"
COOKIES_PATH = Path.home() / ".clawdbot/credentials/fb-cookies.json"
OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "facebook-riders-feedback.json"

def load_cookies():
    """Load saved cookies"""
    if COOKIES_PATH.exists():
        with open(COOKIES_PATH) as f:
            return json.load(f)
    return None

def save_cookies(cookies):
    """Save browser cookies for session persistence"""
    COOKIES_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(COOKIES_PATH, 'w') as f:
        json.dump(cookies, f)

def extract_foil_mentions(text: str) -> list:
    """Extract AXIS foil mentions"""
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

async def human_delay(min_ms=500, max_ms=2000):
    """Random delay to mimic human behavior"""
    await asyncio.sleep(random.randint(min_ms, max_ms) / 1000.0)

async def scrape_with_stealth():
    """Scrape using stealth tactics from fb-axis-monitor"""
    
    print("🕵️  STEALTH AXIS Riders Scraper")
    print("=" * 50)
    
    data = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "source": AXIS_RIDERS_GROUP,
            "version": "stealth-1.0"
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
        try:
            print("📱 Launching browser with ULTRA-STEALTH settings...")
            browser = await p.chromium.launch(
                headless=True,  # Must use headless on server
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920x1080',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ]
            )
            
            # Create context with realistic settings
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='en-US',
                timezone_id='America/Los_Angeles'
            )
            
            # Load cookies
            print("🔑 Loading saved session...")
            cookies = load_cookies()
            if cookies:
                await context.add_cookies(cookies)
            
            page = await context.new_page()
            
            # Add extra stealth
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            """)
            
            # Navigate slowly and naturally
            print("🌐 Loading Facebook...")
            await page.goto("https://www.facebook.com", wait_until='domcontentloaded')
            await human_delay(2000, 4000)
            
            # Check if logged in
            current_url = page.url
            if "login" in current_url.lower():
                print("❌ Not logged in. Cookie file might be old.")
                print("\n📋 MANUAL LOGIN REQUIRED:")
                print("   1. Log into Facebook in the browser")
                print("   2. Navigate to AXIS Riders group")
                print("   3. Press Enter here when ready")
                input("\nPress Enter...")
                
                # Save fresh cookies
                fresh_cookies = await context.cookies()
                save_cookies(fresh_cookies)
                print("✅ Saved fresh cookies")
            
            # Navigate to group
            print(f"📂 Navigating to AXIS Riders group...")
            await page.goto(AXIS_RIDERS_GROUP, wait_until='domcontentloaded', timeout=60000)
            await human_delay(3000, 5000)
            
            print(f"📍 Current URL: {page.url}")
            
            if "login" in page.url.lower():
                print("❌ Still not on group page. Check access.")
                await browser.close()
                return
            
            print("✅ On group page!\n")
            
            # Scroll naturally and collect posts
            print("📜 Scrolling and collecting posts (human-like)...")
            
            seen_texts = set()  # Deduplicate
            scroll_count = 0
            max_scrolls = 15  # More scrolls, but slower
            
            while scroll_count < max_scrolls:
                # Scroll down gradually
                await page.evaluate(f"window.scrollBy(0, {random.randint(300, 600)})")
                await human_delay(1500, 3000)  # Slower scrolling
                
                # Extract visible posts
                articles = await page.query_selector_all('[role="article"]')
                
                for article in articles:
                    try:
                        text = await article.inner_text()
                        
                        # Skip if too short or already seen
                        if len(text) < 50 or text in seen_texts:
                            continue
                        
                        seen_texts.add(text)
                        
                        # Extract data
                        foils = extract_foil_mentions(text)
                        weight = extract_weight(text)
                        use_case = extract_use_case(text)
                        sentiment = extract_sentiment(text)
                        
                        if foils or weight or use_case:
                            post_data = {
                                "id": f"post_{len(data['posts'])}",
                                "text": text[:500],
                                "foils_mentioned": foils,
                                "rider_weight": weight,
                                "use_case": use_case,
                                "sentiment": sentiment,
                                "scraped_at": datetime.now().isoformat()
                            }
                            
                            data["posts"].append(post_data)
                            
                            # Update stats
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
                    
                    except Exception as e:
                        continue
                
                scroll_count += 1
                if scroll_count % 3 == 0:
                    print(f"   Collected {len(data['posts'])} relevant posts so far...")
            
            data["statistics"]["total_posts"] = len(data["posts"])
            
            # Save data
            OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(data, f, indent=2)
            
            print("\n" + "=" * 50)
            print("✅ SCRAPING COMPLETE!")
            print("=" * 50)
            print(f"\n📊 Results:")
            print(f"   Posts with data: {data['statistics']['total_posts']}")
            print(f"   Unique foils mentioned: {len(data['statistics']['foil_mentions'])}")
            print(f"   Weight recommendations: {len(data['statistics']['weight_recommendations'])}")
            print(f"\n💾 Saved to: {OUTPUT_FILE}")
            
            await browser.close()
            
        except PlaywrightTimeout:
            print("❌ Timeout. Facebook might be slow or blocking.")
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(scrape_with_stealth())
