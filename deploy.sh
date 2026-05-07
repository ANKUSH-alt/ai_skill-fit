#!/bin/bash

echo "🚀 AI SkillFit - Deployment Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python: $(python3 --version)"
else
    echo -e "${RED}✗${NC} Python not found. Install Python 3.9+"
    exit 1
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker: $(docker --version)"
else
    echo -e "${YELLOW}⚠${NC} Docker not found (optional)"
fi

echo ""
echo "📦 Choose deployment method:"
echo "1) Vercel + Railway (Free - Recommended)"
echo "2) Docker Compose (Self-hosted)"
echo "3) Manual deployment"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🎯 Deploying to Vercel + Railway..."
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo ""
        echo "📝 Setup Instructions:"
        echo ""
        echo "1. Setup Supabase:"
        echo "   - Go to https://supabase.com"
        echo "   - Create new project"
        echo "   - Run SQL from DEPLOYMENT.md Step 1"
        echo "   - Copy URL and Key"
        echo ""
        read -p "Press Enter when Supabase is ready..."
        
        echo ""
        echo "2. Deploy Backend to Railway:"
        echo "   - Running: railway login"
        railway login
        echo "   - Running: railway init"
        railway init
        echo "   - Add environment variables in Railway dashboard"
        echo "   - Running: railway up"
        railway up
        echo ""
        read -p "Copy your Railway backend URL and press Enter..."
        read -p "Enter Railway backend URL: " BACKEND_URL
        
        echo ""
        echo "3. Deploy Frontend to Vercel:"
        echo "   - Running: vercel login"
        vercel login
        echo "   - Setting VITE_API_URL=$BACKEND_URL"
        vercel env add VITE_API_URL production
        echo "$BACKEND_URL"
        echo "   - Running: vercel --prod"
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✓${NC} Deployment complete!"
        echo ""
        echo "🎉 Your app is live!"
        echo "   Frontend: Check Vercel dashboard"
        echo "   Backend: $BACKEND_URL"
        ;;
        
    2)
        echo ""
        echo "🐳 Deploying with Docker Compose..."
        echo ""
        
        if ! command -v docker-compose &> /dev/null; then
            echo -e "${RED}✗${NC} docker-compose not found. Install Docker Desktop."
            exit 1
        fi
        
        # Check if .env exists
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            cp backend/.env.production.example .env
            echo ""
            echo "⚠️  Please edit .env file with your credentials"
            echo "   Then run: docker-compose up -d"
            exit 0
        fi
        
        echo "Building and starting containers..."
        docker-compose up -d --build
        
        echo ""
        echo -e "${GREEN}✓${NC} Deployment complete!"
        echo ""
        echo "🎉 Your app is running!"
        echo "   Frontend: http://localhost"
        echo "   Backend: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        echo ""
        echo "To stop: docker-compose down"
        echo "To view logs: docker-compose logs -f"
        ;;
        
    3)
        echo ""
        echo "📖 Manual Deployment Instructions:"
        echo ""
        echo "See DEPLOYMENT.md for detailed instructions"
        echo ""
        echo "Quick steps:"
        echo "1. Setup Supabase database"
        echo "2. Deploy backend to Railway/Render/AWS"
        echo "3. Deploy frontend to Vercel/Netlify"
        echo "4. Configure environment variables"
        echo ""
        ;;
        
    4)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "📚 Next steps:"
echo "1. Test all features"
echo "2. Update admin password"
echo "3. Configure custom domain (optional)"
echo "4. Setup monitoring (optional)"
echo "5. Enable backups"
echo ""
echo "📖 See DEPLOYMENT.md for more details"
echo ""
