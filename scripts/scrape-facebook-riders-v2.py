#!/usr/bin/env python3
"""
AXIS Riders Facebook Group Scraper - v2
Using async approach like the working fb-axis-monitor
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

# Facebook group URL
AXIS_RIDERS_GROUP = "https://www.facebook.com/groups/axisfoilriders"

# Cookie file
COOKIE_FILE = Path.home() / ".clawdbot/credentials/fb-cookies-axis-advisor.json"

# Output file
OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "facebook-riders-feedback.json"

def load_cookies():
    """Load Facebook cookies"""
    if not COOKIE_FILE.exists():
        raise FileNotFoundError(f"Cookie file not found: {COOKIE_FILE}")
    
    with open(COOKIE_FILE) as f:
        return json.load(f)

def extract_foil_mentions(text: str) -> list:
    """Extract AXIS foil model mentions from text"""
    foils = []
    
    # Common patterns
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
    """Extract rider weight from text"""
    patterns = [
        r'(\d{2,3})\s*(lbs?|pounds?)',
        r'(\d{2,3})\s*kg',
        r'I weigh\s*(\d{2,3})',
        r'my weight is\s*(\d{2,3})',
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
    """Extract primary use case from text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['wing', 'winging', 'wing foil']):
        return 'wing'
    elif any(word in text_lower for word in ['prone', 'surf foil', 'surfing']):
        return 'prone'
    elif any(word in text_lower for word in ['sup foil', 'stand up', 'paddl']):
        return 'sup'
    elif any(word in text_lower for word in ['downwind', 'down wind', 'dw']):
        return 'downwind'
    elif any(word in text_lower for word in ['pump', 'dock start', 'dock foil']):
        return 'pump'
    elif any(word in text_lower for word in ['kite', 'kiting', 'kite foil']):
        return 'kite'
    
    return None

def extract_skill_level(text: str) -> str or None:
    """Extract skill level from text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['beginner', 'new to', 'just started', 'first time']):
        return 'beginner'
    elif any(word in text_lower for word in ['intermediate', 'getting better', 'progressing']):
        return 'intermediate'
    elif any(word in text_lower for word in ['advanced', 'expert', 'experienced', 'years of']):
        return 'advanced'
    
    return None

def extract_sentiment(text: str) -> str:
    """Extract sentiment about foil performance"""
    text_lower = text.lower()
    
    positive_words = ['love', 'amazing', 'perfect', 'great', 'awesome', 'excellent', 'best', 'fantastic']
    negative_words = ['hate', 'terrible', 'worst', 'bad', 'disappointing', 'frustrating']
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

async def scrape_axis_riders_group():
    """Scrape AXIS Riders Facebook group for user feedback"""
    
    print("🚀 AXIS Riders Facebook Group Scraper v2")
    print("=" * 50)
    
    feedback_data = {
        "meta": {
            "scraped_at": datetime.now().isoformat(),
            "source": AXIS_RIDERS_GROUP,
            "version": "2.0"
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
            print("📱 Launching browser...")
            browser = await p.chromium.launch(
                headless=False,  # Show browser for debugging
                args=['--no-sandbox', '--disable-blink-features=AutomationControlled']
            )
            
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Load cookies
            print("🔑 Loading Facebook cookies...")
            cookies = load_cookies()
            await context.add_cookies(cookies)
            
            page = await context.new_page()
            
            # Navigate to group
            print(f"🌐 Navigating to AXIS Riders group...")
            await page.goto(AXIS_RIDERS_GROUP, wait_until='domcontentloaded', timeout=60000)
            await asyncio.sleep(5)
            
            # Debug
            print(f"📍 Current URL: {page.url}")
            print(f"📄 Page title: {await page.title()}")
            
            # Check if logged in
            if "login" in page.url.lower():
                print("❌ Not logged in!")
                print("\n🔧 MANUAL STEP NEEDED:")
                print("   1. Browser window is open")
                print("   2. Log in manually in the browser")
                print("   3. Navigate to the AXIS Riders group")
                print("   4. Once you see posts, come back here and press Enter")
                input("\nPress Enter when ready to continue...")
                
                # Get current cookies after manual login
                print("💾 Saving fresh cookies...")
                fresh_cookies = await context.cookies()
                with open(COOKIE_FILE, 'w') as f:
                    json.dump(fresh_cookies, f, indent=2)
                print(f"✅ Fresh cookies saved to {COOKIE_FILE}")
                
                # Now try again
                await page.goto(AXIS_RIDERS_GROUP, wait_until='domcontentloaded', timeout=60000)
                await asyncio.sleep(3)
            
            print("✅ On group page!")
            
            # Scroll to load more posts
            print("📜 Scrolling to load posts...")
            for i in range(10):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(2)
                print(f"  Scroll {i+1}/10")
            
            # Extract posts
            print("🔍 Extracting posts...")
            
            # Find all post containers
            posts = await page.query_selector_all('[role="article"]')
            print(f"  Found {len(posts)} posts")
            
            for i, post in enumerate(posts[:100]):  # Process up to 100 posts
                try:
                    text_content = await post.inner_text()
                    
                    # Skip if too short
                    if len(text_content) < 50:
                        continue
                    
                    # Extract metadata
                    foils = extract_foil_mentions(text_content)
                    weight = extract_weight(text_content)
                    use_case = extract_use_case(text_content)
                    skill_level = extract_skill_level(text_content)
                    sentiment = extract_sentiment(text_content)
                    
                    # Only save posts with relevant data
                    if foils or weight or use_case:
                        post_data = {
                            "id": f"post_{i}",
                            "text": text_content[:500],
                            "foils_mentioned": foils,
                            "rider_weight": weight,
                            "use_case": use_case,
                            "skill_level": skill_level,
                            "sentiment": sentiment,
                            "scraped_at": datetime.now().isoformat()
                        }
                        
                        feedback_data["posts"].append(post_data)
                        
                        # Update statistics
                        for foil in foils:
                            if foil not in feedback_data["statistics"]["foil_mentions"]:
                                feedback_data["statistics"]["foil_mentions"][foil] = 0
                            feedback_data["statistics"]["foil_mentions"][foil] += 1
                        
                        if weight and foils:
                            feedback_data["statistics"]["weight_recommendations"].append({
                                "weight": weight,
                                "foil": foils[0],
                                "use_case": use_case,
                                "sentiment": sentiment
                            })
                        
                        if use_case:
                            if use_case not in feedback_data["statistics"]["use_case_feedback"]:
                                feedback_data["statistics"]["use_case_feedback"][use_case] = []
                            if foils:
                                feedback_data["statistics"]["use_case_feedback"][use_case].extend(foils)
                
                except Exception as e:
                    print(f"  ⚠️  Error processing post {i}: {e}")
                    continue
            
            feedback_data["statistics"]["total_posts"] = len(feedback_data["posts"])
            
            # Save data
            OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(feedback_data, f, indent=2)
            
            print(f"\n✅ Scraping complete!")
            print(f"📊 Statistics:")
            print(f"  - Total posts with data: {feedback_data['statistics']['total_posts']}")
            print(f"  - Unique foils mentioned: {len(feedback_data['statistics']['foil_mentions'])}")
            print(f"  - Weight recommendations: {len(feedback_data['statistics']['weight_recommendations'])}")
            print(f"\n💾 Data saved to: {OUTPUT_FILE}")
            
            await browser.close()
            
        except PlaywrightTimeout:
            print("❌ Timeout loading Facebook. Check your connection.")
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(scrape_axis_riders_group())
