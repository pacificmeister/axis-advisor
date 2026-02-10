# AXIS Advisor - Official Foil Comparison Tool

Built for AXIS Foils to provide an official, brand-controlled comparison tool with anti-counterfeit features.

## 🚀 Features

### Phase 1 (COMPLETE)
- ✅ Official AXIS product data scraping (120 products)
- ✅ Multi-foil comparison (2-4 foils side-by-side)
- ✅ Series-based browsing (ARTPRO, ART, HPS, BSC, PNG, SP, etc.)
- ✅ Price & specs display
- ✅ Direct links to axisfoils.com

### Phase 2 (IN PROGRESS)
- ⏳ Radar chart performance metrics
- ⏳ Smart recommendation wizard
- ⏳ Filter & search functionality

### Phase 3 (PLANNED)
- ⏳ Anti-counterfeit features ("How to Spot Fakes")
- ⏳ Authorized dealer finder
- ⏳ Price reality check
- ⏳ Report suspicious listing

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data:** Static JSON (no database needed)
- **Hosting:** Vercel / Netlify (recommended)

## 📦 Project Structure

```
axis-advisor/
├── app/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── FoilSelector.tsx
│   │   └── FoilComparison.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── data/
│   └── axis-products.json (120 products)
├── scripts/
│   └── scrape-axis-data.py (data scraper)
└── public/
    └── data/
        └── axis-products.json
```

## 🏃 Development

### Install Dependencies
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Update Product Data
```bash
python3 scripts/scrape-axis-data.py
cp data/axis-products.json public/data/
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Static Export
```bash
npm run build
# Deploy the `.next` folder to any static host
```

## 📊 Data Schema

```typescript
interface Product {
  id: number;
  handle: string;
  title: string;
  description: string;
  image: string;
  price: string;
  specs: {
    area?: number;
    series?: string;
  };
}
```

## 🔄 Data Updates

Run the scraper weekly to keep product data fresh:
```bash
python3 scripts/scrape-axis-data.py
```

## 🎯 Roadmap

### Next Features
1. **Smart Recommendations** - "I weigh X, want to Y" → suggested foils
2. **Radar Charts** - Visual performance comparison
3. **Anti-Counterfeit Hub** - Spot fakes, find authorized dealers
4. **Verified Reviews** - Require proof of purchase
5. **Analytics** - Track which foils get compared most

### Future Enhancements
- Admin panel for AXIS team
- User accounts (save favorites)
- Mobile app
- API for retailers

## 📝 License

Built for AXIS Foils. All product data © AXIS Foils.

## 🔗 Links

- **AXIS Foils:** https://axisfoils.com
- **Support:** info@axisfoils.com
