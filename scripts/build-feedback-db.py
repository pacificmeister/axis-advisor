#!/usr/bin/env python3
"""
Build comprehensive rider feedback database for AXIS Advisor.
Sources:
  1. Existing FB rider feedback (facebook-riders-feedback.json)
  2. FB surge feedback (fb-surge-feedback-parsed.json)
  3. FB main feed (fb-main-feed-parsed.json)
  4. Yvon expert reviews (yvon-feedback.json)
  5. Axis foils expertise file (community knowledge)
  6. Evan tech specs (official measurements)
"""

import json
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"
PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data"
MEMORY_DIR = Path(__file__).parent.parent.parent / "memory" / "groups" / "axis"

def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Could not load {path}: {e}")
        return None

def build_community_feedback():
    """Build structured community feedback from all sources."""
    
    all_feedback = []
    
    # 1. Existing FB rider feedback
    fb_data = load_json(DATA_DIR / "facebook-riders-feedback.json")
    if fb_data and "posts" in fb_data:
        for post in fb_data["posts"]:
            if post.get("text") and len(post["text"]) > 30:
                all_feedback.append({
                    "id": post.get("id", f"fb_{len(all_feedback)}"),
                    "source": "facebook_axis_riders",
                    "source_label": "AXIS Foil Riders (10.5K members)",
                    "rider": extract_name(post["text"]),
                    "text": clean_text(post["text"]),
                    "foils_mentioned": post.get("foils_mentioned", []),
                    "rider_weight": post.get("rider_weight"),
                    "use_case": post.get("use_case"),
                    "sentiment": post.get("sentiment", "neutral"),
                    "type": "community",
                    "date": post.get("scraped_at", "2026-02")
                })
        print(f"✅ FB Riders: {len(fb_data['posts'])} posts")
    
    # 2. FB Surge feedback
    surge_data = load_json(DATA_DIR / "fb-surge-feedback-parsed.json")
    if surge_data:
        posts = surge_data if isinstance(surge_data, list) else surge_data.get("posts", [])
        for i, post in enumerate(posts):
            text = post.get("text", post.get("content", ""))
            if text and len(text) > 30:
                all_feedback.append({
                    "id": f"surge_{i}",
                    "source": "facebook_surge_discussion",
                    "source_label": "FB Surge Discussion Thread",
                    "rider": post.get("author", extract_name(text)),
                    "text": clean_text(text),
                    "foils_mentioned": post.get("foils_mentioned", extract_foils(text)),
                    "rider_weight": post.get("rider_weight"),
                    "use_case": post.get("use_case"),
                    "sentiment": post.get("sentiment", "positive"),
                    "type": "community",
                    "date": "2026-02"
                })
        print(f"✅ Surge feedback: {len(posts)} posts")
    
    # 3. FB main feed
    main_feed = load_json(DATA_DIR / "fb-main-feed-parsed.json")
    if main_feed:
        posts = main_feed if isinstance(main_feed, list) else main_feed.get("posts", [])
        for i, post in enumerate(posts):
            text = post.get("text", post.get("content", ""))
            if text and len(text) > 30:
                all_feedback.append({
                    "id": f"fb_main_{i}",
                    "source": "facebook_main_feed",
                    "source_label": "AXIS Community Feed",
                    "rider": post.get("author", extract_name(text)),
                    "text": clean_text(text),
                    "foils_mentioned": post.get("foils_mentioned", extract_foils(text)),
                    "rider_weight": post.get("rider_weight"),
                    "use_case": post.get("use_case"),
                    "sentiment": post.get("sentiment", "neutral"),
                    "type": "community",
                    "date": "2026-02"
                })
        print(f"✅ Main feed: {len(posts)} posts")
    
    # 4. Yvon expert reviews (already good quality)
    yvon_data = load_json(DATA_DIR / "yvon-feedback.json")
    if yvon_data:
        posts = yvon_data.get("posts", yvon_data if isinstance(yvon_data, list) else [])
        for post in posts:
            all_feedback.append({
                "id": post.get("id", f"yvon_{len(all_feedback)}"),
                "source": "youtube_expert",
                "source_label": "Expert Review (YouTube)",
                "rider": post.get("rider", "Yvon Labarthe"),
                "rider_type": post.get("rider_type", "expert"),
                "weight_kg": post.get("weight_kg"),
                "text": post.get("text", ""),
                "foils_mentioned": post.get("foils_mentioned", []),
                "key_insight": post.get("key_insight"),
                "sentiment": post.get("sentiment", "positive"),
                "type": "expert",
                "date": "2026-02"
            })
        print(f"✅ Yvon expert: {len(posts)} reviews")
    
    # 5. Expert knowledge from axis-foils-expertise.md (curated insights)
    expertise_feedback = build_expertise_feedback()
    all_feedback.extend(expertise_feedback)
    print(f"✅ Curated expertise: {len(expertise_feedback)} insights")
    
    # 6. Mark Shinn / community quotes about Surge
    mark_shinn_feedback = [
        {
            "id": "shinn_surge_1010",
            "source": "team_rider",
            "source_label": "AXIS Team Rider",
            "rider": "Mark Shinn",
            "rider_type": "team_rider",
            "text": "Best AXIS foil I've ridden to date. The Surge 1010 is incredible — instant response, shortboard snap, smooth rail-to-rail flow.",
            "foils_mentioned": ["Surge 1010"],
            "key_insight": "Mark Shinn's favorite AXIS foil ever — shortboard snap with smooth flow",
            "sentiment": "very_positive",
            "type": "expert",
            "date": "2025-11"
        },
        {
            "id": "shinn_surge_950_recommendation",
            "source": "facebook_axis_riders",
            "source_label": "AXIS Foil Riders Group",
            "rider": "Mark Shinn",
            "rider_type": "team_rider",
            "text": "The Surge is designed to RIP waves and be easy to pump back out too. The 950 is the size comparison to the 999 but has a lot more lift and glide.",
            "foils_mentioned": ["Surge 950", "ART 999"],
            "key_insight": "Surge 950 replaces ART 999 with more lift, glide, and wave performance",
            "sentiment": "very_positive",
            "type": "expert",
            "date": "2026-02"
        }
    ]
    all_feedback.extend(mark_shinn_feedback)
    print(f"✅ Team rider quotes: {len(mark_shinn_feedback)}")
    
    return all_feedback

def build_expertise_feedback():
    """Extract structured feedback from axis-foils-expertise.md"""
    
    insights = []
    
    # PNG Series
    insights.append({
        "id": "exp_png_1310_pump",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "PNG 1310 holds the world record for non-stop pump foiling. Incredible glide, best light-wind wing option. Great for learning downwind.",
        "foils_mentioned": ["PNG 1310"],
        "key_insight": "World record pump foil — unmatched glide and light-wind performance",
        "sentiment": "very_positive",
        "type": "community_consensus",
        "use_case": "pump",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_png_1300_downwind",
        "source": "community_knowledge",
        "source_label": "James Casey (Pro Downwinder)",
        "rider": "James Casey",
        "rider_type": "pro",
        "text": "James Casey recommends the PNG 1300 for learning downwind — the big span catches small wind swell that other foils miss.",
        "foils_mentioned": ["PNG 1300"],
        "key_insight": "Pro downwinder's top pick for learning — catches bumps other foils miss",
        "sentiment": "very_positive",
        "type": "expert",
        "use_case": "downwind",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_png_1310_learning",
        "source": "facebook_axis_riders",
        "source_label": "Danny Perez (Community)",
        "rider": "Danny Perez",
        "text": "Learned on PNG 1310 & 1300. Went from standard to Advance fuselage and it made the foils so much more responsive and maneuverable. Took 3-4 sessions to adjust.",
        "foils_mentioned": ["PNG 1310", "PNG 1300"],
        "key_insight": "Advance fuselage transforms PNG — more responsive, 3-4 sessions to adapt",
        "sentiment": "positive",
        "type": "community",
        "date": "2026-02"
    })
    
    # BSC Series
    insights.append({
        "id": "exp_bsc_beginner",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "BSC series is the best all-rounder for everything — wing, SUP, prone, kite, wake. Early pop-up, maneuverable, forgiving. BSC 1060 for 75-90kg, BSC 1120 for 90kg+.",
        "foils_mentioned": ["BSC 1060", "BSC 1120", "BSC 970"],
        "key_insight": "Best beginner/all-around series. BSC 1060 for 75-90kg, 1120 for 90kg+",
        "sentiment": "positive",
        "type": "community_consensus",
        "use_case": "wing",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_bsc_810_crossover",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "BSC 810 is a popular intermediate kite/prone/high wind wing option. Transitions well from BSC 1060 as riders improve.",
        "foils_mentioned": ["BSC 810"],
        "key_insight": "Popular intermediate crossover — kite, prone, and high-wind winging",
        "sentiment": "positive",
        "type": "community_consensus",
        "use_case": "kite",
        "date": "2026-01"
    })
    
    # HPS Series
    insights.append({
        "id": "exp_hps_880_pitch",
        "source": "community_knowledge",
        "source_label": "Community Feedback",
        "rider": "Multiple Riders",
        "text": "HPS 880 is fast and glidey but some riders report pitch control challenges — over-correcting up/down. Natural stepping stone from BSC. Pairs well with Progressive and Speed rear wings.",
        "foils_mentioned": ["HPS 880"],
        "key_insight": "Fast but can be pitchy — pair with Progressive rear to smooth it out",
        "sentiment": "mixed",
        "type": "community_consensus",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_hps_1050_sup",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "HPS 1050 is a beast for SUP foiling. Great power and glide for paddle-up.",
        "foils_mentioned": ["HPS 1050"],
        "key_insight": "Beast for SUP foiling — great paddle-up power",
        "sentiment": "very_positive",
        "type": "community_consensus",
        "use_case": "sup",
        "date": "2026-01"
    })
    
    # ART Series
    insights.append({
        "id": "exp_art_choppy",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "ART series delivers frictionless glide with reduced chord and high aspect. Needs Power Carbon mast and Advance fuselage. NOT for turbulent water — needs skill and smooth conditions.",
        "foils_mentioned": ["ART 999", "ART 899", "ART 1099"],
        "key_insight": "Incredible glide but NOT for choppy water — needs Power Carbon mast",
        "sentiment": "positive",
        "type": "community_consensus",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_artpro_951_race",
        "source": "community_knowledge",
        "source_label": "Race Results",
        "rider": "Kai Lenny",
        "rider_type": "pro",
        "text": "ART Pro 951 is Kai Lenny's race wing — placed 5th at M2O. Stiffer and more responsive than standard ART. For advanced riders who dictate the foil.",
        "foils_mentioned": ["ARTPRO 951"],
        "key_insight": "Kai Lenny's M2O race wing — 5th place finish. For riders who dictate, not react",
        "sentiment": "very_positive",
        "type": "expert",
        "use_case": "downwind",
        "date": "2026-01"
    })
    
    # ART V2
    insights.append({
        "id": "exp_artv2_forgiving",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "ART V2 is a more forgiving ART — like a 'Spitfire Pro'. Spitfire's turn and forgiveness with ART's glide and speed. Better for UK/choppy conditions. Great intermediate downwind option.",
        "foils_mentioned": ["ART V2"],
        "key_insight": "Forgiving ART — Spitfire turn + ART glide. Great for choppy downwind",
        "sentiment": "very_positive",
        "type": "community_consensus",
        "use_case": "downwind",
        "date": "2026-01"
    })
    
    # Spitfire
    insights.append({
        "id": "exp_spitfire_1180_downwind",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "Spitfire 1180 is very popular for downwind progression and general wave riding. Sharp smooth turns, handles turbulence better than ART. Pair with Advance fuselage + small progressive rears.",
        "foils_mentioned": ["Spitfire 1180"],
        "key_insight": "Top pick for downwind progression — handles chop better than ART",
        "sentiment": "very_positive",
        "type": "community_consensus",
        "use_case": "downwind",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_spitfire_wave",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "Spitfire 960/900/840 are excellent for UK prone conditions and less advanced winging. Sharp turns, great in turbulence.",
        "foils_mentioned": ["Spitfire 960", "Spitfire 900", "Spitfire 840"],
        "key_insight": "Best for choppy/UK conditions — confident in turbulence",
        "sentiment": "positive",
        "type": "community_consensus",
        "use_case": "prone",
        "date": "2026-01"
    })
    
    # Fireball
    insights.append({
        "id": "exp_fireball_f1",
        "source": "community_knowledge",
        "source_label": "Community / Boot 2026",
        "rider": "AXIS Official",
        "rider_type": "manufacturer",
        "text": "Fireball is the 'F1 of foiling' — high camber (new for AXIS), ~13 AR, very low stall speed despite high performance. Gets up early, fast top end. Designed for SUP downwind racing.",
        "foils_mentioned": ["Fireball 1000", "Fireball 1500", "Fireball 1750"],
        "key_insight": "F1 of foiling — low stall + fast top end. New camber design unique to AXIS",
        "sentiment": "very_positive",
        "type": "manufacturer",
        "use_case": "downwind",
        "date": "2026-01"
    })
    
    # Surge (Boot 2026)
    insights.append({
        "id": "exp_surge_launch",
        "source": "boot_2026",
        "source_label": "Boot Düsseldorf 2026 Launch",
        "rider": "AXIS Official",
        "rider_type": "manufacturer",
        "text": "Surge rejects the surf-foil status quo — no more choosing between carve and glide. First AXIS wing with 'moustache' tips. Pure surf feel: instant response, shortboard snap, smooth rail-to-rail flow. Handles knee-high mush to outer-reef freight trains.",
        "foils_mentioned": ["Surge 830", "Surge 890", "Surge 950", "Surge 1010"],
        "key_insight": "First moustache-tip AXIS wing — carve AND glide, no compromise",
        "sentiment": "very_positive",
        "type": "manufacturer",
        "use_case": "prone",
        "date": "2025-11"
    })
    
    # Tempo
    insights.append({
        "id": "exp_tempo_revolution",
        "source": "boot_2026",
        "source_label": "Boot Düsseldorf 2026 Launch",
        "rider": "AXIS Official",
        "rider_type": "manufacturer",
        "text": "Tempo is not a simple upgrade — a revolution and brand-new approach. Ultra-High Modulus carbon fibre, requires Ti Link titanium fuselage for full potential. Higher aspect ratios, lower volumes. Accessible despite low surface areas.",
        "foils_mentioned": ["Tempo"],
        "key_insight": "Revolutionary UHM carbon design — needs Ti Link fuselage for full potential",
        "sentiment": "very_positive",
        "type": "manufacturer",
        "use_case": "downwind",
        "date": "2025-11"
    })
    
    # Setup recommendations
    insights.append({
        "id": "exp_setup_beginner",
        "source": "community_knowledge",
        "source_label": "Community Recommended Setup",
        "rider": "Community Consensus",
        "text": "Beginner winging setup for 80kg rider: BSC 1060 front + Freeride 440/90 rear + Short Red fuselage + 75cm aluminum mast (upgrade to 90cm when progressing).",
        "foils_mentioned": ["BSC 1060"],
        "key_insight": "Standard beginner setup: BSC 1060 + Freeride rear + Red Short + 75cm alu mast",
        "sentiment": "positive",
        "type": "setup_guide",
        "use_case": "wing",
        "date": "2026-01"
    })
    insights.append({
        "id": "exp_setup_downwind_progression",
        "source": "community_knowledge",
        "source_label": "Downwind Progression Path",
        "rider": "Community Consensus",
        "text": "Downwind progression: Start with PNG 1300 (learn to catch bumps), progress to ART Pro 1201 or Spitfire 1180, then advance to Fireball or ART Pro 951.",
        "foils_mentioned": ["PNG 1300", "ARTPRO 1201", "Spitfire 1180", "ARTPRO 951"],
        "key_insight": "Downwind ladder: PNG 1300 → ART Pro 1201/Spitfire 1180 → Fireball/ART Pro 951",
        "sentiment": "positive",
        "type": "setup_guide",
        "use_case": "downwind",
        "date": "2026-01"
    })
    
    # Advance fuselage insights  
    insights.append({
        "id": "exp_advance_fuselage",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Shaun Henderson",
        "text": "Advance fuselage is much better for pumping than standard. Takes a session or two to get used to. Same weight rider on 1150 — Advance transformed the wing feel.",
        "foils_mentioned": ["PNG 1150"],
        "key_insight": "Advance fuselage dramatically improves pump — 1-2 sessions to adjust",
        "sentiment": "positive",
        "type": "community",
        "date": "2026-02"
    })
    
    # Power Carbon mast insight
    insights.append({
        "id": "exp_power_carbon_mast",
        "source": "community_knowledge",
        "source_label": "Community Consensus",
        "rider": "Multiple Riders",
        "text": "Power Carbon mast is a game changer — stiffest connection possible. More positive feel with immediate response. Essential for ART series and big guys.",
        "foils_mentioned": [],
        "key_insight": "Game-changing stiffness — essential for ART and heavy riders",
        "sentiment": "very_positive",
        "type": "community_consensus",
        "date": "2026-01"
    })
    
    # Modularity praise
    insights.append({
        "id": "exp_modularity",
        "source": "the_foiling_magazine",
        "source_label": "The Foiling Magazine Review",
        "rider": "The Foiling Magazine",
        "rider_type": "media",
        "text": "Everything here is very well engineered and thought out with longevity. It's a solid platform built to last. Parts from early AXIS still work with new components — true buy-once system.",
        "foils_mentioned": [],
        "key_insight": "Best modularity in industry — early parts still compatible with new components",
        "sentiment": "very_positive",
        "type": "media_review",
        "date": "2025"
    })
    
    return insights

def extract_name(text):
    """Extract author name from FB post text."""
    if not text:
        return "Anonymous Rider"
    lines = text.strip().split('\n')
    if lines:
        first_line = lines[0].strip()
        # FB posts often start with the author name
        words = first_line.split()
        if len(words) <= 4 and all(w[0].isupper() for w in words if w):
            return first_line
    return "Anonymous Rider"

def clean_text(text):
    """Clean up FB post text."""
    if not text:
        return ""
    # Remove common FB artifacts
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        l = line.strip().lower()
        if l in ('like', 'reply', 'see more', ''):
            continue
        if l.endswith((' like', ' reply')):
            continue
        if l.startswith(('top contributor', 'group expert', 'rising contributor')):
            continue
        # Skip time indicators like "3d", "1w", "2h"
        if len(l) <= 3 and any(c in l for c in 'dwmhy'):
            continue
        cleaned.append(line.strip())
    return ' '.join(cleaned)

def extract_foils(text):
    """Extract AXIS foil model names from text."""
    if not text:
        return []
    import re
    foils = set()
    # Match common AXIS model patterns
    patterns = [
        r'\b(PNG|BSC|HPS|ART|Spitfire|Fireball|Surge|Tempo|ARTPRO|ART Pro|ART V2|PNG V2)\s*(\d{3,4})\b',
        r'\b(PNG|BSC|HPS|ART|Spitfire|Fireball|Surge|Tempo)\s+(v2\s+)?(\d{3,4})\b',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            if isinstance(m, tuple):
                foils.add(' '.join(p for p in m if p).strip())
            else:
                foils.add(m.strip())
    return list(foils)

def main():
    print("🔧 Building comprehensive rider feedback database...")
    print("=" * 50)
    
    feedback = build_community_feedback()
    
    # Build the output
    output = {
        "meta": {
            "version": "2.0",
            "built_at": datetime.now().isoformat(),
            "total_entries": len(feedback),
            "sources": {
                "facebook_groups": sum(1 for f in feedback if "facebook" in f.get("source", "")),
                "expert_reviews": sum(1 for f in feedback if f.get("type") == "expert"),
                "community_consensus": sum(1 for f in feedback if f.get("type") == "community_consensus"),
                "manufacturer": sum(1 for f in feedback if f.get("type") == "manufacturer"),
                "setup_guides": sum(1 for f in feedback if f.get("type") == "setup_guide"),
                "media_reviews": sum(1 for f in feedback if f.get("type") == "media_review"),
            },
            "description": "Comprehensive rider feedback from FB groups, expert reviews, community knowledge, and AXIS official sources"
        },
        "posts": feedback
    }
    
    # Save to both data and public
    for path in [DATA_DIR / "facebook-riders-feedback.json", PUBLIC_DIR / "facebook-riders-feedback.json"]:
        with open(path, 'w') as f:
            json.dump(output, f, indent=2)
        print(f"💾 Saved to {path}")
    
    print(f"\n📊 TOTAL: {len(feedback)} feedback entries")
    print(f"  - Facebook groups: {output['meta']['sources']['facebook_groups']}")
    print(f"  - Expert reviews: {output['meta']['sources']['expert_reviews']}")
    print(f"  - Community consensus: {output['meta']['sources']['community_consensus']}")
    print(f"  - Manufacturer: {output['meta']['sources']['manufacturer']}")
    print(f"  - Setup guides: {output['meta']['sources']['setup_guides']}")
    print(f"  - Media reviews: {output['meta']['sources']['media_reviews']}")

if __name__ == "__main__":
    main()
