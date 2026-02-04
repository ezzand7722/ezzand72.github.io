import whisper
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    if os.path.exists("raw_transcript_maher.json"):
        print("Loading cached transcript...")
        with open("raw_transcript_maher.json", "r", encoding="utf-8") as f:
            result = json.load(f)
    else:
        print("Loading model...")
        model = whisper.load_model("base")
        print("Transcribing Maher Al-Muaiqly sample...")
        # Assume sample_maher.mp3 exists
        result = model.transcribe("sample_maher.mp3")
        with open("raw_transcript_maher.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    
    # Just print segments
    print("Raw Segments (Maher Al-Muaiqly):")
    for seg in result["segments"]:
        print(f"{seg['start']:.2f}-{seg['end']:.2f}: {seg['text']}")

if __name__ == "__main__":
    main()
