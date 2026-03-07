#!/usr/bin/env python3
"""
Merge Evan's precise tech specs into the product data.
Adds: span_mm, true_area, projected_area, volume, aspect_ratio, max_chord, mean_chord
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
PUBLIC_DIR = Path(__file__).parent.parent / "public" / "data"

def normalize_name(name):
    """Normalize foil name for matching."""
    n = name.upper().strip()
    n = re.sub(r'\s+', '', n)
    n = n.replace('CARBON', '').replace('HYDROFOIL', '').replace('WING', '').replace('FOIL', '')
    return n

def match_evan_to_product(evan_name, product_title):
    """Try to match Evan spec name to Shopify product title."""
    en = normalize_name(evan_name)
    pt = normalize_name(product_title)
    
    # Direct containment
    if en in pt or pt in en:
        return True
    
    # Extract model number from both
    evan_nums = re.findall(r'\d{3,4}', evan_name)
    prod_nums = re.findall(r'\d{3,4}', product_title)
    
    # Extract series from Evan name
    evan_series = re.match(r'^([A-Za-z]+)', evan_name)
    evan_series = evan_series.group(1).upper() if evan_series else ""
    
    # Check if series + number match
    if evan_nums and prod_nums:
        for en in evan_nums:
            for pn in prod_nums:
                if en == pn:
                    # Same number - check series too
                    if evan_series and evan_series in pt:
                        return True
                    # If evan name is just a number, it's a legacy wing
                    if not evan_series or evan_series in ('V', 'ORIGINAL'):
                        continue
    
    return False

def main():
    # Load data
    products = json.load(open(DATA_DIR / "axis-products.json"))
    evan_specs = json.load(open(DATA_DIR / "evan-tech-specs.json"))
    moments = json.load(open(DATA_DIR / "moments-data.json"))
    
    front_wings = products["collections"]["front-wings"]["products"]
    evan_wings = evan_specs.get("front_wings", [])
    
    # Build moments lookup
    moments_lookup = {}
    for m in moments:
        key = normalize_name(m["name"])
        moments_lookup[key] = m
    
    matched = 0
    unmatched_evan = []
    
    for ew in evan_wings:
        found = False
        for fw in front_wings:
            if match_evan_to_product(ew["name"], fw["title"]):
                # Merge specs
                fw["evan_specs"] = {
                    "span_mm": ew.get("span_mm"),
                    "max_chord_mm": ew.get("max_chord_mm"),
                    "mean_chord_mm": round(ew.get("mean_chord_mm", 0), 1) if ew.get("mean_chord_mm") else None,
                    "true_area_cm2": ew.get("true_area_cm2"),
                    "projected_area_cm2": ew.get("projected_area_cm2"),
                    "volume_cm3": ew.get("volume_cm3"),
                    "aspect_ratio": round(ew.get("aspect_ratio", 0), 2) if ew.get("aspect_ratio") else None,
                }
                
                # Also update the main specs if they're missing
                if not fw.get("specs"):
                    fw["specs"] = {}
                if ew.get("true_area_cm2") and not fw["specs"].get("trueArea"):
                    fw["specs"]["trueArea"] = ew["true_area_cm2"]
                if ew.get("aspect_ratio") and not fw["specs"].get("aspectRatio"):
                    fw["specs"]["aspectRatio"] = round(ew["aspect_ratio"], 2)
                if ew.get("span_mm") and not fw["specs"].get("wingspan"):
                    fw["specs"]["wingspan"] = ew["span_mm"]
                if ew.get("max_chord_mm") and not fw["specs"].get("chord"):
                    fw["specs"]["chord"] = ew["max_chord_mm"]
                
                # Add moments data if available
                ew_key = normalize_name(ew["name"])
                if ew_key in moments_lookup:
                    md = moments_lookup[ew_key]
                    fw["evan_specs"]["rollMoment"] = md.get("rollMoment")
                    fw["evan_specs"]["pitchMoment"] = md.get("pitchMoment")
                
                matched += 1
                found = True
                print(f"✅ {ew['name']} → {fw['title']}")
                break
        
        if not found:
            unmatched_evan.append(ew["name"])
    
    print(f"\n📊 Matched: {matched}/{len(evan_wings)} Evan specs to products")
    if unmatched_evan:
        print(f"⚠️ Unmatched: {', '.join(unmatched_evan)}")
    
    # Save
    for path in [DATA_DIR / "axis-products.json", PUBLIC_DIR / "axis-products.json"]:
        with open(path, 'w') as f:
            json.dump(products, f, indent=2)
        print(f"💾 Saved to {path}")

if __name__ == "__main__":
    main()
