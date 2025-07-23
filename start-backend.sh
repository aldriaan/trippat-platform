#!/bin/bash

echo "🚀 Starting Trippat Backend Server..."
echo "📍 Working directory: $(pwd)"
echo "🔧 Environment: development"
echo "🌐 Port: 5000"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting server on port 5000..."
npm run dev