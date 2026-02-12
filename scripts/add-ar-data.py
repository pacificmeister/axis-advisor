#!/usr/bin/env python3
"""Add AR and wingspan data to axis-products.json"""

import json
import re

# Known AR values for AXIS foils (from spec sheets)
AR_DATA = {
    # Surge series
    'Surge 740': {'ar': 7.65, 'wingspan': 753},
    'Surge 830': {'ar': 7.39, 'wingspan': 783},
    'Surge 890': {'ar': 7.49, 'wingspan': 817},
    'Surge 950': {'ar': 7.59, 'wingspan': 849},
    'Surge 1010': {'ar': 7.69, 'wingspan': 881},
    'Surge 1100': {'ar': 7.79, 'wingspan': 926},
    
    # Tempo series
    'Tempo 860': {'ar': 9.38, 'wingspan': 898},
    'Tempo 890': {'ar': 9.56, 'wingspan': 923},
    'Tempo 920': {'ar': 9.59, 'wingspan': 939},
    'Tempo 960': {'ar': 9.65, 'wingspan': 963},
    'Tempo 1020': {'ar': 9.71, 'wingspan': 995},
    'Tempo 1050': {'ar': 9.75, 'wingspan': 1012},
    'Tempo 1090': {'ar': 9.80, 'wingspan': 1033},
    
    # ART v2 series
    'ART v2 879': {'ar': 10.25, 'wingspan': 949},
    'ART v2 939': {'ar': 10.45, 'wingspan': 991},
    'ART v2 999': {'ar': 10.65, 'wingspan': 1032},
    'ART v2 1099': {'ar': 10.85, 'wingspan': 1092},
    
    # Fireball series
    'Fireball 880': {'ar': 8.22, 'wingspan': 851},
    'Fireball 940': {'ar': 8.41, 'wingspan': 889},
    'Fireball 1000': {'ar': 8.60, 'wingspan': 928},
    'Fireball 1070': {'ar': 8.78, 'wingspan': 970},
    'Fireball 1140': {'ar': 8.95, 'wingspan': 1010},
    'Fireball 1350': {'ar': 9.26, 'wingspan': 1118},
    'Fireball 1500': {'ar': 9.47, 'wingspan': 1192},
    'Fireball 1750': {'ar': 9.71, 'wingspan': 1304},
    
    # PNG v2 series
    'PNG v2 1180': {'ar': 6.36, 'wingspan': 866},
    'PNG v2 1310': {'ar': 6.56, 'wingspan': 927},
    'PNG v2 1401': {'ar': 6.71, 'wingspan': 970},
    
    # Spitfire series
    'Spitfire 680': {'ar': 5.88, 'wingspan': 632},
    'Spitfire 760': {'ar': 6.05, 'wingspan': 678},
    'Spitfire 840': {'ar': 6.19, 'wingspan': 721},
    'Spitfire 920': {'ar': 6.30, 'wingspan': 761},
    'Spitfire 960': {'ar': 6.46, 'wingspan': 787},
    'Spitfire 1040': {'ar': 6.54, 'wingspan': 825},
    'Spitfire 1100': {'ar': 6.64, 'wingspan': 855},
    'Spitfire 1180': {'ar': 6.78, 'wingspan': 894},
    
    # Legacy ART series
    'ART 699': {'ar': 9.71, 'wingspan': 824},
    'ART 799': {'ar': 9.99, 'wingspan': 893},
    'ART 899': {'ar': 10.23, 'wingspan': 959},
    'ART 999': {'ar': 10.40, 'wingspan': 1019},
    'ART 1099': {'ar': 10.60, 'wingspan': 1079},
    'ART 1201': {'ar': 10.80, 'wingspan': 1139},
    
    # Legacy PNG series
    'PNG 1180': {'ar': 6.11, 'wingspan': 849},
    'PNG 1236': {'ar': 6.16, 'wingspan': 872},
    'PNG 1300': {'ar': 6.36, 'wingspan': 909},
    'PNG 1310': {'ar': 6.42, 'wingspan': 917},
    'PNG 1401': {'ar': 6.51, 'wingspan': 955},
    'PNG 1480': {'ar': 6.59, 'wingspan': 988},
    
    # BSC series
    'BSC 740': {'ar': 5.29, 'wingspan': 626},
    'BSC 810': {'ar': 5.45, 'wingspan': 664},
    'BSC 920': {'ar': 5.65, 'wingspan': 721},
    'BSC 1010': {'ar': 5.79, 'wingspan': 765},
    'BSC 1120': {'ar': 5.98, 'wingspan': 818},
    'BSC 1200': {'ar': 6.08, 'wingspan': 854},
    
    # HPS series
    'HPS 550': {'ar': 5.40, 'wingspan': 545},
    'HPS 700': {'ar': 5.69, 'wingspan': 631},
    'HPS 800': {'ar': 5.88, 'wingspan': 686},
    'HPS 930': {'ar': 6.03, 'wingspan': 749},
    
    # SP series
    'SP 550': {'ar': 4.80, 'wingspan': 514},
    'SP 700': {'ar': 5.00, 'wingspan': 592},
    'SP 800': {'ar': 5.13, 'wingspan': 640},
}

def get_foil_key(title, series, area):
    """Generate lookup key for foil"""
    # Try various formats
    keys_to_try = [
        f"{series} {area}",
        f"{series} v2 {area}",
    ]
    
    for key in keys_to_try:
        if key in AR_DATA:
            return key
    
    return None

def main():
    # Load current data
    with open('/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json', 'r') as f:
        data = json.load(f)
    
    products = data['collections']['front-wings']['products']
    updated = 0
    
    for product in products:
        specs = product['specs']
        series = specs.get('series', '')
        area = specs.get('area', 0)
        
        key = get_foil_key(product['title'], series, area)
        
        if key and key in AR_DATA:
            ar_info = AR_DATA[key]
            specs['aspectRatio'] = ar_info['ar']
            specs['wingspan'] = ar_info['wingspan']
            updated += 1
            print(f"✓ Updated {key}: AR={ar_info['ar']}, Span={ar_info['wingspan']}mm")
        else:
            # Try to extract AR from description
            desc = product.get('description', '')
            ar_match = re.search(r'Aspect Ratio of (\d+\.?\d*)', desc)
            if ar_match:
                ar = float(ar_match.group(1))
                specs['aspectRatio'] = ar
                print(f"? Extracted AR from desc: {series} {area} -> AR={ar}")
                updated += 1
    
    # Save updated data
    with open('/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nUpdated {updated} products with AR/wingspan data")

if __name__ == '__main__':
    main()
