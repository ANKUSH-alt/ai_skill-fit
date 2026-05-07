#!/bin/bash

echo "🔍 AI SkillFit - System Verification"
echo "===================================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version)"
else
    echo "❌ Python not found"
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "⚠️  Node modules missing - run: npm install"
fi

if [ -d "backend/venv" ] || [ -d "backend/.venv" ]; then
    echo "✅ Python venv exists"
else
    echo "⚠️  Python venv missing - run: python3 -m venv backend/venv"
fi

# Check key files
echo ""
echo "📁 Checking project structure..."
files=(
    "src/App.jsx"
    "src/main.jsx"
    "vite.config.js"
    "backend/main.py"
    "backend/core/audio_analyzer.py"
    "src/pages/admin/Dashboard.jsx"
    "src/pages/admin/AdminLogin.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done

# Check for removed files
echo ""
echo "🗑️  Checking cleanup..."
removed_files=(
    "src/App.tsx"
    "src/main.tsx"
    "vite.config.ts"
    "tsconfig.json"
)

all_clean=true
for file in "${removed_files[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  $file should be removed"
        all_clean=false
    fi
done

if [ "$all_clean" = true ]; then
    echo "✅ All duplicate files removed"
fi

echo ""
echo "===================================="
echo "🎯 Admin UI Routes:"
echo "   /admin              - Login"
echo "   /admin/dashboard    - Main dashboard"
echo "   /admin/candidate/:id - Detail view"
echo "   /admin/analytics    - Analytics"
echo ""
echo "🚀 To start:"
echo "   Backend:  cd backend && python3 main.py"
echo "   Frontend: npm run dev"
echo "===================================="
