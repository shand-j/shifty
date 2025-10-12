#!/bin/bash

# Shifty Development Setup Script
set -e

echo "🚀 Setting up Shifty development environment..."

# Check requirements
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Please install Docker first." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Please install Docker Compose first." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+ first." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Please install npm first." >&2; exit 1; }

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ All requirements satisfied"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Build workspace
echo "🔨 Building workspace..."
npm run build
echo "✅ Workspace built"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created. Please review and update .env with your settings."
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d platform-db redis ollama
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if Ollama is ready and pull models
echo "🤖 Setting up AI models..."
./tools/scripts/setup-ollama.sh

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate
echo "✅ Database migrations completed"

# Seed development data
echo "🌱 Seeding development data..."
npm run db:seed
echo "✅ Development data seeded"

echo "🎉 Shifty development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file with your configuration"
echo "2. Start all services: npm run dev"
echo "3. Access the application at http://localhost:3010"
echo "4. View API documentation at http://localhost:3000/docs"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start all services in development mode"
echo "  npm run test         - Run all tests"
echo "  npm run lint         - Lint all code"
echo "  npm run build        - Build all services for production"
echo "  npm run deploy:dev   - Deploy to development environment"