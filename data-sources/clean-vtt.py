#!/usr/bin/env python3
"""Clean VTT subtitle files into readable plain text transcripts."""
import re
import sys
import glob
import os

def clean_vtt(vtt_path):
    with open(vtt_path, 'r') as f:
        content = f.read()
    
    # Remove VTT header
    content = re.sub(r'^WEBVTT\n.*?\n\n', '', content, flags=re.DOTALL)
    
    # Remove timestamps and position info
    lines = content.split('\n')
    text_lines = []
    seen = set()
    
    for line in lines:
        line = line.strip()
        # Skip timestamp lines
        if re.match(r'\d{2}:\d{2}:\d{2}\.\d{3}\s*-->', line):
            continue
        # Skip empty lines and numeric sequence lines
        if not line or re.match(r'^\d+$', line):
            continue
        # Skip position/alignment tags
        if line.startswith('Kind:') or line.startswith('Language:'):
            continue
        
        # Remove HTML-like tags
        line = re.sub(r'<[^>]+>', '', line)
        # Remove [Music], [Applause] etc
        line = re.sub(r'\[.*?\]', '', line).strip()
        
        if not line:
            continue
            
        # Deduplicate consecutive identical lines (common in auto-subs)
        if line not in seen:
            text_lines.append(line)
            # Only track last N lines for dedup (auto-subs repeat with slight overlap)
            seen.add(line)
            if len(seen) > 5:
                seen = set(text_lines[-5:])
    
    return ' '.join(text_lines)

def main():
    vtt_dir = os.path.join(os.path.dirname(__file__), 'youtube-transcripts')
    out_dir = os.path.join(vtt_dir, 'cleaned')
    os.makedirs(out_dir, exist_ok=True)
    
    for vtt_file in sorted(glob.glob(os.path.join(vtt_dir, '*.vtt'))):
        basename = os.path.basename(vtt_file).replace('.en.vtt', '')
        text = clean_vtt(vtt_file)
        
        # Word-wrap at ~100 chars for readability
        words = text.split()
        lines = []
        current = []
        for word in words:
            current.append(word)
            if len(' '.join(current)) > 100:
                lines.append(' '.join(current))
                current = []
        if current:
            lines.append(' '.join(current))
        
        out_path = os.path.join(out_dir, f'{basename}.txt')
        with open(out_path, 'w') as f:
            f.write('\n'.join(lines))
        
        print(f"✅ {basename}: {len(words)} words → {out_path}")

if __name__ == '__main__':
    main()
