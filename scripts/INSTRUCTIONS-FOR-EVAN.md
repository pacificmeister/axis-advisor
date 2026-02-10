# Facebook Scraper - Instructions for Evan

## Quick Start (5 minutes)

### Step 1: Install Requirements (one-time)

Open Terminal/Command Prompt and run:

```bash
pip3 install playwright
playwright install chromium
```

### Step 2: Download the Script

Save this file to your computer:
`scrape-axis-riders-STANDALONE.py`

(Herbert will send you the file via WhatsApp or you can copy from server)

### Step 3: Run It

```bash
cd ~/Downloads  # or wherever you saved it
python3 scrape-axis-riders-STANDALONE.py
```

### What Happens:

1. **Browser opens** - Chromium launches automatically
2. **Loads Facebook** - Navigates to AXIS Riders group
3. **Check login**:
   - ✅ If logged in → continues automatically
   - ❌ If not logged in → prompts you to log in manually, then press Enter
4. **Scrolls page** - Loads ~100 posts (takes ~20 seconds)
5. **Extracts data** - Finds foil mentions, weights, use cases
6. **Saves JSON** - Creates `~/axis-riders-data.json`
7. **Shows summary** - Prints statistics

### Step 4: Send Results

The script creates a file in your home directory:
- **Mac/Linux:** `~/axis-riders-data.json`
- **Windows:** `C:\Users\YourName\axis-riders-data.json`

**Send this JSON file to Herbert via WhatsApp**

## Troubleshooting

### "playwright not found"
```bash
pip3 install --user playwright
playwright install chromium
```

### "python3 not found" (Windows)
Use `python` instead:
```bash
python scrape-axis-riders-STANDALONE.py
```

### Browser doesn't open
Make sure you installed chromium:
```bash
playwright install chromium
```

### Not logged into Facebook
When prompted:
1. Log into Facebook in the browser window
2. Navigate to the AXIS Riders group
3. Verify you see posts
4. Go back to Terminal and press Enter

## What Gets Extracted

The scraper looks for:
- **Foil mentions**: "ART 899", "BSC 1060", etc.
- **Rider weight**: "175 lbs", "80 kg", etc.
- **Use case**: wing, prone, SUP, downwind, pump, kite
- **Sentiment**: positive/negative/neutral

## Privacy

- Runs locally on your machine
- Only extracts public group posts
- No passwords or personal data collected
- Output is anonymous snippets for analysis

## Questions?

Send Herbert a message on WhatsApp!
