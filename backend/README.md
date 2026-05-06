# AI SkillFit Backend - Pretrained Models

## 🎯 Overview

This backend uses **pretrained ML models** instead of LLM APIs for assessment. All models run locally with no API costs.

## 🧠 Pretrained Models Used

### 1. **Speech Recognition**
- **Model**: OpenAI Whisper (base)
- **Purpose**: Audio to text transcription
- **Languages**: English, Hindi, Kannada (via Hindi)

### 2. **Semantic Similarity**
- **Model**: all-MiniLM-L6-v2 (Sentence Transformers)
- **Purpose**: Technical accuracy assessment
- **Method**: Cosine similarity between answer and expected keywords

### 3. **Sentiment Analysis**
- **Model**: distilbert-base-uncased-finetuned-sst-2-english
- **Purpose**: Confidence detection
- **Output**: Positive/Negative sentiment scores

### 4. **Emotion Detection**
- **Model**: j-hartmann/emotion-english-distilroberta-base
- **Purpose**: Confidence and emotional state
- **Output**: Joy, sadness, anger, fear, surprise, disgust, neutral

### 5. **Question Answering**
- **Model**: deepset/roberta-base-squad2
- **Purpose**: Technical knowledge verification
- **Method**: Extract answers from context

### 6. **NLP Analysis**
- **Model**: spaCy (en_core_web_sm, xx_ent_wiki_sm)
- **Purpose**: Grammar, fluency, sentence structure
- **Features**: POS tagging, entity recognition, dependency parsing

### 7. **Speech Quality**
- **Model**: SpeechBrain (spkrec-xvect-voxceleb)
- **Purpose**: Audio quality assessment
- **Features**: Speaker embeddings, voice quality

### 8. **Audio Features**
- **Library**: librosa
- **Purpose**: Speech rate, pitch, energy, pauses
- **Features**: Prosody analysis, silence detection

## 📊 Assessment Components

### Technical Score (0-10)
- Semantic similarity with expected keywords (70%)
- Answer completeness and length (30%)
- Uses: Sentence Transformers

### Communication Score (0-10)
- Sentence structure and grammar (25%)
- Vocabulary diversity (25%)
- POS tag diversity (25%)
- Entity recognition (25%)
- Uses: spaCy

### Confidence Score (0-10)
- Sentiment analysis (40%)
- Emotion detection (60%)
- Uses: DistilBERT + RoBERTa

### Language Score (0-10)
- Speech rate (25%)
- Pitch variation (25%)
- Energy consistency (25%)
- Silence ratio (25%)
- Uses: librosa + SpeechBrain

### Overall Score
Weighted average:
- Technical: 35%
- Communication: 25%
- Confidence: 20%
- Language: 20%

## 🚀 Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Download Pretrained Models

```bash
python setup_models.py
```

This will download all models (~2-3 GB total):
- Whisper base model
- Sentence transformers
- Sentiment/emotion models
- spaCy models
- SpeechBrain models

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Run Server

```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### POST /api/transcribe
Transcribe audio to text

**Request:**
- `audio`: Audio file (multipart/form-data)
- `language`: Language code (en/hi/kn)

**Response:**
```json
{
  "transcription": "text here",
  "language": "en"
}
```

### POST /api/assess
Complete assessment of single answer

**Request:**
- `audio`: Audio file
- `question`: Question text
- `expected_keywords`: JSON array of keywords
- `language`: Language code

**Response:**
```json
{
  "technical_score": 8.5,
  "communication_score": 7.2,
  "confidence_score": 8.0,
  "language_score": 7.8,
  "overall_score": 7.9,
  "category": "Job Ready",
  "strengths": ["Technical Knowledge", "Confidence"],
  "improvements": ["Communication clarity can be improved"]
}
```

### POST /api/batch-assess
Batch assessment for all interview answers

**Request:**
- `candidate_id`: Candidate ID
- `answers`: JSON array of answer objects

**Response:**
```json
{
  "candidate_id": "123",
  "individual_assessments": [...],
  "overall_scores": {
    "technical_score": 7.5,
    "communication_score": 6.8,
    "confidence_score": 7.2,
    "language_score": 7.0,
    "overall_score": 7.1
  },
  "category": "Job Ready",
  "recommendation": "Recommended for immediate hiring..."
}
```

## 💡 Advantages Over LLMs

### 1. **No API Costs**
- All models run locally
- No per-request charges
- No rate limits

### 2. **Faster Processing**
- No network latency
- Parallel processing possible
- Predictable response times

### 3. **More Reliable**
- Consistent scoring
- No API downtime
- Deterministic results

### 4. **Privacy**
- Data stays local
- No third-party access
- GDPR compliant

### 5. **Specialized Models**
- Each model optimized for specific task
- Better accuracy than general LLMs
- Domain-specific fine-tuning possible

## 🔧 Customization

### Add Custom Keywords
Edit question banks to include role-specific keywords:

```python
expected_keywords = [
    "safety",
    "voltage",
    "circuit breaker",
    "wiring"
]
```

### Adjust Scoring Weights
Modify in `assessment_service.py`:

```python
overall_score = (
    technical_score * 0.35 +
    communication_score * 0.25 +
    confidence_score * 0.20 +
    language_score * 0.20
)
```

### Fine-tune Models
Train on Karnataka-specific data:

```python
from sentence_transformers import SentenceTransformer, InputExample, losses

# Your training data
train_examples = [...]

# Fine-tune
model.fit(train_examples)
```

## 📈 Performance

### Model Sizes
- Whisper base: ~140 MB
- Sentence Transformer: ~80 MB
- Sentiment models: ~250 MB each
- spaCy: ~50 MB
- SpeechBrain: ~100 MB

### Processing Time (CPU)
- Transcription: 2-5 seconds per minute of audio
- Assessment: 1-2 seconds per answer
- Total per candidate: ~30-60 seconds

### Processing Time (GPU)
- Transcription: 0.5-1 second per minute
- Assessment: 0.2-0.5 seconds per answer
- Total per candidate: ~10-20 seconds

## 🐛 Troubleshooting

### Models not downloading
```bash
# Manual download
python -c "import whisper; whisper.load_model('base')"
python -m spacy download en_core_web_sm
```

### Out of memory
- Use smaller Whisper model: `tiny` instead of `base`
- Process answers sequentially instead of batch
- Reduce batch size

### Slow processing
- Use GPU if available (set `DEVICE=cuda`)
- Use smaller models
- Enable model caching

## 🔮 Future Enhancements

1. **Fine-tuning on Karnataka data**
   - Collect labeled interview data
   - Fine-tune models for local context
   - Improve accuracy for regional languages

2. **Model quantization**
   - Reduce model sizes
   - Faster inference
   - Lower memory usage

3. **Ensemble models**
   - Combine multiple models
   - Voting mechanisms
   - Improved accuracy

4. **Custom models**
   - Train role-specific classifiers
   - Domain adaptation
   - Transfer learning

## 📚 References

- [Whisper](https://github.com/openai/whisper)
- [Sentence Transformers](https://www.sbert.net/)
- [Hugging Face Transformers](https://huggingface.co/transformers/)
- [spaCy](https://spacy.io/)
- [SpeechBrain](https://speechbrain.github.io/)
- [librosa](https://librosa.org/)
