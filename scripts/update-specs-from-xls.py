#!/usr/bin/env python3
"""Update axis-products.json with correct specs from official AXIS XLS"""

import json
import re

# Official AXIS specs from XLS files
# Format: { 'Series Area': {'ar': AR, 'wingspan': mm, 'area': cm²} }
OFFICIAL_SPECS = {
    # TEMPO (from 7cd09708 XLS - wingspan mm x area cm / AR)
    'Tempo 1090': {'ar': 16.0, 'wingspan': 1090, 'area': 745},
    'Tempo 1020': {'ar': 16.0, 'wingspan': 1020, 'area': 650},
    'Tempo 960': {'ar': 16.0, 'wingspan': 960, 'area': 575},
    'Tempo 920': {'ar': 16.0, 'wingspan': 920, 'area': 530},
    'Tempo 890': {'ar': 16.0, 'wingspan': 890, 'area': 495},
    
    # SURGE (from 7cd09708 XLS - wingspan mm x chord mm / AR)
    'Surge 1010': {'ar': 9.49, 'wingspan': 1010, 'area': 1010},  # need actual area
    'Surge 950': {'ar': 9.52, 'wingspan': 950, 'area': 950},
    'Surge 890': {'ar': 9.5, 'wingspan': 890, 'area': 890},
    'Surge 830': {'ar': 9.48, 'wingspan': 830, 'area': 830},
    'Surge 780': {'ar': 9.48, 'wingspan': 780, 'area': 780},
    'Surge 740': {'ar': 9.3, 'wingspan': 740, 'area': 740},
    
    # FIREBALL (from 7cd09708 XLS)
    'Fireball 1750': {'ar': 20.12, 'wingspan': 1750, 'area': 1750},
    'Fireball 1500': {'ar': 17.15, 'wingspan': 1500, 'area': 1500},
    'Fireball 1350': {'ar': 13.91, 'wingspan': 1350, 'area': 1350},
    'Fireball 1250': {'ar': 13.81, 'wingspan': 1250, 'area': 1250},
    'Fireball 1160': {'ar': 13.52, 'wingspan': 1160, 'area': 1160},
    'Fireball 1070': {'ar': 13.07, 'wingspan': 1070, 'area': 1070},
    'Fireball 1000': {'ar': 12.95, 'wingspan': 1000, 'area': 1000},
    'Fireball 940': {'ar': 12.84, 'wingspan': 940, 'area': 940},
    'Fireball 880': {'ar': 12.82, 'wingspan': 880, 'area': 880},
    
    # ART v2 (from 7cd09708 XLS)
    'ART v2 1099': {'ar': 10.08, 'wingspan': 1099, 'area': 1099},
    'ART v2 999': {'ar': 10.08, 'wingspan': 999, 'area': 999},
    'ART v2 939': {'ar': 10.08, 'wingspan': 939, 'area': 939},
    'ART v2 879': {'ar': 10.08, 'wingspan': 879, 'area': 879},
    
    # PNG v2 (need to verify)
    'PNG v2 1401': {'ar': 7.5, 'wingspan': 1401, 'area': 1401},
    'PNG v2 1310': {'ar': 8.53, 'wingspan': 1310, 'area': 1310},
    'PNG v2 1180': {'ar': 7.72, 'wingspan': 1180, 'area': 1180},
    
    # SPITFIRE (from 89a0cbf1 XLS)
    'Spitfire 1180': {'ar': 6.8, 'wingspan': 1180, 'area': 1180},
    'Spitfire 1100': {'ar': 6.8, 'wingspan': 1100, 'area': 1100},
    'Spitfire 1040': {'ar': 6.8, 'wingspan': 1040, 'area': 1040},
    'Spitfire 960': {'ar': 6.8, 'wingspan': 960, 'area': 960},
    'Spitfire 920': {'ar': 6.8, 'wingspan': 920, 'area': 920},
    'Spitfire 840': {'ar': 6.8, 'wingspan': 840, 'area': 840},
    'Spitfire 760': {'ar': 6.8, 'wingspan': 760, 'area': 760},
    'Spitfire 680': {'ar': 6.8, 'wingspan': 680, 'area': 680},
    
    # Legacy ART (from 89a0cbf1 XLS)
    'ART 1099': {'ar': 10.6, 'wingspan': 1099, 'area': 1144},
    'ART 999': {'ar': 9.9, 'wingspan': 999, 'area': 1038},
    'ART 899': {'ar': 9.76, 'wingspan': 899, 'area': 830},
    'ART 799': {'ar': 9.05, 'wingspan': 799, 'area': 730},
    'ART 699': {'ar': 9.0, 'wingspan': 699, 'area': 699},
    
    # Legacy HPS (from 89a0cbf1 XLS) 
    'HPS 1050': {'ar': 7.55, 'wingspan': 1050, 'area': 1502},
    'HPS 980': {'ar': 7.49, 'wingspan': 980, 'area': 1322},
    'HPS 930': {'ar': 7.34, 'wingspan': 930, 'area': 1214},
    'HPS 880': {'ar': 7.17, 'wingspan': 880, 'area': 1111},
    'HPS 830': {'ar': 7.0, 'wingspan': 830, 'area': 1014},
    'HPS 700': {'ar': 5.63, 'wingspan': 700, 'area': 890},
    'HPS 650': {'ar': 5.68, 'wingspan': 650, 'area': 769},
    
    # Legacy BSC (from 89a0cbf1 XLS)
    'BSC 1120': {'ar': 6.25, 'wingspan': 1120, 'area': 2102},
    'BSC 1060': {'ar': 6.51, 'wingspan': 1060, 'area': 1802},
    'BSC 970': {'ar': 6.27, 'wingspan': 970, 'area': 1572},
    'BSC 890': {'ar': 6.43, 'wingspan': 890, 'area': 1290},
    'BSC 810': {'ar': 6.42, 'wingspan': 810, 'area': 1070},
    'BSC 740': {'ar': 6.49, 'wingspan': 740, 'area': 883},
    
    # Legacy SP (from 89a0cbf1 XLS)
    'SP 860': {'ar': 6.1, 'wingspan': 860, 'area': 1293},
    'SP 760': {'ar': 5.11, 'wingspan': 760, 'area': 1218},
    'SP 660': {'ar': 4.19, 'wingspan': 660, 'area': 1113},
    
    # Legacy PNG (from 89a0cbf1 XLS)
    'PNG 1310': {'ar': 8.53, 'wingspan': 1310, 'area': 2080},
    'PNG 1300': {'ar': 9.94, 'wingspan': 1300, 'area': 1712},
    'PNG 1150': {'ar': 7.72, 'wingspan': 1150, 'area': 1777},
    'PNG 1010': {'ar': 7.13, 'wingspan': 1010, 'area': 1430},
    'PNG 910': {'ar': 6.8, 'wingspan': 910, 'area': 1267},
    'PNG 850': {'ar': 6.81, 'wingspan': 850, 'area': 1102},
}

def main():
    # Load current data
    with open('/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json', 'r') as f:
        data = json.load(f)
    
    products = data['collections']['front-wings']['products']
    updated = 0
    not_found = []
    
    for product in products:
        specs = product['specs']
        series = specs.get('series', '')
        area = specs.get('area', 0)
        
        # Build lookup key
        key = f"{series} {area}"
        
        if key in OFFICIAL_SPECS:
            official = OFFICIAL_SPECS[key]
            specs['aspectRatio'] = official['ar']
            specs['wingspan'] = official['wingspan']
            updated += 1
            print(f"✓ {key}: AR={official['ar']}, Span={official['wingspan']}mm")
        else:
            not_found.append(key)
    
    # Save updated data
    with open('/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Updated {updated} products")
    if not_found:
        print(f"\n⚠ Not found in official specs: {not_found[:10]}")

if __name__ == '__main__':
    main()
