#!/usr/bin/env python3
"""
Fetch Quran recitation timings from Quran.com API v4 for Maher Al Muaiqly (Reciter ID 159).
Uses the timestamps format from quran.com API.

API Response format:
{
    "audio_file": {
        "id": 25180,
        "chapter_id": 1,
        "file_size": 753249.0,
        "format": "mp3",
        "audio_url": "https://download.quranicaudio.com/quran/maher_almu3aiqly/year1440//001.mp3",
        "timestamps": [
            {"verse_key": "1:1", "timestamp_from": 0, "timestamp_to": 5003, "duration": 5003, "segments": []},
            ...
        ]
    }
}
"""

import json
import time
import requests

# Quran.com API v4 endpoint for Maher Al Muaiqly (Reciter ID 159 - Year 1440 recitation)
RECITER_ID = 159
BASE_URL = f"https://api.quran.com/api/v4/chapter_recitations/{RECITER_ID}"
OUTPUT_FILE = "maher_timings.json"
TOTAL_SURAHS = 114
DELAY_BETWEEN_REQUESTS = 0.3  # seconds


def fetch_surah_timings(chapter_id: int) -> dict:
    """Fetch timings for a single surah from Quran.com API."""
    url = f"{BASE_URL}/{chapter_id}?segments=true"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"  Error fetching chapter {chapter_id}: {e}")
        return None


def convert_timestamps_to_verse_timings(audio_file: dict) -> list:
    """
    Convert the 'timestamps' format from QuranicAudio API to 'verse_timings' format.
    
    Input format (timestamps):
        {"verse_key": "1:1", "timestamp_from": 0, "timestamp_to": 5003, "duration": 5003, "segments": []}
    
    Output format (verse_timings):
        {"verse_key": "1:1", "timestamp_from": 0, "timestamp_to": 5003, "segments": [[1, 0, 5003]]}
    """
    timestamps = audio_file.get("timestamps", [])
    verse_timings = []
    
    for ts in timestamps:
        verse_key = ts.get("verse_key", "")
        timestamp_from = ts.get("timestamp_from")
        timestamp_to = ts.get("timestamp_to")
        segments = ts.get("segments", [])
        
        # If segments is empty, create a synthetic segment
        if not segments and timestamp_from is not None and timestamp_to is not None:
            segments = [[1, timestamp_from, timestamp_to]]
        
        verse_timings.append({
            "verse_key": verse_key,
            "timestamp_from": timestamp_from,
            "timestamp_to": timestamp_to,
            "segments": segments
        })
    
    return verse_timings


def main():
    print(f"Fetching Maher Al Muaiqly timings from Quran.com API")
    print(f"Reciter ID: {RECITER_ID}")
    print(f"Output file: {OUTPUT_FILE}")
    print("-" * 50)
    
    all_timings = {}
    errors = []
    
    for chapter_id in range(1, TOTAL_SURAHS + 1):
        print(f"Fetching Surah {chapter_id}/{TOTAL_SURAHS}...", end=" ")
        
        data = fetch_surah_timings(chapter_id)
        
        if data is None:
            errors.append(chapter_id)
            print("FAILED")
            time.sleep(DELAY_BETWEEN_REQUESTS)
            continue
        
        audio_file = data.get("audio_file", {})
        
        if not audio_file:
            print("No audio file data")
            errors.append(chapter_id)
            time.sleep(DELAY_BETWEEN_REQUESTS)
            continue
        
        # Convert timestamps to verse_timings format
        verse_timings = convert_timestamps_to_verse_timings(audio_file)
        
        # Count verses with segments
        verses_with_segments = sum(1 for v in verse_timings if v.get("segments"))
        
        all_timings[chapter_id] = {
            "chapter_id": chapter_id,
            "audio_url": audio_file.get("audio_url"),
            "verse_timings": verse_timings
        }
        
        print(f"OK ({len(verse_timings)} verses, {verses_with_segments} with segments)")
        
        # Delay to avoid rate limiting
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Save to JSON file
    print("-" * 50)
    print(f"Saving to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_timings, f, ensure_ascii=False, indent=2)
    
    print(f"Done! Saved {len(all_timings)} surahs.")
    
    if errors:
        print(f"Errors occurred for surahs: {errors}")
    
    # Summary
    total_verses = sum(len(s.get("verse_timings", [])) for s in all_timings.values())
    print(f"Total verses processed: {total_verses}")


if __name__ == "__main__":
    main()
