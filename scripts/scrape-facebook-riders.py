#!/usr/bin/env python3
"""
AXIS Riders Facebook Group Scraper
Extracts user feedback, recommendations, and experiences for the AXIS Advisor tool
"""

import json
import re
import time
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Facebook group URL
AXIS_RIDERS_GROUP = "https://www.facebook.com/groups/axisfoilriders"

# Cookie file  
COOKIE_FILE = Path.home() / ".clawdbot/credentials/fb-cookies.json"

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
    # Look for weight patterns
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
            # Convert kg to lbs if needed
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

def scrape_axis_riders_group():
    """Scrape AXIS Riders Facebook group for user feedback"""
    
    print("🚀 AXIS Riders Facebook Group Scraper")
    print("=" * 50)
    
    feedback_data = {
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
    
    with sync_playwright() as p:
        try:
            print("📱 Launching browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            
            # Load cookies
            print("🔑 Loading Facebook cookies...")
            cookies = load_cookies()
            
            page = context.new_page()
            
            # First go to Facebook homepage to establish session
            print("🏠 Loading Facebook homepage...")
            page.goto("https://www.facebook.com", wait_until='domcontentloaded', timeout=30000)
            
            # Now set cookies
            print("🍪 Setting cookies...")
            context.add_cookies(cookies)
            
            # Navigate to group
            print(f"🌐 Navigating to AXIS Riders group...")
            page.goto(AXIS_RIDERS_GROUP, wait_until='networkidle', timeout=30000)
            time.sleep(5)
            
            # Debug: check actual URL and page state
            print(f"📍 Current URL: {page.url}")
            print(f"📄 Page title: {page.title()}")
            
            # Check if logged in
            if "login" in page.url.lower():
                print("❌ Not logged in! Cookies may be expired.")
                print("Please refresh Facebook cookies and try again.")
                return
            
            # Check if we can see group content
            if "groups" not in page.url:
                print(f"⚠️  Not on group page. Redirected to: {page.url}")
                return
            
            print("✅ Logged in successfully")
            
            # Scroll to load more posts
            print("📜 Scrolling to load posts...")
            for i in range(10):  # Scroll 10 times
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)
                print(f"  Scroll {i+1}/10")
            
            # Extract posts
            print("🔍 Extracting posts...")
            
            # Find all post containers (adjust selector based on Facebook's structure)
            posts = page.query_selector_all('[role="article"]')
            print(f"  Found {len(posts)} posts")
            
            for i, post in enumerate(posts[:50]):  # Limit to 50 posts for now
                try:
                    text_content = post.inner_text()
                    
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
                            "text": text_content[:500],  # First 500 chars
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
            
            browser.close()
            
        except PlaywrightTimeout:
            print("❌ Timeout loading Facebook. Check your connection.")
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    scrape_axis_riders_group()
