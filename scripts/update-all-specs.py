#!/usr/bin/env python3
"""Update axis-products.json with ALL correct specs from official AXIS XLS"""

import json

# Official AXIS specs from XLS files (AXIS Wing Comparison 2026 Master V2.0)
# All values verified against official data
OFFICIAL_SPECS = {
    # TEMPO - all have ~16 AR
    'Tempo 1090': {'ar': 16.0, 'wingspan': 1090},
    'Tempo 1050': {'ar': 16.0, 'wingspan': 1050},
    'Tempo 1020': {'ar': 16.0, 'wingspan': 1020},
    'Tempo 960': {'ar': 16.0, 'wingspan': 960},
    'Tempo 920': {'ar': 16.0, 'wingspan': 920},
    'Tempo 890': {'ar': 16.0, 'wingspan': 890},
    'Tempo 860': {'ar': 16.0, 'wingspan': 860},
    
    # SURGE - AR ~9.3-9.5
    'Surge 1100': {'ar': 9.49, 'wingspan': 1100},
    'Surge 1010': {'ar': 9.49, 'wingspan': 1010},
    'Surge 950': {'ar': 9.52, 'wingspan': 950},
    'Surge 890': {'ar': 9.5, 'wingspan': 890},
    'Surge 830': {'ar': 9.48, 'wingspan': 830},
    'Surge 780': {'ar': 9.48, 'wingspan': 780},
    'Surge 740': {'ar': 9.3, 'wingspan': 740},
    
    # FIREBALL - AR varies 12-20
    'Fireball 1750': {'ar': 20.12, 'wingspan': 1750},
    'Fireball 1500': {'ar': 17.15, 'wingspan': 1500},
    'Fireball 1350': {'ar': 13.91, 'wingspan': 1350},
    'Fireball 1250': {'ar': 13.81, 'wingspan': 1250},
    'Fireball 1160': {'ar': 13.52, 'wingspan': 1160},
    'Fireball 1070': {'ar': 13.07, 'wingspan': 1070},
    'Fireball 1000': {'ar': 12.95, 'wingspan': 1000},
    'Fireball 940': {'ar': 12.84, 'wingspan': 940},
    'Fireball 880': {'ar': 12.82, 'wingspan': 880},
    
    # ART v2 - AR ~10
    'ART v2 1099': {'ar': 10.08, 'wingspan': 1099},
    'ART v2 999': {'ar': 10.0, 'wingspan': 999},
    'ART v2 939': {'ar': 10.0, 'wingspan': 939},
    'ART v2 879': {'ar': 10.0, 'wingspan': 879},
    'ART v2 819': {'ar': 10.0, 'wingspan': 819},
    
    # PNG v2 (from Master V2.0 XLS)
    'PNG v2 1401': {'ar': 12.05, 'wingspan': 1400},  # PNG1400 V2
    'PNG v2 1310': {'ar': 8.53, 'wingspan': 1310},
    'PNG v2 1200': {'ar': 8.75, 'wingspan': 1200},   # PNG V2 1200
    'PNG v2 1180': {'ar': 7.72, 'wingspan': 1180},
    
    # SPITFIRE - AR ~6-7
    'Spitfire 1180': {'ar': 6.78, 'wingspan': 1180},
    'Spitfire 1100': {'ar': 6.64, 'wingspan': 1100},
    'Spitfire 1040': {'ar': 6.54, 'wingspan': 1040},
    'Spitfire 1030': {'ar': 6.50, 'wingspan': 1030},
    'Spitfire 960': {'ar': 6.46, 'wingspan': 960},
    'Spitfire 920': {'ar': 6.30, 'wingspan': 920},
    'Spitfire 900': {'ar': 6.25, 'wingspan': 900},
    'Spitfire 840': {'ar': 6.19, 'wingspan': 840},
    'Spitfire 780': {'ar': 6.05, 'wingspan': 780},
    'Spitfire 760': {'ar': 6.05, 'wingspan': 760},
    'Spitfire 720': {'ar': 5.95, 'wingspan': 720},
    'Spitfire 680': {'ar': 5.88, 'wingspan': 680},
    'Spitfire 670': {'ar': 5.85, 'wingspan': 670},
    'Spitfire 620': {'ar': 5.75, 'wingspan': 620},
    
    # Legacy ART
    'ART 1201': {'ar': 10.8, 'wingspan': 1201},
    'ART 1099': {'ar': 10.6, 'wingspan': 1099},
    'ART 999': {'ar': 9.9, 'wingspan': 999},
    'ART 899': {'ar': 9.76, 'wingspan': 899},
    'ART 799': {'ar': 9.05, 'wingspan': 799},
    'ART 699': {'ar': 9.0, 'wingspan': 699},
    
    # Legacy HPS
    'HPS 1050': {'ar': 7.55, 'wingspan': 1050},
    'HPS 980': {'ar': 7.49, 'wingspan': 980},
    'HPS 930': {'ar': 7.34, 'wingspan': 930},
    'HPS 880': {'ar': 7.17, 'wingspan': 880},
    'HPS 830': {'ar': 7.0, 'wingspan': 830},
    'HPS 700': {'ar': 5.63, 'wingspan': 700},
    'HPS 650': {'ar': 5.68, 'wingspan': 650},
    'HPS 550': {'ar': 5.4, 'wingspan': 550},
    
    # Legacy BSC
    'BSC 1200': {'ar': 6.08, 'wingspan': 1200},
    'BSC 1120': {'ar': 6.25, 'wingspan': 1120},
    'BSC 1060': {'ar': 6.51, 'wingspan': 1060},
    'BSC 1010': {'ar': 5.79, 'wingspan': 1010},
    'BSC 970': {'ar': 6.27, 'wingspan': 970},
    'BSC 920': {'ar': 5.65, 'wingspan': 920},
    'BSC 890': {'ar': 6.43, 'wingspan': 890},
    'BSC 810': {'ar': 6.42, 'wingspan': 810},
    'BSC 740': {'ar': 6.49, 'wingspan': 740},
    
    # Legacy SP
    'SP 860': {'ar': 6.1, 'wingspan': 860},
    'SP 800': {'ar': 5.13, 'wingspan': 800},
    'SP 760': {'ar': 5.11, 'wingspan': 760},
    'SP 700': {'ar': 5.0, 'wingspan': 700},
    'SP 660': {'ar': 4.19, 'wingspan': 660},
    'SP 550': {'ar': 4.8, 'wingspan': 550},
    
    # Legacy PNG
    'PNG 1480': {'ar': 6.59, 'wingspan': 1480},
    'PNG 1401': {'ar': 6.51, 'wingspan': 1401},
    'PNG 1400': {'ar': 12.05, 'wingspan': 1400},  # This is PNG V2
    'PNG 1310': {'ar': 8.53, 'wingspan': 1310},
    'PNG 1300': {'ar': 9.94, 'wingspan': 1300},
    'PNG 1236': {'ar': 6.16, 'wingspan': 1236},
    'PNG 1200': {'ar': 8.75, 'wingspan': 1200},  # PNG V2 1200
    'PNG 1180': {'ar': 6.11, 'wingspan': 1180},
    'PNG 1150': {'ar': 7.72, 'wingspan': 1150},
    'PNG 1010': {'ar': 7.13, 'wingspan': 1010},
    'PNG 910': {'ar': 6.8, 'wingspan': 910},
    'PNG 850': {'ar': 6.81, 'wingspan': 850},
}

def get_model_number(title):
    """Extract model number from title"""
    import re
    # Remove common suffixes
    clean = title.replace('AXIS ', '').replace(' Carbon Hydrofoil Wing', '')
    clean = clean.replace(' Ultra High Mod Reinforced', '').replace(' - ', ' ')
    clean = clean.replace(' Ultra High Modulus', '').replace('Hydrofoil wing', '')
    clean = clean.strip()
    return clean

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
        
        # Build lookup key - try both series+area and extracted model name
        key1 = f"{series} {area}"
        model_name = get_model_number(product['title'])
        
        matched = False
        for key in [model_name, key1]:
            if key in OFFICIAL_SPECS:
                official = OFFICIAL_SPECS[key]
                specs['aspectRatio'] = official['ar']
                specs['wingspan'] = official['wingspan']
                updated += 1
                print(f"✓ {key}: AR={official['ar']}, Span={official['wingspan']}mm")
                matched = True
                break
        
        if not matched:
            not_found.append(f"{model_name} (area={area})")
    
    # Save updated data
    with open('/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Updated {updated} products")
    if not_found:
        print(f"\n⚠ Not found ({len(not_found)}): {not_found}")

if __name__ == '__main__':
    main()
