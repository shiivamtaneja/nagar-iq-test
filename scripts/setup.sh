#!/bin/bash

# NagarIQ Setup Script
# This script sets up the NagarIQ development environment

echo "🚀 Setting up NagarIQ Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install global dependencies
echo "📦 Installing global dependencies..."
npm install -g expo-cli firebase-tools

# Setup frontend
echo "📱 Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# Setup backend
echo "⚙️ Setting up backend..."
cd ../backend
npm install
echo "✅ Backend dependencies installed"

# Go back to root
cd ..

echo "🎉 Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Firebase project at https://console.firebase.google.com"
echo "2. Replace Firebase config in frontend/src/services/firebase.js"
echo "3. Run 'firebase login' to authenticate Firebase CLI"
echo "4. Run 'cd frontend && npm start' to start the app"
echo "5. Run 'cd backend && firebase emulators:start' for local backend"
echo ""
echo "📖 See README.md for detailed instructions"