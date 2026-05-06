#!/bin/bash

# AI SkillFit - System Test Script
# Tests what's currently working

echo "=================================="
echo "AI SkillFit - System Test"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Node.js
echo -n "Testing Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
fi

# Test 2: Check Python
echo -n "Testing Python installation... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Found: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python not found"
fi

# Test 3: Check FFmpeg
echo -n "Testing FFmpeg installation... "
if command -v ffmpeg &> /dev/null; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} FFmpeg not found (needed for video processing)"
fi

# Test 4: Check Ollama
echo -n "Testing Ollama installation... "
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Ollama not found (optional, can use Groq/Gemini)"
fi

# Test 5: Check npm packages
echo -n "Testing frontend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Run: npm install"
fi

# Test 6: Check Python packages
echo -n "Testing backend dependencies... "
if python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Run: cd backend && pip install -r requirements.txt"
fi

# Test 7: Check translation files
echo -n "Testing translation files... "
if [ -f "src/i18n/kn.json" ] && [ -f "src/i18n/hi.json" ] && [ -f "src/i18n/en.json" ]; then
    echo -e "${GREEN}✓${NC} All 3 languages present"
else
    echo -e "${RED}✗${NC} Translation files missing"
fi

# Test 8: Check question banks
echo -n "Testing question banks... "
QUESTION_COUNT=$(ls public/data/questions-*.json 2>/dev/null | wc -l)
if [ "$QUESTION_COUNT" -eq 7 ]; then
    echo -e "${GREEN}✓${NC} All 7 trades present"
else
    echo -e "${YELLOW}⚠${NC} Found $QUESTION_COUNT/7 question files"
fi

# Test 9: Check audio files
echo -n "Testing audio files... "
if [ -d "public/audio/kn" ] && [ -d "public/audio/hi" ] && [ -d "public/audio/en" ]; then
    KN_COUNT=$(ls public/audio/kn/*.mp3 2>/dev/null | wc -l)
    HI_COUNT=$(ls public/audio/hi/*.mp3 2>/dev/null | wc -l)
    EN_COUNT=$(ls public/audio/en/*.mp3 2>/dev/null | wc -l)
    TOTAL=$((KN_COUNT + HI_COUNT + EN_COUNT))
    
    if [ "$TOTAL" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $TOTAL audio files"
    else
        echo -e "${YELLOW}⚠${NC} No audio files (run: python backend/scripts/generate_audio.py)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Audio directories not found"
fi

# Test 10: Check .env file
echo -n "Testing environment configuration... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} Copy backend/.env.example to backend/.env"
fi

# Test 11: Check if backend is running
echo -n "Testing backend server... "
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on port 8001"
else
    echo -e "${YELLOW}⚠${NC} Not running (start with: cd backend && python main.py)"
fi

# Test 12: Check if frontend is running
echo -n "Testing frontend server... "
if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on port 5174"
elif curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on port 5173"
else
    echo -e "${YELLOW}⚠${NC} Not running (start with: npm run dev)"
fi

echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo "✓ = Working"
echo "⚠ = Warning (optional or needs setup)"
echo "✗ = Error (required, needs fixing)"
echo ""
echo "Next steps:"
echo "1. Fix any ✗ errors above"
echo "2. Generate audio files if missing"
echo "3. Start backend: cd backend && python main.py"
echo "4. Start frontend: npm run dev"
echo "5. Open http://localhost:5174"
echo ""
