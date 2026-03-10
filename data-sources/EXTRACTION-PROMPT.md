# YouTube Transcript Extraction Prompt

Use this prompt template when extracting feedback from new YouTube transcripts.
Pass the transcript content and this prompt to an LLM.

## Prompt

```
Extract structured AXIS foil product feedback from this YouTube video transcript.

Video: [TITLE] ([DATE]) by [REVIEWER] - [URL]

For each SPECIFIC FOIL discussed, create an entry:

{
  "id": "yt_[video-id]_[foil-series-lowercase]_[size]",
  "source": "youtube",
  "source_label": "[video title]",
  "source_url": "[youtube url]",
  "rider": "[reviewer name or 'Unknown Reviewer']",
  "rider_authority": "[designer|experienced|community]",
  "text": "[concise summary, 1-3 sentences]",
  "foils_mentioned": ["SERIES SIZE"],
  "key_insight": "[single most important takeaway]",
  "sentiment": "positive|neutral|negative|mixed",
  "use_case": "downwind|winging|prone|pumping|kite|tow|allround",
  "date": "[ISO date]"
}

Rules:
- ONE entry per specific foil, not per video
- Official series: PNG, PNG V2, ART, ART Pro, ART V2, Spitfire, Fireball, Surge, Tempo
- Include size numbers when mentioned
- Extract REAL insights, not generic
- Adrian Roper = rider_authority: "designer"
- For comparisons, list ALL compared foils in foils_mentioned
```

## Authority Levels
- **designer**: Adrian Roper (AXIS CEO/chief designer)
- **experienced**: Detailed, multi-session reviews with specific data points
- **community**: Casual mentions, brief impressions

## After Extraction
1. Merge new entries into `public/data/youtube-feedback.json`
2. Update `meta.video_count` and `meta.videos` array
3. Commit and push to deploy
