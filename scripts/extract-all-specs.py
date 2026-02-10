#!/usr/bin/env python3
"""
Extract detailed specs from AXIS family table images
"""
import requests
import re
from bs4 import BeautifulSoup

# Sample product from each series to find family tables
series_samples = {
    'Spitfire': 'spitfire-1180',
    'ART v2': 'artv2-999',
    'Fireball': 'fireball-1000',
    'PNG': 'png-1150',
    'Surge': 'surge-890',
    'Tempo': 'tempo-920',
    'ART': 'art-999-carbon-hydrofoil-wing',
    'BSC': 'bsc-890-carbon-hydrofoil-wing',
    'HPS': 'hps-980-carbon-hydrofoil-wing',
}

for series, handle in series_samples.items():
    url = f"https://axisfoils.com/products/{handle}"
    print(f"\n📊 {series}")
    print(f"   URL: {url}")
    
    try:
        r = requests.get(url, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Find family table images
        imgs = soup.find_all('img')
        table_imgs = [img for img in imgs if 'table' in img.get('src', '').lower() or 'family' in img.get('src', '').lower()]
        
        for img in table_imgs:
            src = img.get('src', '')
            if src.startswith('//'):
                src = 'https:' + src
            elif not src.startswith('http'):
                continue
            print(f"   📷 {src}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
