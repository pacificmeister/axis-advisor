#!/usr/bin/env python3
"""Quick scraper for Spitfire series"""
import json
import requests

url = "https://www.axisfoils.com/collections/spitfire/products.json?limit=250"
response = requests.get(url, timeout=30)
data = response.json()

spitfires = []
for p in data['products']:
    product = {
        "id": p['id'],
        "handle": p['handle'],
        "title": p['title'],
        "product_type": p['product_type'],
        "vendor": p['vendor'],
        "description": p.get('body_html', ''),
        "image": p['images'][0]['src'] if p['images'] else None,
        "price": p['variants'][0]['price'] if p['variants'] else None,
        "available": p['variants'][0]['available'] if p['variants'] else False,
        "url": f"https://www.axisfoils.com/products/{p['handle']}",
        "specs": {
            "name": p['title'],
            "product_type": "Front Wings",
            "series": "Spitfire"
        },
        "tags": p.get('tags', []),
        "created_at": p['created_at'],
        "updated_at": p['updated_at']
    }
    
    # Extract area
    import re
    area_match = re.search(r'(\d{3,4})', p['title'])
    if area_match:
        product['specs']['area'] = int(area_match.group(1))
    
    spitfires.append(product)

print(json.dumps(spitfires, indent=2))
print(f"\n✅ Found {len(spitfires)} Spitfire foils", file=open('/dev/stderr', 'w'))
