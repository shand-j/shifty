#!/bin/bash

# Shifty SonarQube Setup Script
# This script helps set up SonarQube for local development and CI/CD

set -e

echo "🔧 Setting up SonarQube for Shifty Platform..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if ! printf '%s\n%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V -C; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

print_success "Node.js version $NODE_VERSION is compatible"

# Check if SonarQube Scanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    print_warning "SonarQube Scanner is not installed globally."
    echo "Installing SonarQube Scanner CLI..."

    # Install SonarQube Scanner CLI
    if command -v brew &> /dev/null; then
        print_status "Installing via Homebrew..."
        brew install sonar-scanner
    elif command -v npm &> /dev/null; then
        print_status "Installing via npm globally..."
        npm install -g sonarqube-scanner
    else
        print_error "Please install SonarQube Scanner manually:"
        echo "  - macOS: brew install sonar-scanner"
        echo "  - npm: npm install -g sonarqube-scanner"
        echo "  - Manual: https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/"
        exit 1
    fi
fi

print_success "SonarQube Scanner is available"

# Check if coverage directory exists, create if not
if [ ! -d "coverage" ]; then
    print_status "Creating coverage directory..."
    mkdir -p coverage
fi

# Run tests with coverage to verify setup
print_status "Running tests with coverage to verify Jest configuration..."
npm run test:coverage:sonar

if [ $? -eq 0 ]; then
    print_success "Test coverage generation successful"

    # Check if LCOV report was generated
    if [ -f "coverage/lcov.info" ]; then
        print_success "LCOV report generated at coverage/lcov.info"
    else
        print_error "LCOV report not found. Check Jest configuration."
        exit 1
    fi
else
    print_error "Test coverage generation failed"
    exit 1
fi

# Display current coverage stats
if [ -f "coverage/coverage-summary.json" ]; then
    print_status "Current test coverage summary:"
    if command -v jq &> /dev/null; then
        jq '.total | {lines: .lines.pct, statements: .statements.pct, functions: .functions.pct, branches: .branches.pct}' coverage/coverage-summary.json
    else
        cat coverage/coverage-summary.json | grep -A 4 '"total"'
    fi
fi

# Environment setup instructions
echo ""
echo "🎯 SonarQube Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure SonarQube Server Connection:"
echo "   - Set SONAR_HOST_URL in your environment (e.g., https://sonarcloud.io)"
echo "   - Set SONAR_TOKEN with your SonarQube authentication token"
echo ""
echo "2. For SonarCloud (recommended):"
echo "   - Visit: https://sonarcloud.io"
echo "   - Login with your GitHub account"
echo "   - Import your repository: shand-j/shifty"
echo "   - Get your project token from Project Settings > Analysis Method > Locally"
echo ""
echo "3. Environment Variables:"
echo "   export SONAR_HOST_URL=https://sonarcloud.io"
echo "   export SONAR_TOKEN=your_token_here"
echo ""
echo "4. VS Code Tasks Available:"
echo "   - Ctrl+Shift+P → 'Run Task' → '📊 Run SonarQube Analysis'"
echo "   - Ctrl+Shift+P → 'Run Task' → '📈 Generate Coverage Report'"
echo "   - Ctrl+Shift+P → 'Run Task' → '🔍 Quality Check (All)'"
echo ""
echo "5. Command Line Usage:"
echo "   npm run sonar:local         # Run local analysis"
echo "   npm run test:coverage       # Generate coverage reports"
echo "   npm run quality:check       # Run all quality checks"
echo ""

# Check if SonarQube project properties exist
if [ ! -f "sonar-project.properties" ]; then
    print_warning "sonar-project.properties not found in project root"
else
    print_success "sonar-project.properties configured"
fi

# Check GitHub Actions workflow
if [ ! -f ".github/workflows/sonarqube.yml" ]; then
    print_warning "SonarQube GitHub Actions workflow not found"
else
    print_success "GitHub Actions workflow configured"
fi

echo ""
print_success "SonarQube setup verification complete! 🚀"

# Optional: Open coverage report if available
if [ -f "coverage/lcov-report/index.html" ]; then
    read -p "📊 Open coverage report in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            open coverage/lcov-report/index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open coverage/lcov-report/index.html
        fi
    fi
fi
