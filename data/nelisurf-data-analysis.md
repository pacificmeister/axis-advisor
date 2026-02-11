# Nelisurf Dataset Analysis

**Date:** 2026-02-10  
**Source:** https://axis-foils-advisor-by-nelisurf-129112974630.us-west1.run.app/  
**Dataset:** Public Firestore database (76 foils)

## 🚨 CRITICAL FINDINGS

### ❌ ACCURACY ISSUES (58/58 foils checked have errors)

**Surface Area Discrepancies:**
- BSC 1120: Shows 2102 cm² (should be 1120 cm²) - **OFF BY 982 cm²**
- PNG 1310: Shows 2080 cm² (should be 1310 cm²) - **OFF BY 770 cm²**
- Tempo series: Shows 495-578 cm² (should be ~1090 cm²) - **OFF BY 500+ cm²**
- Spitfire 620: Shows 628 cm² (should be 1180 cm²) - **OFF BY 552 cm²**

**Pattern:** The area data appears to be using PROJECTED AREA or incorrect calculations rather than ACTUAL SURFACE AREA that AXIS advertises.

### 📝 "Reviews" Are NOT User Reviews

**Analysis of Pro's/Con's text:**
- ✅ Editorial voice (3rd person: "they", "riders", "designed for")
- ❌ NO user attributions (no names, dates, or sources cited)
- ❌ NO first-person experiences ("I", "my experience")
- 💡 **Conclusion:** This is synthesized editorial content, not real customer feedback

**Example (ART PRO series):**
> "They turn sluggishly due to the massive wingspans (e.g., 1201/1401) and feel like 'big foils.' They are difficult to pump for heavy riders..."

This reads like editorial commentary, not a direct user quote.

## ✅ WHAT THEY HAVE THAT WE DON'T

### Valuable Data (if accurate):
- Aspect Ratio
- Wingspan (mm)
- Volume (cm³)
- Chord (mm)
- Projected Area vs Actual Area

### Editorial Content:
- Pro's/Con's descriptions (editorial summaries, not user reviews)
- Product descriptions

## 📊 DATASET COMPARISON

| Metric | Nelisurf | Our Data (Official AXIS) |
|--------|----------|--------------------------|
| **Total foils** | 76 | 66 |
| **Data source** | Unknown/Firebase | Official AXIS website |
| **Accuracy** | ❌ Major errors | ✅ Verified |
| **Specs coverage** | AR, wingspan, volume, chord | Area, price, availability |
| **"Reviews"** | Editorial content | None (can add real FB reviews) |

## 🔎 DATA SOURCE INVESTIGATION

**Where did their data come from?**
- ❌ NOT from official AXIS site (areas don't match)
- ❌ NOT from real user reviews (no attributions)
- 🤔 Possibly:
  - Manual entry with errors
  - Calculated from photos/estimates
  - AI-generated descriptions
  - Combination of forums/speculation

**Red flags:**
- Public Firestore database (no authentication)
- No source attribution
- Significant accuracy issues
- Generic editorial descriptions

## 💡 RECOMMENDATIONS

### DO NOT USE for:
- ❌ Surface area data (highly inaccurate)
- ❌ User reviews/feedback (not real reviews)
- ❌ Official product specs

### COULD USE for (with verification):
- ⚠️ Aspect ratio / wingspan / volume (needs verification against official sources)
- ⚠️ Pro/con summaries (as editorial opinion only, not fact)

### BETTER APPROACH:
1. ✅ Use official AXIS data for all core specs
2. ✅ Extract AR/wingspan/volume from AXIS family table images (in progress)
3. ✅ Use REAL user reviews from Facebook AXIS Riders group (64 posts collected)
4. ✅ Verify any nelisurf data against official sources before using

## 📁 FILES

**Nelisurf data saved to:**
- `/home/ubuntu/clawd/nelisurf-data-raw.json` (raw Firestore export)
- `/home/ubuntu/clawd/nelisurf-data-cleaned.json` (parsed/cleaned)

**Our official data:**
- `/home/ubuntu/clawd/axis-advisor/public/data/axis-products.json` (66 foils, verified)

**Kept separate as requested.**
