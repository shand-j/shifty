#!/bin/bash

# Ollama Setup Script for Shifty AI Framework
set -e

OLLAMA_ENDPOINT=${OLLAMA_ENDPOINT:-"http://localhost:11434"}
MAX_RETRIES=30
RETRY_COUNT=0

echo "🤖 Setting up Ollama AI models..."

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama service to be ready..."
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "$OLLAMA_ENDPOINT/api/tags" > /dev/null 2>&1; then
        echo "✅ Ollama service is ready"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Attempt $RETRY_COUNT/$MAX_RETRIES - Ollama not ready yet, waiting 5 seconds..."
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Ollama service failed to start after $MAX_RETRIES attempts"
    exit 1
fi

# Function to check if model exists
model_exists() {
    curl -s "$OLLAMA_ENDPOINT/api/tags" | grep -q "\"name\":\"$1\""
}

# Function to pull model if it doesn't exist
pull_model() {
    local model_name=$1
    echo "📥 Checking model: $model_name"
    
    if model_exists "$model_name"; then
        echo "✅ Model $model_name already exists"
    else
        echo "📥 Pulling model: $model_name (this may take several minutes...)"
        
        # Start the pull request
        curl -X POST "$OLLAMA_ENDPOINT/api/pull" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$model_name\"}" \
            --max-time 1800 || {
            echo "❌ Failed to pull model: $model_name"
            return 1
        }
        
        # Wait for the model to be fully available
        echo "⏳ Waiting for $model_name to be ready..."
        local wait_count=0
        while [ $wait_count -lt 60 ]; do
            if model_exists "$model_name"; then
                echo "✅ Model $model_name is ready"
                break
            fi
            wait_count=$((wait_count + 1))
            sleep 5
        done
    fi
}

# Pull required models for Shifty
echo "📥 Pulling required AI models..."

# Primary model for test generation (8B parameters, good for complex reasoning)
pull_model "llama3.1:8b"

# Lightweight model for quick decisions (smaller, faster for selector healing)
pull_model "phi3:mini"

# Code-specialized model for code generation and analysis
pull_model "codellama:7b"

# Embedding model for semantic search and similarity
pull_model "nomic-embed-text"

echo "✅ All AI models are ready!"

# Test the models
echo "🧪 Testing AI models..."

# Test llama3.1:8b
echo "Testing llama3.1:8b..."
test_response=$(curl -s -X POST "$OLLAMA_ENDPOINT/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "llama3.1:8b",
        "prompt": "Generate a simple Playwright test that navigates to a page and checks the title. Respond with only the code, no explanations.",
        "stream": false,
        "options": {
            "temperature": 0.3,
            "max_tokens": 200
        }
    }' | grep -o '"done":true' || echo "")

if [ -n "$test_response" ]; then
    echo "✅ llama3.1:8b is working"
else
    echo "⚠️ llama3.1:8b test failed"
fi

# Test phi3:mini
echo "Testing phi3:mini..."
test_response=$(curl -s -X POST "$OLLAMA_ENDPOINT/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "phi3:mini",
        "prompt": "Suggest 3 alternative CSS selectors for: .broken-button",
        "stream": false,
        "options": {
            "temperature": 0.1,
            "max_tokens": 100
        }
    }' | grep -o '"done":true' || echo "")

if [ -n "$test_response" ]; then
    echo "✅ phi3:mini is working"
else
    echo "⚠️ phi3:mini test failed"
fi

# Show available models
echo "📋 Available models:"
curl -s "$OLLAMA_ENDPOINT/api/tags" | grep -o '"name":"[^"]*"' | sed 's/"name":"/  - /' | sed 's/"$//'

echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "Model usage guidelines:"
echo "  llama3.1:8b     - Complex test generation, reasoning tasks"
echo "  phi3:mini       - Quick selector healing, simple decisions" 
echo "  codellama:7b    - Code analysis, refactoring suggestions"
echo "  nomic-embed-text - Semantic search, similarity matching"
echo ""
echo "Ollama endpoint: $OLLAMA_ENDPOINT"
echo "API documentation: https://github.com/ollama/ollama/blob/main/docs/api.md"