#!/bin/bash

# AWS EC2 Setup Script for Trippat Platform
# Run this once on a fresh Ubuntu 20.04+ EC2 instance

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Trippat AWS Setup${NC}"

# Update system
echo -e "${GREEN}📦 Step 1: Updating system packages${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo -e "${GREEN}📦 Step 2: Installing Node.js 18${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo -e "${GREEN}📦 Step 3: Installing MongoDB${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
echo -e "${GREEN}📦 Step 4: Installing PM2${NC}"
sudo npm install -g pm2

# Install Git
echo -e "${GREEN}📦 Step 5: Installing Git${NC}"
sudo apt install -y git

# Create project directory
echo -e "${GREEN}📁 Step 6: Creating project directory${NC}"
sudo mkdir -p /var/www/trippat
sudo chown $USER:$USER /var/www/trippat

# Create log directory
sudo mkdir -p /var/log/trippat
sudo chown $USER:$USER /var/log/trippat

# Clone repository
echo -e "${GREEN}📥 Step 7: Cloning repository${NC}"
cd /var/www
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL
git clone "$REPO_URL" trippat
cd trippat

# Install dependencies
echo -e "${GREEN}📦 Step 8: Installing project dependencies${NC}"
npm install --production
cd trippat-customer && npm install && cd ..
cd trippat-admin && npm install && cd ..

# Create environment files
echo -e "${GREEN}🔧 Step 9: Creating environment files${NC}"
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

cat > .env.production << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/trippat_production

# Authentication
JWT_SECRET=trippat-super-secure-jwt-secret-production-2024

# Server Configuration
PORT=5001
NODE_ENV=production

# Frontend URLs
FRONTEND_URL=http://${EC2_IP}:3000
ADMIN_URL=http://${EC2_IP}:3001

# Email Configuration (update with real credentials)
EMAIL_USER=placeholder@gmail.com
EMAIL_PASS=placeholder-password
EMAIL_FROM=noreply@trippat.com

# API URLs for frontend apps
NEXT_PUBLIC_API_URL=http://${EC2_IP}:5001/api
NEXT_PUBLIC_API_BASE_URL=http://${EC2_IP}:5001
EOF

# Create admin .env.local
cat > trippat-admin/.env.local << EOF
NEXT_PUBLIC_API_URL=http://${EC2_IP}:5001/api
NEXT_PUBLIC_API_BASE_URL=http://${EC2_IP}:5001
EOF

# Create customer .env.local
cat > trippat-customer/.env.local << EOF
NEXT_PUBLIC_API_URL=http://${EC2_IP}:5001/api
NEXT_PUBLIC_API_BASE_URL=http://${EC2_IP}:5001
EOF

# Update ecosystem.config.js with correct IP
sed -i "s/3.72.21.168/${EC2_IP}/g" ecosystem.config.js

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Start services
echo -e "${GREEN}🚀 Step 10: Starting services with PM2${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | sudo bash

# Create admin user
echo -e "${GREEN}👤 Step 11: Creating admin user${NC}"
node << EOF
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/trippat_production');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    email: 'admin@trippat.com',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true
  });
  console.log('Admin user created: admin@trippat.com / admin123');
  process.exit(0);
}

createAdmin().catch(console.error);
EOF

# Display success message
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "🌐 Your Trippat platform is accessible at:"
echo -e "   Customer App: http://${EC2_IP}:3000"
echo -e "   Admin Dashboard: http://${EC2_IP}:3001"
echo -e "   API: http://${EC2_IP}:5001"
echo -e "\n📧 Admin login: admin@trippat.com / admin123"
echo -e "\n📝 To deploy updates, use: ./deploy-aws.sh"
echo -e "📋 To view logs: pm2 logs"
echo -e "📊 To check status: pm2 status"