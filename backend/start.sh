#!/bin/bash

echo "🚀 Starting AI SkillFit Backend with Pretrained Models"
echo "=================================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Check if models need to be downloaded
echo "📦 Checking pretrained models..."
python3 -c "
try:
    import whisper
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline
    import spacy
    print('✅ All models available')
except Exception as e:
    print(f'⚠️  Some models may need to download on first use: {e}')
"

echo ""
echo "🌐 Starting FastAPI server..."
echo "   API: http://localhost:8001"
echo "   Docs: http://localhost:8001/docs"
echo "   Health: http://localhost:8001/health"
echo ""
echo "📊 Using Pretrained Models:"
echo "   - Whisper (speech-to-text)"
echo "   - Sentence Transformers (semantic similarity)"
echo "   - DistilBERT (sentiment analysis)"
echo "   - RoBERTa (emotion detection)"
echo "   - spaCy (NLP analysis)"
echo "   - librosa (audio features)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Start server
python3 main.py
