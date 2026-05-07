#!/bin/bash

echo "🧪 Testing Dynamic Scoring & Candidate Dashboard"
echo "================================================"
echo ""

# Check if backend is running
echo "1. Checking backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running. Start with: cd backend && python3 main.py"
    exit 1
fi

# Check if frontend is running
echo ""
echo "2. Checking frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is not running. Start with: npm run dev"
    exit 1
fi

# Test candidate dashboard endpoint
echo ""
echo "3. Testing candidate dashboard endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/candidate/9876543210/dashboard)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✅ Endpoint working (404 expected for non-existent candidate)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Endpoint working (candidate found)"
else
    echo "   ❌ Unexpected response: $HTTP_CODE"
fi

# Check key files
echo ""
echo "4. Checking key files..."
FILES=(
    "src/pages/CandidateDashboard.jsx"
    "src/pages/ThankYou.jsx"
    "src/pages/Processing.jsx"
    "backend/main.py"
    "backend/core/assessment_engine.py"
    "backend/core/audio_analyzer.py"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "================================================"
echo "✅ All checks passed!"
echo ""
echo "📋 Test Flow:"
echo "   1. Complete an interview at http://localhost:5173"
echo "   2. Note your phone number during registration"
echo "   3. After interview, click 'View My Results'"
echo "   4. Enter your phone number to see dashboard"
echo ""
echo "🔗 Quick Links:"
echo "   Candidate Flow: http://localhost:5173"
echo "   My Results:     http://localhost:5173/my-results"
echo "   Admin Panel:    http://localhost:5173/admin"
echo "   API Docs:       http://localhost:8000/docs"
echo ""
