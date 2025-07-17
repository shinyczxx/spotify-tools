#!/bin/bash

# Test runner for new circuit board visual validation framework
# Author: GitHub Copilot
# Version: 1.0.0
# Date: 2025-01-16

set -e

echo "🔮 Circuit Board Visual Testing Framework"
echo "=========================================="

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

# Check if development server is running
echo "🔍 Checking development server..."
if curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo "✅ Development server is running on http://localhost:5175"
    SERVER_RUNNING=true
else
    echo "⚠️  Development server not detected. Starting server..."
    SERVER_RUNNING=false
fi

# Start development server if needed
if [ "$SERVER_RUNNING" = false ]; then
    echo "🚀 Starting Vite development server..."
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:5175 > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Server failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
fi

# Install Playwright if needed
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Installing Playwright..."
    npx playwright install
fi

# Run visual validation tests
echo ""
echo "🎯 Running Visual Validation Framework Tests..."
echo "----------------------------------------------"

# Run the comprehensive visual validation
echo "1️⃣ Running comprehensive visual validation..."
npx playwright test tests/visual-validation-framework.spec.ts --reporter=html

# Run integration tests with real React components
echo ""
echo "2️⃣ Running FlowLayout integration tests..."
npx playwright test tests/flow-layout-integration.spec.ts --reporter=html

# Generate test report summary
echo ""
echo "📊 Test Report Summary"
echo "====================="

# Count passed/failed tests from latest run
if [ -d "test-results" ]; then
    TOTAL_TESTS=$(find test-results -name "*.json" | wc -l)
    echo "Total test files: $TOTAL_TESTS"
fi

if [ -d "playwright-report" ]; then
    echo "📋 Detailed HTML report generated at: playwright-report/index.html"
    echo "🌐 Open the report with: npx playwright show-report"
fi

# Cleanup: Stop development server if we started it
if [ "$SERVER_RUNNING" = false ] && [ -n "$DEV_SERVER_PID" ]; then
    echo ""
    echo "🧹 Cleaning up..."
    kill $DEV_SERVER_PID 2>/dev/null || true
    echo "✅ Development server stopped"
fi

echo ""
echo "✨ Visual testing framework execution completed!"
echo ""
echo "📈 Key Test Areas Validated:"
echo "  • Panel content-based sizing and max-size scrolling"
echo "  • Global theme color integration across components"
echo "  • 45-degree path routing with minimum segment length"
echo "  • Responsive layout behavior for all aspect ratios"
echo "  • Solder point positioning accuracy"
echo "  • Circuit trace drawing and collision detection"
echo "  • Performance under various conditions"
echo ""
echo "🔧 Next Steps:"
echo "  • Review any failed tests in the HTML report"
echo "  • Update components based on test feedback"
echo "  • Run tests after each component modification"
echo "  • Add new test cases for custom features"
