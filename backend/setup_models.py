#!/usr/bin/env python3
"""
Setup script to download all pretrained models
Run this once before starting the server
"""
import os
import subprocess
import sys

def download_models():
    """Download all required pretrained models"""
    
    print("🚀 Setting up pretrained models for AI SkillFit...")
    print("=" * 60)
    
    # 1. Whisper
    print("\n📥 Downloading Whisper model...")
    import whisper
    whisper.load_model("base")
    print("✅ Whisper model ready")
    
    # 2. Sentence Transformers
    print("\n📥 Downloading Sentence Transformer...")
    from sentence_transformers import SentenceTransformer
    SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Sentence Transformer ready")
    
    # 3. Sentiment Analysis
    print("\n📥 Downloading Sentiment Analysis model...")
    from transformers import pipeline
    pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    print("✅ Sentiment model ready")
    
    # 4. Emotion Detection
    print("\n📥 Downloading Emotion Detection model...")
    pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
    print("✅ Emotion model ready")
    
    # 5. Question Answering
    print("\n📥 Downloading QA model...")
    pipeline("question-answering", model="deepset/roberta-base-squad2")
    print("✅ QA model ready")
    
    # 6. spaCy
    print("\n📥 Downloading spaCy models...")
    subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    subprocess.run([sys.executable, "-m", "spacy", "download", "xx_ent_wiki_sm"])
    print("✅ spaCy models ready")
    
    # 7. SpeechBrain (optional - skip if not needed)
    print("\n📥 Downloading SpeechBrain model...")
    try:
        from speechbrain.pretrained import EncoderClassifier
        EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-xvect-voxceleb",
            savedir="pretrained_models/spkrec"
        )
        print("✅ SpeechBrain model ready")
    except ImportError:
        print("⚠️  SpeechBrain not installed, skipping...")
    
    print("\n" + "=" * 60)
    print("✨ All pretrained models downloaded successfully!")
    print("🎯 No LLM API keys needed - everything runs locally")
    print("\nYou can now start the server with:")
    print("  python main.py")
    print("  or")
    print("  uvicorn main:app --reload")

if __name__ == "__main__":
    try:
        download_models()
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        print("\nPlease ensure all dependencies are installed:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
