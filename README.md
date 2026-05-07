# AI SkillFit - Karnataka Workforce Assessment Platform

AI-powered skill assessment platform for blue-collar workers. Evaluates candidates through video interviews in their native language, provides instant AI scoring, and generates training recommendations.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+

### Installation
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py

# Frontend (new terminal)
npm install
npm run dev
```

### Access
- **Candidate:** http://localhost:5173
- **Admin:** http://localhost:5173/admin (admin@skillfit.in / admin123)
- **API:** http://localhost:8000/docs

## ✨ Features

- **Dynamic AI Scoring** - Real-time analysis using Whisper, librosa, MediaPipe, DeepFace, LLM
- **Multilingual** - Kannada, Hindi, English
- **Candidate Dashboard** - Self-service results viewing (phone-based)
- **Fraud Detection** - Face matching, quality checks
- **Admin Panel** - Review, update status, analytics
- **Training Recommendations** - AI-generated upskilling suggestions

## 📋 User Flows

### Candidate
Language Selection → Registration → Role Selection → Photo Capture → Instructions → Camera Check → Interview (7 questions) → Processing → Results → Dashboard

### Admin
Login → Dashboard → Review Candidate → Update Status → Analytics

## 🔧 Tech Stack

**Backend:** FastAPI, Whisper, librosa, MediaPipe, DeepFace, Sentence Transformers  
**Frontend:** React, Vite, Framer Motion, Tailwind CSS, Zustand  
**Database:** Supabase (production) / In-memory (demo)

## 📊 Scoring

- **Technical** (35%) - Keyword matching, domain knowledge
- **Communication** (25%) - Clarity, fluency
- **Confidence** (20%) - Voice energy, body language
- **Language** (10%) - Grammar, pronunciation
- **Relevance** (10%) - Answer relevance

**Overall Score** = Weighted average → **Category Assignment**:
- Job Ready (7.5-10)
- Needs Training (5-7.5)
- Requires Verification (<5 or fraud flags)
- Suspected Fraud (fraud detected)

## 📡 API Endpoints

### Candidate
- `POST /api/candidate/register`
- `GET /api/interview/{session_id}/questions`
- `POST /api/interview/{session_id}/submit-response`
- `POST /api/interview/{session_id}/complete`
- `GET /api/candidate/{phone}/dashboard`

### Admin
- `POST /api/auth/login`
- `GET /api/admin/candidates`
- `GET /api/admin/candidates/{id}`
- `PUT /api/admin/candidates/{id}/status`
- `GET /api/admin/stats`
- `GET /api/admin/analytics`

## 🧪 Testing

```bash
# Verify installation
./verify.sh

# Test scoring
./test-scoring.sh

# Manual test
# 1. Complete candidate flow
# 2. Login to admin panel
# 3. View candidate dashboard
```

## 📚 Documentation

See `DOCUMENTATION.md` for complete details on:
- Architecture
- Deployment
- Security
- Troubleshooting
- Code quality standards

## 🔒 Security

- JWT authentication for admin
- Face matching (no duplicates)
- Input validation
- Fraud detection
- SQL injection prevention

## 🌍 Multilingual

- Kannada (ಕನ್ನಡ)
- Hindi (हिंदी)
- English

## 📈 Performance

- Page load: < 2 seconds
- API response: < 1 second
- Video processing: 5-10 seconds per question

## 🚀 Deployment

### Backend
```bash
export SUPABASE_URL="your_url"
export SUPABASE_KEY="your_key"
pip install -r requirements.txt
python setup_models.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
VITE_API_URL=https://api.example.com npm run build
# Deploy dist/ folder
```

## 📞 Support

- Documentation: `DOCUMENTATION.md`
- API Docs: http://localhost:8000/docs
- Architecture: `ARCHITECTURE.md`

---

**Version:** 2.0  
**Status:** Production Ready ✅
