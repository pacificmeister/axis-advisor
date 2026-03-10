#!/bin/bash
# ingest-youtube.sh — Download and prepare YouTube transcripts for AXIS Advisor
# Usage: ./ingest-youtube.sh <youtube-url> [output-name]
# 
# Downloads auto-generated English subtitles, cleans them to plain text.
# Output goes to data-sources/youtube-transcripts/cleaned/
# 
# After downloading, use the extraction prompt (see PROMPT below) to 
# extract structured feedback with an LLM.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TRANSCRIPT_DIR="$PROJECT_DIR/data-sources/youtube-transcripts"
CLEANED_DIR="$TRANSCRIPT_DIR/cleaned"

mkdir -p "$TRANSCRIPT_DIR" "$CLEANED_DIR"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <youtube-url> [output-name]"
    echo ""
    echo "Examples:"
    echo "  $0 https://www.youtube.com/watch?v=iYxYwu15cuE axis-range-review"
    echo "  $0 https://youtu.be/OamwSb6DKDY tempo-deep-dive"
    exit 1
fi

URL="$1"
NAME="${2:-$(echo "$URL" | grep -oP 'v=\K[^&]+' || echo 'video')}"

echo "📥 Downloading transcript for: $URL"
echo "   Output name: $NAME"

# Download VTT
cd "$TRANSCRIPT_DIR"
yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "$NAME" "$URL" 2>&1

if [ ! -f "$NAME.en.vtt" ]; then
    echo "❌ No English subtitles found for this video"
    exit 1
fi

# Clean VTT to plain text
python3 "$PROJECT_DIR/data-sources/clean-vtt.py"

echo ""
echo "✅ Transcript ready at: $CLEANED_DIR/$NAME.txt"
echo ""
echo "Next: Run LLM extraction to add to youtube-feedback.json"
echo "See: $PROJECT_DIR/data-sources/EXTRACTION-PROMPT.md"
