# 🚀 DEPLOYMENT GUIDE

## Deployment Options

### Option 1: Free Tier (Recommended for Demo)
- **Frontend:** Vercel / Netlify (Free)
- **Backend:** Railway / Render (Free tier)
- **Database:** Supabase (Free tier)
- **Storage:** Supabase Storage (Free)

### Option 2: AWS (Production)
- **Frontend:** S3 + CloudFront
- **Backend:** EC2 / ECS
- **Database:** RDS PostgreSQL
- **Storage:** S3

### Option 3: Google Cloud (Production)
- **Frontend:** Cloud Storage + CDN
- **Backend:** Cloud Run
- **Database:** Cloud SQL
- **Storage:** Cloud Storage

---

## 🎯 Quick Deploy (Free - 15 minutes)

### Prerequisites
1. GitHub account
2. Vercel account (free)
3. Railway account (free)
4. Supabase account (free)

### Step 1: Setup Supabase Database (5 min)

1. Go to https://supabase.com
2. Create new project
3. Run this SQL in SQL Editor:

```sql
-- Create tables
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    district TEXT,
    applied_role TEXT,
    preferred_language TEXT,
    education TEXT,
    experience_years INTEGER DEFAULT 0,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id),
    status TEXT DEFAULT 'active',
    language TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    device_info JSONB,
    session_metadata JSONB
);

CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id),
    question_id TEXT,
    question_text TEXT,
    question_type TEXT,
    video_url TEXT,
    transcript TEXT,
    ai_scores JSONB,
    key_points_mentioned TEXT[],
    missing_points TEXT[],
    red_flags TEXT[],
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id),
    session_id UUID REFERENCES interview_sessions(id),
    overall_score FLOAT,
    technical_score FLOAT,
    communication_score FLOAT,
    confidence_score FLOAT,
    language_score FLOAT,
    job_readiness_percentage INTEGER,
    category TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    training_gaps TEXT[],
    training_recommendations JSONB,
    recommended_roles TEXT[],
    ai_summary TEXT,
    recruiter_recommendation TEXT,
    fraud_score FLOAT,
    fraud_flags TEXT[],
    final_status TEXT DEFAULT 'pending_review',
    recruiter_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE face_encodings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id),
    photo_url TEXT,
    encoding FLOAT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo admin
INSERT INTO admin_users (email, name, role, password_hash)
VALUES ('admin@skillfit.in', 'Admin User', 'admin', 'admin123');

-- Create indexes
CREATE INDEX idx_candidates_phone ON candidates(phone);
CREATE INDEX idx_sessions_candidate ON interview_sessions(candidate_id);
CREATE INDEX idx_responses_session ON question_responses(session_id);
CREATE INDEX idx_assessments_candidate ON assessments(candidate_id);
CREATE INDEX idx_assessments_category ON assessments(category);
CREATE INDEX idx_assessments_status ON assessments(final_status);
```

4. Copy your Supabase URL and Key from Settings > API

### Step 2: Deploy Backend to Railway (5 min)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add these environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key (optional)
SECRET_KEY=your_random_secret_key
DEBUG=False
PORT=8000
```

5. Add `railway.json` to root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pip install -r requirements.txt && python setup_models.py"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

6. Railway will auto-deploy. Copy your backend URL.

### Step 3: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com
2. Click "New Project" → Import from GitHub
3. Select your repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add environment variable:
```env
VITE_API_URL=https://your-railway-backend-url.railway.app
```

6. Deploy! Your app will be live at `https://your-app.vercel.app`

---

## 📦 Deployment Files

### 1. Backend: Dockerfile (Optional for Docker deployment)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download models
COPY setup_models.py .
RUN python setup_models.py

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Backend: requirements.txt (Verify)

Ensure `backend/requirements.txt` has:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
supabase==2.0.3
openai==1.3.5
whisper==1.1.10
librosa==0.10.1
opencv-python==4.8.1.78
mediapipe==0.10.8
deepface==0.0.79
sentence-transformers==2.2.2
numpy==1.24.3
Pillow==10.1.0
```

### 3. Frontend: vercel.json

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Frontend: .env.production

Create `.env.production`:

```env
VITE_API_URL=https://your-backend-url.com
```

### 5. Backend: .env.production

Create `backend/.env.production`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_secret_key_min_32_chars
DEBUG=False
ALLOWED_ORIGINS=https://your-frontend-url.com
```

---

## 🔧 Production Optimizations

### Backend Optimizations

1. **Enable CORS properly** - Update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-url.vercel.app",
        "http://localhost:5173"  # For local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Add health check endpoint** (already exists):

```python
@app.get("/health")
async def health():
    return {"status": "healthy"}
```

3. **Enable logging**:

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Frontend Optimizations

1. **Build optimization** - Update `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

2. **Add loading states** (already implemented)

3. **Error boundaries** (already implemented)

---

## 🔒 Security Checklist

### Before Deployment

- [ ] Change default admin password
- [ ] Set strong SECRET_KEY (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set proper CORS origins
- [ ] Add rate limiting
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Validate all inputs
- [ ] Sanitize file uploads
- [ ] Use environment variables for secrets
- [ ] Enable API authentication

### Supabase Security

Enable Row Level Security:

```sql
-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policies (example)
CREATE POLICY "Candidates can view own data"
ON candidates FOR SELECT
USING (phone = current_setting('app.current_phone', true));

CREATE POLICY "Admins can view all"
ON candidates FOR ALL
USING (current_setting('app.user_role', true) = 'admin');
```

---

## 📊 Monitoring & Analytics

### 1. Add Sentry (Error Tracking)

```bash
npm install @sentry/react @sentry/vite-plugin
```

Update `src/main.jsx`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 2. Add Google Analytics

Update `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🧪 Pre-Deployment Testing

```bash
# 1. Build frontend
npm run build
npm run preview  # Test production build

# 2. Test backend
cd backend
python -m pytest  # If you have tests

# 3. Check environment variables
./verify.sh

# 4. Test API endpoints
curl https://your-backend-url.com/health
```

---

## 🚀 Deployment Commands

### Deploy Backend (Railway)
```bash
# Railway auto-deploys on git push
git add .
git commit -m "Deploy to production"
git push origin main
```

### Deploy Frontend (Vercel)
```bash
# Vercel auto-deploys on git push
git push origin main

# Or manual deploy
vercel --prod
```

### Deploy with Docker
```bash
# Build
docker build -t ai-skillfit-backend ./backend
docker build -t ai-skillfit-frontend .

# Run
docker run -p 8000:8000 --env-file .env ai-skillfit-backend
docker run -p 80:80 ai-skillfit-frontend
```

---

## 📝 Post-Deployment Checklist

- [ ] Test all candidate flows
- [ ] Test admin panel
- [ ] Test candidate dashboard
- [ ] Verify video uploads work
- [ ] Check AI scoring works
- [ ] Test all 3 languages
- [ ] Verify fraud detection
- [ ] Test on mobile devices
- [ ] Check performance (Lighthouse)
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Document API endpoints
- [ ] Share credentials with team

---

## 🆘 Troubleshooting

### Backend Issues

**Models not loading:**
```bash
cd backend
python setup_models.py
```

**Database connection fails:**
- Check Supabase credentials
- Verify network access
- Check RLS policies

**CORS errors:**
- Update allowed origins in main.py
- Check frontend URL is correct

### Frontend Issues

**API calls fail:**
- Verify VITE_API_URL is set
- Check backend is running
- Verify CORS settings

**Build fails:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 16+)

---

## 💰 Cost Estimate (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | Free | 100GB bandwidth/month |
| Railway | $5 credit/month | ~500 hours |
| Supabase | Free | 500MB database, 1GB storage |
| **Total** | **~$0-5/month** | Good for demo/testing |

## 💰 Cost Estimate (Production)

| Service | Cost | Usage |
|---------|------|-------|
| AWS EC2 (t3.medium) | $30/month | Backend |
| AWS RDS (db.t3.micro) | $15/month | Database |
| AWS S3 + CloudFront | $10/month | Frontend + Storage |
| **Total** | **~$55/month** | Production ready |

---

## 🎯 Quick Deploy Commands

```bash
# 1. Setup Supabase (manual - see Step 1)

# 2. Deploy Backend to Railway
railway login
railway init
railway up

# 3. Deploy Frontend to Vercel
vercel login
vercel --prod

# Done! 🎉
```

---

**Need Help?** Check `DOCUMENTATION.md` or create an issue on GitHub.
