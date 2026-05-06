# AI SkillFit - Technical Architecture

## System Overview

AI SkillFit is a comprehensive video interview and workforce assessment platform designed specifically for Karnataka, India. The system supports three languages (Kannada, Hindi, English) with strict language isolation.

## Core Principle: Language Lock System

### The Most Important Rule
Once a user selects a language on the first screen, **EVERY** subsequent element in the application appears in that language only. This includes:
- All UI text (labels, buttons, headings)
- Error messages
- Form validations
- Question text
- Audio playback
- Processing messages
- SMS notifications
- Thank you page content

### Implementation
1. **Language Selection Screen**: First and only place language is chosen
2. **Storage**: Language saved to both localStorage and sessionStorage
3. **State Management**: Zustand store manages language state globally
4. **Translation Hook**: `useLanguage` hook provides `t()` function for all components
5. **Protected Routes**: All post-selection routes verify language is set
6. **Backend Integration**: Language sent with every API request

## Frontend Architecture

### Technology Stack
- **React 18**: Modern hooks-based components
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **React Webcam**: Camera integration

### State Management

#### Language Store (`languageStore.js`)
```javascript
{
  language: 'kannada' | 'hindi' | 'english',
  setLanguage: (lang) => void,
  getLanguage: () => string
}
```

#### Interview Store (`interviewStore.js`)
```javascript
{
  candidateData: {
    name, phone, district, education, experience, role, photo
  },
  sessionId: string,
  candidateId: string,
  currentQuestion: number,
  questions: Array,
  responses: Array
}
```

### Component Architecture

```
App (Router)
├── LanguageSelect (/)
├── Protected Routes (require language)
│   ├── Registration (/registration)
│   ├── RoleSelect (/role-select)
│   ├── PhotoCapture (/photo-capture)
│   ├── Instructions (/instructions)
│   ├── CameraCheck (/camera-check)
│   ├── InterviewRoom (/interview)
│   ├── Processing (/processing)
│   └── ThankYou (/thank-you)
└── Admin Routes (English only)
    ├── AdminLogin (/admin/login)
    ├── Dashboard (/admin/dashboard)
    ├── CandidateDetail (/admin/candidates/:id)
    └── Analytics (/admin/analytics)
```

### Data Flow

1. **Language Selection**
   ```
   User clicks button → setLanguage() → localStorage + state → navigate
   ```

2. **Registration Flow**
   ```
   Form input → validation (in lang) → API call → session creation → navigation
   ```

3. **Interview Flow**
   ```
   Load question (lang) → play audio (lang) → record video → 
   submit → background processing → next question
   ```

4. **Processing Flow**
   ```
   WebSocket connection → receive status updates (lang) → 
   show progress → completion → navigation
   ```

## Backend Architecture (Python)

### Technology Stack
- **FastAPI**: Modern async web framework
- **Celery**: Background task processing
- **Redis**: Message broker and cache
- **PostgreSQL**: Relational database (Supabase)
- **Whisper**: Speech-to-text (OpenAI)
- **Ollama**: Local LLM (Llama 3.1 8B)
- **MediaPipe**: Video analysis (Google)
- **DeepFace**: Face recognition
- **librosa**: Audio analysis

### API Endpoints

#### Candidate Endpoints
```
POST /api/candidate/register
- Multipart form with photo, personal data, language
- Returns: candidateId, sessionId
- Validates: phone uniqueness, face uniqueness

GET /api/candidate/check-phone/{phone}
- Check if phone already registered
- Returns: exists (boolean)
```

#### Interview Endpoints
```
GET /api/interview/{sessionId}/next-question
- Returns next question in session language
- Adaptive difficulty based on previous scores
- Returns: question object with text, audio, type

POST /api/interview/{sessionId}/submit-response
- Upload video response
- Queues background processing job
- Returns: success, questionId

POST /api/interview/{sessionId}/complete
- Finalize interview
- Generate final assessment
- Send SMS in candidate language
- Returns: assessment summary
```

#### Admin Endpoints
```
POST /api/auth/login
- Admin authentication
- Returns: JWT token

GET /api/admin/candidates
- List all candidates with filters
- Filters: category, role, district, date range
- Returns: paginated candidate list

GET /api/admin/candidates/{id}/full-report
- Complete candidate assessment
- Returns: all scores, videos, transcripts, AI analysis

PUT /api/admin/candidates/{id}/status
- Update candidate status
- Body: status, notes
- Returns: updated candidate

GET /api/admin/stats
- Dashboard statistics
- Returns: counts by category, role, district

GET /api/admin/analytics
- Time-series data for charts
- Returns: daily volumes, pass rates, score distributions
```

### Background Processing

#### Celery Tasks

1. **Process Response Task**
   ```python
   @celery.task
   def process_interview_response(response_id, session_language):
       1. Extract audio from video (FFmpeg)
       2. Transcribe audio (Whisper with language code)
       3. Analyze audio features (librosa)
       4. Analyze video features (MediaPipe)
       5. Score response (LLM with language context)
       6. Generate follow-up if needed (LLM in language)
       7. Store all results
       8. Emit WebSocket event
   ```

2. **Generate Final Assessment Task**
   ```python
   @celery.task
   def generate_final_assessment(session_id):
       1. Aggregate all question scores
       2. Calculate overall scores
       3. Run fraud analysis
       4. Determine category
       5. Generate AI summary
       6. Generate training recommendations
       7. Send SMS in candidate language
       8. Store assessment
   ```

### AI Components

#### Speech Recognition (Whisper)
```python
class SpeechEngine:
    model: WhisperModel
    
    def transcribe(audio_path, language):
        # language: 'kn', 'hi', or 'en'
        result = model.transcribe(
            audio_path,
            language=language
        )
        return {
            'transcript': result['text'],
            'language': result['language'],
            'duration': result['duration']
        }
```

#### LLM Analysis (Ollama/Llama 3.1)
```python
class LLMEngine:
    def score_response(question, transcript, language):
        prompt = f"""
        Language Context: {language}
        Question: {question}
        Candidate Response: {transcript}
        
        Score the response on:
        1. Relevance (0-10)
        2. Technical Depth (0-10)
        3. Language Quality (0-10)
        
        Generate follow-up question in {language} if score 3-7.
        """
        
        response = ollama.generate(
            model='llama3.1:8b',
            prompt=prompt
        )
        
        return parse_json_response(response)
```

#### Video Analysis (MediaPipe)
```python
class VideoAnalyzer:
    def analyze(video_path):
        detector = FaceDetection()
        mesh = FaceMesh()
        
        features = {
            'face_presence_ratio': 0,
            'eye_contact_ratio': 0,
            'multiple_faces': False,
            'lighting_quality': 'good',
            'blink_rate': 0
        }
        
        # Process frames at 5 fps
        # Calculate metrics
        
        return VideoFeatures(**features)
```

#### Fraud Detection (DeepFace)
```python
class FraudEngine:
    def check_duplicate_face(photo_path, candidate_id):
        # Extract face encoding
        encoding = DeepFace.represent(
            photo_path,
            model_name='Facenet512'
        )
        
        # Check against database
        duplicates = db.query_similar_faces(
            encoding,
            threshold=0.6
        )
        
        if duplicates:
            return FraudResult(
                is_fraud=True,
                action='BLOCK',
                flags=['duplicate_face']
            )
        
        # Store encoding
        db.store_face_encoding(candidate_id, encoding)
        
        return FraudResult(is_fraud=False)
    
    def analyze_session(session_id):
        # Check for fraud indicators:
        # - Multiple faces detected
        # - Reading from screen (low eye contact)
        # - Unnatural audio patterns
        # - Response timing anomalies
        
        return FraudResult(...)
```

## Database Schema

### Tables

#### candidates
```sql
id: UUID (PK)
name: TEXT
phone: TEXT (UNIQUE)
district: TEXT
applied_role: TEXT
preferred_language: TEXT (kannada|hindi|english)
education: TEXT
experience_years: INTEGER
photo_url: TEXT
created_at: TIMESTAMPTZ
```

#### interview_sessions
```sql
id: UUID (PK)
candidate_id: UUID (FK)
status: TEXT (pending|in_progress|completed)
language: TEXT (kannada|hindi|english)
started_at: TIMESTAMPTZ
completed_at: TIMESTAMPTZ
device_info: JSONB
ip_address: TEXT
```

#### question_responses
```sql
id: UUID (PK)
session_id: UUID (FK)
question_id: TEXT
question_text: TEXT
question_type: TEXT
transcript: TEXT
video_url: TEXT
audio_url: TEXT
response_duration: FLOAT
audio_features: JSONB
video_features: JSONB
ai_scores: JSONB
processing_status: TEXT
created_at: TIMESTAMPTZ
```

#### assessments
```sql
id: UUID (PK)
candidate_id: UUID (FK)
session_id: UUID (FK)
overall_score: FLOAT
technical_score: FLOAT
communication_score: FLOAT
confidence_score: FLOAT
language_score: FLOAT
job_readiness_percentage: INTEGER
category: TEXT (job_ready|needs_training|low_quality|suspected_fraud)
strengths: TEXT[]
weaknesses: TEXT[]
training_gaps: TEXT[]
training_recommendations: JSONB
ai_summary: TEXT
fraud_score: FLOAT
fraud_flags: TEXT[]
final_status: TEXT
created_at: TIMESTAMPTZ
```

## Question Bank Structure

### File Format (JSON)
```json
{
  "role": "electrician",
  "languages": {
    "kannada": {
      "warmup": [...],
      "technical_easy": [...],
      "technical_medium": [...],
      "technical_hard": [...],
      "situational": [...]
    },
    "hindi": { ... },
    "english": { ... }
  }
}
```

### Question Selection Algorithm
```python
def select_questions(session_language, role, current_scores):
    questions = []
    
    # Always 2 warmup questions first
    questions += select_warmup(session_language, role, 2)
    
    # 4 technical questions - adaptive difficulty
    avg_score = calculate_average(current_scores)
    if avg_score >= 7:
        difficulty = ['hard', 'medium', 'medium', 'hard']
    elif avg_score >= 4:
        difficulty = ['medium', 'medium', 'medium', 'hard']
    else:
        difficulty = ['easy', 'easy', 'medium', 'medium']
    
    for diff in difficulty:
        questions += select_technical(
            session_language, 
            role, 
            diff, 
            1
        )
    
    # Always 1 situational question last
    questions += select_situational(session_language, role, 1)
    
    return questions
```

## Audio Generation

### Text-to-Speech (gTTS)
```python
from gtts import gTTS

def generate_question_audio(questions_file):
    data = load_json(questions_file)
    
    for lang in ['kannada', 'hindi', 'english']:
        lang_code = {'kannada': 'kn', 'hindi': 'hi', 'english': 'en'}[lang]
        
        for category in data['languages'][lang]:
            for question in data['languages'][lang][category]:
                tts = gTTS(
                    text=question['text'],
                    lang=lang_code,
                    slow=False
                )
                
                output_path = f"public/audio/{lang_code}/{question['id']}.mp3"
                tts.save(output_path)
                print(f"Generated: {output_path}")
```

## Scoring Algorithm

### Individual Question Score
```python
def score_question(question, response_data, language):
    # LLM Content Score (0-10)
    content_score = llm.score_content(
        question=question,
        transcript=response_data.transcript,
        language=language
    )
    
    # Audio Quality Score (0-10)
    audio_score = (
        response_data.audio_features.clarity * 0.4 +
        response_data.audio_features.fluency * 0.3 +
        response_data.audio_features.speech_rate * 0.3
    )
    
    # Video Quality Score (0-10)
    video_score = (
        response_data.video_features.eye_contact * 0.5 +
        response_data.video_features.face_presence * 0.3 +
        response_data.video_features.lighting_quality * 0.2
    )
    
    # Weighted Final Score
    final_score = (
        content_score.relevance * 0.4 +
        content_score.technical_depth * 0.3 +
        audio_score * 0.2 +
        video_score * 0.1
    )
    
    return {
        'content': content_score,
        'audio': audio_score,
        'video': video_score,
        'final': final_score
    }
```

### Overall Assessment
```python
def generate_final_assessment(session_id):
    responses = db.get_session_responses(session_id)
    
    # Calculate dimension scores
    technical_score = average([
        r.scores['final'] 
        for r in responses 
        if r.type == 'technical'
    ])
    
    communication_score = average([
        r.audio_score 
        for r in responses
    ])
    
    confidence_score = calculate_confidence(
        audio_features=[r.audio_features for r in responses],
        video_features=[r.video_features for r in responses]
    )
    
    language_score = average([
        r.scores['content'].language_quality 
        for r in responses
    ])
    
    overall_score = (
        technical_score * 0.4 +
        communication_score * 0.3 +
        confidence_score * 0.2 +
        language_score * 0.1
    )
    
    # Determine category
    if fraud_score > 0.7:
        category = 'suspected_fraud'
    elif overall_score >= 7.5:
        category = 'job_ready'
    elif overall_score >= 5:
        category = 'needs_training'
    else:
        category = 'low_quality'
    
    return Assessment(
        overall_score=overall_score,
        technical_score=technical_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
        language_score=language_score,
        category=category,
        ...
    )
```

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Nginx     │ ← SSL/TLS, Static Files
│  (Port 80)  │
└──────┬──────┘
       │
┌──────┴──────────────────────┐
│                             │
│  ┌──────────┐  ┌─────────┐ │
│  │  React   │  │ FastAPI │ │
│  │  (Vite)  │  │ (8000)  │ │
│  └──────────┘  └────┬────┘ │
│                     │       │
│                ┌────┴────┐  │
│                │ Celery  │  │
│                │ Workers │  │
│                └────┬────┘  │
│                     │       │
│         ┌───────────┼───────┴───┐
│         │           │           │
│    ┌────┴────┐ ┌───┴───┐ ┌────┴────┐
│    │  Redis  │ │Ollama │ │Postgres │
│    │  (6379) │ │(11434)│ │  (5432) │
│    └─────────┘ └───────┘ └─────────┘
└─────────────────────────────────────┘
```

### Scalability Considerations

1. **Horizontal Scaling**: Add more Celery workers for video processing
2. **Caching**: Redis for frequently accessed data
3. **CDN**: Serve static assets and videos from CDN
4. **Database**: Read replicas for admin dashboard queries
5. **Load Balancer**: Distribute traffic across multiple API instances

## Security Measures

1. **Authentication**: JWT tokens for admin users
2. **Rate Limiting**: Prevent API abuse
3. **Input Validation**: Server-side validation of all inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize all user-generated content
6. **CORS**: Restrict to allowed origins
7. **File Upload**: Validate file types and sizes
8. **Encryption**: Sensitive data encrypted at rest

## Performance Optimization

1. **Lazy Loading**: Code splitting for faster initial load
2. **Image Optimization**: WebP format for photos
3. **Video Compression**: H.264 codec for interviews
4. **Caching**: Browser caching for static assets
5. **Minification**: JS/CSS minification in production
6. **Database Indexing**: Indexes on frequently queried fields
7. **Background Jobs**: Async processing doesn't block UI

## Monitoring and Logging

1. **Application Logs**: Structured JSON logging
2. **Error Tracking**: Sentry integration
3. **Performance Metrics**: Response times, throughput
4. **User Analytics**: Interview completion rates
5. **System Health**: CPU, memory, disk usage
6. **Database Queries**: Slow query log
7. **Fraud Alerts**: Real-time notifications

## Future Roadmap

1. **Mobile Apps**: Native iOS and Android apps
2. **Offline Mode**: Continue interview without internet
3. **More Languages**: Tamil, Telugu, Marathi support
4. **More Roles**: Expand to 50+ job categories
5. **Training Integration**: Link to online courses
6. **Job Matching**: Connect with employers directly
7. **Blockchain**: Immutable credential verification
8. **AR Interviews**: Augmented reality skills testing

---

This architecture ensures:
- ✅ Complete language isolation
- ✅ Scalable processing
- ✅ Accurate assessments
- ✅ Fraud prevention
- ✅ Production-ready performance
