# 🔄 GitHub Update Guide

## Repository
**URL:** https://github.com/ANKUSH-alt/ai_skill-fit.git

## Quick Push Commands

```bash
# Navigate to project
cd "/Users/ankushkumarguptapahleja/ai skill fit/ai_skill-fit"

# Initialize git (if not already)
git init

# Add remote (if not already added)
git remote add origin https://github.com/ANKUSH-alt/ai_skill-fit.git

# Or update remote if exists
git remote set-url origin https://github.com/ANKUSH-alt/ai_skill-fit.git

# Check current status
git status

# Add all files
git add .

# Commit changes
git commit -m "feat: Complete deployment-ready version with all features

- Dynamic AI scoring system
- Candidate self-service dashboard
- Admin panel with enhanced visibility
- Multilingual support (Kannada, Hindi, English)
- Fraud detection system
- Complete deployment configurations
- Docker support
- Comprehensive documentation"

# Push to GitHub
git push -u origin main

# If main branch doesn't exist, try master
git push -u origin master

# Force push if needed (use carefully)
git push -u origin main --force
```

## Step-by-Step Guide

### 1. Check Git Status
```bash
cd "/Users/ankushkumarguptapahleja/ai skill fit/ai_skill-fit"
git status
```

### 2. Configure Git (First Time Only)
```bash
git config --global user.name "ANKUSH-alt"
git config --global user.email "your-email@example.com"
```

### 3. Add Remote Repository
```bash
# Check if remote exists
git remote -v

# If no remote, add it
git remote add origin https://github.com/ANKUSH-alt/ai_skill-fit.git

# If remote exists but wrong, update it
git remote set-url origin https://github.com/ANKUSH-alt/ai_skill-fit.git
```

### 4. Stage All Changes
```bash
# Add all files
git add .

# Or add specific files
git add backend/
git add src/
git add *.md
git add *.json
git add *.sh
```

### 5. Commit Changes
```bash
git commit -m "feat: Production-ready version with deployment configs

Features:
- ✅ Dynamic AI scoring (Whisper, librosa, MediaPipe, DeepFace, LLM)
- ✅ Candidate dashboard (phone-based lookup)
- ✅ Admin panel (review, analytics, status updates)
- ✅ Multilingual (Kannada, Hindi, English)
- ✅ Fraud detection (face matching, quality checks)
- ✅ Training recommendations

Deployment:
- ✅ Railway/Vercel configs
- ✅ Docker support
- ✅ Environment templates
- ✅ Automated deployment script

Documentation:
- ✅ Complete deployment guide
- ✅ API documentation
- ✅ Architecture docs
- ✅ Testing guides"
```

### 6. Push to GitHub
```bash
# Push to main branch
git push -u origin main

# If you get an error about main not existing, try:
git branch -M main
git push -u origin main

# Or if repository uses master:
git push -u origin master
```

## Handling Common Issues

### Issue 1: Repository Not Empty
If GitHub repository already has files:

```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main

# Or force push (overwrites remote)
git push -u origin main --force
```

### Issue 2: Authentication Required
```bash
# Use personal access token instead of password
# Generate token at: https://github.com/settings/tokens

# When prompted for password, use the token
```

### Issue 3: Large Files
```bash
# Check file sizes
find . -type f -size +50M

# If you have large model files, add to .gitignore
echo "backend/models/*.bin" >> .gitignore
echo "backend/models/*.pt" >> .gitignore
```

### Issue 4: Branch Name Mismatch
```bash
# Check current branch
git branch

# Rename branch to main
git branch -M main

# Push to main
git push -u origin main
```

## What Will Be Pushed

### Code Files
- ✅ Backend (Python/FastAPI)
- ✅ Frontend (React/Vite)
- ✅ Configuration files
- ✅ Documentation

### Excluded (via .gitignore)
- ❌ node_modules/
- ❌ __pycache__/
- ❌ .env files
- ❌ uploads/ (photos/videos)
- ❌ *.log files
- ❌ *.pid files

## Verify Push

After pushing, verify on GitHub:

1. Go to: https://github.com/ANKUSH-alt/ai_skill-fit
2. Check files are uploaded
3. Verify README.md displays correctly
4. Check all folders are present

## Update .gitignore

Make sure `.gitignore` is correct:

```bash
# Check current .gitignore
cat .gitignore

# Should include:
node_modules/
__pycache__/
*.pyc
.env
.env.local
uploads/photos/*
uploads/videos/*
*.log
*.pid
dist/
build/
.DS_Store
```

## Create GitHub Release (Optional)

After pushing:

1. Go to: https://github.com/ANKUSH-alt/ai_skill-fit/releases
2. Click "Create a new release"
3. Tag: `v2.0.0`
4. Title: "AI SkillFit v2.0 - Production Ready"
5. Description: Copy from DEPLOYMENT_READY.md
6. Publish release

## Enable GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for auto-deployment:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Repository Settings

### Enable Features
- ✅ Issues
- ✅ Wiki
- ✅ Discussions (optional)

### Add Topics
- ai
- machine-learning
- skill-assessment
- fastapi
- react
- multilingual
- karnataka
- workforce

### Add Description
"AI-powered skill assessment platform for blue-collar workers in Karnataka. Features multilingual support, fraud detection, and real-time AI scoring."

### Add Website
Your deployed URL (after deployment)

## Collaboration

### Add Collaborators
1. Go to Settings > Collaborators
2. Add team members
3. Set permissions

### Branch Protection
1. Go to Settings > Branches
2. Add rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks
   - Include administrators

## Next Steps

After pushing to GitHub:

1. ✅ Verify all files uploaded
2. ✅ Update repository description
3. ✅ Add topics/tags
4. ✅ Enable GitHub Pages (optional)
5. ✅ Setup GitHub Actions (optional)
6. ✅ Deploy to Vercel/Railway
7. ✅ Share repository link

---

**Ready to push!** Run the commands above to update your GitHub repository.
