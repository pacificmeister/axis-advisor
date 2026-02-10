#!/usr/bin/env python3
"""
AXIS Foils Data Scraper
Collects official product data from axisfoils.com Shopify API
"""

import json
import requests
import time
from pathlib import Path
from typing import List, Dict

BASE_URL = "https://www.axisfoils.com"

# Collections to scrape
COLLECTIONS = {
    "front-wings": "Front Wings",
    "rear-wings": "Rear Wings",
    "masts": "Masts",
    "fuselages": "Fuselages"
}

def get_collection_products(collection_handle: str) -> List[Dict]:
    """Fetch all products from a collection using Shopify JSON API"""
    
    products = []
    page = 1
    
    while True:
        url = f"{BASE_URL}/collections/{collection_handle}/products.json?limit=250&page={page}"
        print(f"📥 Fetching {collection_handle} (page {page})...")
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('products'):
                break
                
            products.extend(data['products'])
            
            # Check if there are more pages
            if len(data['products']) < 250:
                break
                
            page += 1
            time.sleep(1)  # Be polite
            
        except Exception as e:
            print(f"❌ Error fetching {collection_handle} page {page}: {e}")
            break
    
    print(f"✅ Found {len(products)} products in {collection_handle}")
    return products

def extract_specs_from_title(title: str, product_type: str) -> Dict:
    """Extract specs from product title"""
    
    specs = {
        "name": title,
        "product_type": product_type
    }
    
    # Extract numeric values (area, size, etc.)
    import re
    
    # For front wings: extract area (e.g., "ART 899", "BSC 1060")
    if product_type == "Front Wings":
        area_match = re.search(r'(\d{3,4})', title)
        if area_match:
            specs["area"] = int(area_match.group(1))
        
        # Extract series
        if "ART" in title.upper():
            if "ARTPRO" in title.upper():
                specs["series"] = "ARTPRO"
            else:
                specs["series"] = "ART"
        elif "BSC" in title.upper():
            specs["series"] = "BSC"
        elif "HPS" in title.upper():
            specs["series"] = "HPS"
        elif "PNG" in title.upper():
            specs["series"] = "PNG"
        elif "SP" in title.upper() or "SURF" in title.upper():
            specs["series"] = "SP"
        elif "SPITFIRE" in title.upper():
            specs["series"] = "Spitfire"
        elif "FIREBALL" in title.upper():
            specs["series"] = "Fireball"
        elif "SURGE" in title.upper():
            specs["series"] = "Surge"
        elif "TEMPO" in title.upper():
            specs["series"] = "Tempo"
    
    # For rear wings: extract area and style
    elif product_type == "Rear Wings":
        area_match = re.search(r'(\d{3,4})', title)
        if area_match:
            specs["area"] = int(area_match.group(1))
        
        # Extract style
        if "PROGRESSIVE" in title.upper():
            specs["style"] = "Progressive"
        elif "SKINNY" in title.upper():
            specs["style"] = "Skinny"
        elif "SPEED" in title.upper():
            specs["style"] = "Speed"
        elif "PUMP" in title.upper():
            specs["style"] = "Pump"
        elif "FREERIDE" in title.upper():
            specs["style"] = "Freeride"
    
    # For masts: extract length and material
    elif product_type == "Masts":
        length_match = re.search(r'(\d{2,4})\s*(cm|mm)?', title, re.IGNORECASE)
        if length_match:
            length = int(length_match.group(1))
            # Convert mm to cm if needed
            if length > 200:
                length = length // 10
            specs["length_cm"] = length
        
        # Material
        if "CARBON" in title.upper():
            if "ULTRA" in title.upper() or "PRO" in title.upper():
                specs["material"] = "Ultra High Modulus Carbon"
            elif "HIGH MODULUS" in title.upper():
                specs["material"] = "High Modulus Carbon"
            else:
                specs["material"] = "Carbon"
        elif "ALUMINIUM" in title.upper() or "ALUMINUM" in title.upper():
            specs["material"] = "Aluminium"
    
    return specs

def clean_product_data(product: Dict, collection_type: str) -> Dict:
    """Extract and clean relevant product data"""
    
    # Get first variant for pricing
    variant = product.get('variants', [{}])[0]
    
    # Extract specs from title
    specs = extract_specs_from_title(product['title'], collection_type)
    
    cleaned = {
        "id": product['id'],
        "handle": product['handle'],
        "title": product['title'],
        "product_type": product.get('product_type', collection_type),
        "vendor": product.get('vendor', 'AXIS'),
        "description": product.get('body_html', ''),
        "image": product.get('images', [{}])[0].get('src') if product.get('images') else None,
        "price": variant.get('price'),
        "available": variant.get('available', False),
        "url": f"{BASE_URL}/products/{product['handle']}",
        "specs": specs,
        "tags": product.get('tags', []),
        "created_at": product.get('created_at'),
        "updated_at": product.get('updated_at')
    }
    
    return cleaned

def scrape_all_data():
    """Main scraper function"""
    
    print("🚀 AXIS Foils Data Scraper")
    print("=" * 50)
    
    all_data = {
        "meta": {
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": BASE_URL,
            "version": "1.0"
        },
        "collections": {}
    }
    
    # Scrape each collection
    for handle, name in COLLECTIONS.items():
        print(f"\n📦 Processing: {name}")
        raw_products = get_collection_products(handle)
        
        # Clean and structure the data
        cleaned_products = [
            clean_product_data(p, name) for p in raw_products
        ]
        
        all_data["collections"][handle] = {
            "name": name,
            "count": len(cleaned_products),
            "products": cleaned_products
        }
    
    # Save to file
    output_dir = Path(__file__).parent.parent / "data"
    output_dir.mkdir(exist_ok=True, parents=True)
    
    output_file = output_dir / "axis-products.json"
    with open(output_file, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"\n✅ Data saved to: {output_file}")
    
    # Print summary
    print("\n📊 Summary:")
    for handle, data in all_data["collections"].items():
        print(f"  - {data['name']}: {data['count']} products")
    
    total = sum(d['count'] for d in all_data["collections"].values())
    print(f"\n🎯 Total products scraped: {total}")
    
    return all_data

if __name__ == "__main__":
    scrape_all_data()
