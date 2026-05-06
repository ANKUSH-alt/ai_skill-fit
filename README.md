# AI SkillFit - Karnataka Workforce Assessment Platform

**🏆 Karnataka EDCS Hackathon Submission**

A production-ready AI-powered video interview and workforce assessment platform for Karnataka, India, supporting Kannada, Hindi, and English languages.

## 🚨 HACKATHON STATUS

**Current Completion: 13%**
**Target for Winning: 95%**
**Time Needed: 20 hours**

### 📊 Hackathon Evaluation Criteria

Based on the official problem statement:

1. ✅ **Kannada + multilingual interaction** - PARTIAL (4/10)
2. ❌ **Robustness to dialects** - MISSING (1/10)
3. ❌ **Assessment accuracy** - MISSING (0/10)
4. ❌ **Integrity detection** - MISSING (0/10)
5. ❌ **Fitment classification** - MISSING (1/10)
6. ❌ **Dashboard usability** - MISSING (0/10)
7. ⚠️ **Scalability** - PARTIAL (3/10)

**Current Score: 9/70 (13%)**
**Needed to Win: 50/70 (71%)**

**📖 Read `HACKATHON_SUMMARY.md` for complete analysis**

### ✅ What's Working
- Frontend pages (all 9 pages)
- Language selection and isolation
- Translation system (3 languages)
- Question banks (7 trades)
- Basic backend server
- Interview recording interface

### ⚠️ What's Missing
- AI transcription (Whisper)
- AI scoring (LLM)
- Face verification (DeepFace)
- Video/audio analysis
- Database integration
- Admin dashboard
- Background processing

**📖 Read `CURRENT_STATUS.md` for complete details**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- FFmpeg
- (Optional) Ollama for local LLM

### Installation

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Generate audio files for questions
python scripts/generate_audio.py

# 4. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 5. Run system test
cd ..
./test-system.sh
```

### Running the Application

```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:5174

## 📚 Documentation

**Start here:**
- `CURRENT_STATUS.md` - Current state and next steps
- `QUICK_START_GUIDE.md` - Implementation guide
- `BUILD_PLAN.md` - Complete build plan
- `DELIVERY_SUMMARY.md` - What's been delivered

**Technical docs:**
- `ARCHITECTURE.md` - System architecture
- `FIXES-APPLIED.md` - Recent fixes
- `DEBUGGING-GUIDE.md` - Troubleshooting

## 🌟 Key Features (When Complete)

### Multi-Language Support
- Complete language isolation
- Support for Kannada, Hindi, and English
- No language mixing throughout the flow

### AI-Powered Assessment
- Speech recognition with Whisper
- LLM analysis with Ollama/Groq/Gemini
- Video analysis with MediaPipe
- Audio analysis with librosa
- Fraud detection with DeepFace

### Interview Flow
1. Language selection
2. Candidate registration
3. Role selection (7 trades)
4. Photo capture with face verification
5. Interview instructions
6. Camera and microphone checks
7. 7-question video interview
8. Real-time processing
9. Thank you page with scores

### Admin Dashboard (Not Built Yet)
- Candidate list with filtering
- Detailed candidate reports
- Video playback
- AI-generated assessments
- Analytics and statistics
- Export to CSV

## 🛠 Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS
- Framer Motion
- React Webcam
- Zustand
- React Router

### Backend
- FastAPI (Python)
- Celery with Redis (not implemented)
- PostgreSQL via Supabase
- Whisper (OpenAI)
- Ollama (Llama 3.1 8B)
- MediaPipe (Google)
- DeepFace
- librosa
- gTTS

### All Free & Open Source
- No paid APIs required
- Fallback options: Groq, Gemini (free tiers)

## 📋 Supported Roles

- Electrician
- Plumber
- Welder
- Carpenter
- Mason
- Painter
- Other

## 🌐 Supported Languages

- ಕನ್ನಡ (Kannada)
- हिंदी (Hindi)
- English

## 📊 Assessment Scoring

### Score Components
- Technical Score (0-10)
- Communication Score (0-10)
- Confidence Score (0-10)
- Language Score (0-10)
- Overall Score (weighted average)

### Categories
- Job Ready (≥7.5)
- Needs Training (5-7.4)
- Requires Verification (fraud flags)
- Low Quality (<5)

## 🔧 Development Status

### Completed (20%)
- ✅ Frontend structure
- ✅ Language system
- ✅ Question banks
- ✅ Basic backend
- ✅ Core modules (partial)

### In Progress (0%)
- ⏳ Backend core engines
- ⏳ Database integration
- ⏳ API endpoints
- ⏳ Admin dashboard

### Not Started (80%)
- ❌ Background workers
- ❌ Fraud detection
- ❌ Complete AI assessment
- ❌ SMS integration
- ❌ Docker setup
- ❌ Production deployment

## 🤝 Contributing

This is a production system for Karnataka Skill Development Corporation.

## 📄 License

Built for Karnataka Skill Development Corporation

## 🆘 Support

For issues:
1. Check `DEBUGGING-GUIDE.md`
2. Run `./test-system.sh`
3. Review `CURRENT_STATUS.md`
4. Check backend logs: `backend/server.log`

## 🎯 Next Steps

**To complete this project:**

1. **Read `CURRENT_STATUS.md`** - Understand what's missing
2. **Choose an option** - Continue building, DIY, or hybrid
3. **Follow `BUILD_PLAN.md`** - Step-by-step implementation
4. **Test thoroughly** - All 3 languages, all 7 trades
5. **Deploy** - Follow deployment guide

**Estimated time to completion: 20-25 hours**

---

**Current Version**: 0.2.0 (20% complete)

**Last Updated**: 2024

**Status**: 🚧 Under Development
