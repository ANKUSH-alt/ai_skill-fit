"""
Audio Generation Script - Generate MP3 files for all questions using gTTS
Run this once before starting the application
"""
import json
import os
from gtts import gTTS
from pathlib import Path

# Language codes for gTTS
GTTS_LANG_CODES = {
    "kannada": "kn",
    "hindi": "hi",
    "english": "en"
}

def generate_audio_for_question(text: str, language: str, output_path: str):
    """Generate audio file for a single question"""
    try:
        lang_code = GTTS_LANG_CODES.get(language, "en")
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(output_path)
        print(f"✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to generate {output_path}: {e}")
        return False

def process_question_file(role: str, base_dir: str):
    """Process all questions for a role"""
    question_file = f"../public/data/questions-{role}.json"
    
    if not os.path.exists(question_file):
        print(f"⚠ Question file not found: {question_file}")
        return
    
    print(f"\n{'='*60}")
    print(f"Processing {role.upper()} questions")
    print(f"{'='*60}")
    
    with open(question_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    languages_data = data.get("languages", {})
    
    for lang_name, lang_data in languages_data.items():
        print(f"\n{lang_name.upper()} questions:")
        
        # Create output directory
        output_dir = os.path.join(base_dir, GTTS_LANG_CODES[lang_name])
        os.makedirs(output_dir, exist_ok=True)
        
        # Process all question categories
        for category, questions in lang_data.items():
            if not isinstance(questions, list):
                continue
            
            for question in questions:
                question_id = question.get("id")
                text = question.get("text")
                
                if not question_id or not text:
                    continue
                
                output_path = os.path.join(output_dir, f"{question_id}.mp3")
                
                # Skip if already exists
                if os.path.exists(output_path):
                    print(f"  ⊙ Exists: {question_id}.mp3")
                    continue
                
                # Generate audio
                generate_audio_for_question(text, lang_name, output_path)

def main():
    """Main function to generate all audio files"""
    print("\n" + "="*60)
    print("AI SkillFit - Audio Generation Script")
    print("="*60)
    print("\nThis script will generate MP3 audio files for all questions")
    print("in Kannada, Hindi, and English using Google Text-to-Speech.\n")
    
    # Base directory for audio files
    base_dir = "../public/audio"
    
    # Create base directories
    for lang_code in GTTS_LANG_CODES.values():
        os.makedirs(os.path.join(base_dir, lang_code), exist_ok=True)
    
    # List of all roles
    roles = [
        "electrician",
        "plumber",
        "welder",
        "carpenter",
        "mason",
        "painter",
        "other"
    ]
    
    # Process each role
    total_generated = 0
    for role in roles:
        process_question_file(role, base_dir)
    
    print("\n" + "="*60)
    print("Audio Generation Complete!")
    print("="*60)
    print(f"\nAudio files saved to: {os.path.abspath(base_dir)}")
    print("\nYou can now start the application.")
    print("Questions will play audio from these files.\n")

if __name__ == "__main__":
    main()
