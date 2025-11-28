#!/bin/bash

# Frontend Deployment Script
# This script installs dependencies, builds the Next.js app, and runs it with PM2

set -e

echo "🚀 Starting frontend deployment..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building Next.js application..."
pnpm build

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 processes..."
pm2 stop nextjs || true
pm2 delete nextjs || true

# Create PM2 ecosystem file
echo "📝 Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "nextjs",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3002",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3002,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"
    }
  }]
};
EOF

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

echo "✅ Frontend deployment completed!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs nextjs"
echo "  - Stop app: pm2 stop nextjs"
echo "  - Restart app: pm2 restart nextjs"
echo "  - Monitor: pm2 monit"


