#!/bin/bash

# AWS Deployment Script for Trippat Platform
# This script simplifies deployment to AWS EC2

set -e  # Exit on error

# Configuration
EC2_HOST="3.72.21.168"
EC2_USER="ubuntu"
SSH_KEY="$HOME/.ssh/trippat-key.pem"
PROJECT_PATH="/var/www/trippat"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Trippat AWS Deployment${NC}"

# Function to check if SSH key exists
check_ssh_key() {
    if [ ! -f "$SSH_KEY" ]; then
        echo -e "${RED}❌ SSH key not found at $SSH_KEY${NC}"
        echo "Please update SSH_KEY variable with correct path"
        exit 1
    fi
}

# Function to execute remote command
remote_exec() {
    ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "$1"
}

# Function to check service status
check_service() {
    echo -e "${YELLOW}Checking $1 status...${NC}"
    remote_exec "curl -s -o /dev/null -w '%{http_code}' http://localhost:$2" || echo "000"
}

# Main deployment function
deploy() {
    echo -e "${GREEN}📦 Step 1: Pushing to GitHub${NC}"
    git add -A
    git commit -m "Deployment update $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
    git push origin main

    echo -e "${GREEN}📥 Step 2: Pulling latest code on AWS${NC}"
    remote_exec "cd $PROJECT_PATH && git pull origin main"

    echo -e "${GREEN}📦 Step 3: Installing dependencies${NC}"
    remote_exec "cd $PROJECT_PATH && npm install --production"
    remote_exec "cd $PROJECT_PATH/trippat-customer && npm install"
    remote_exec "cd $PROJECT_PATH/trippat-admin && npm install"

    echo -e "${GREEN}🏗️  Step 4: Building applications${NC}"
    # Skip build for now due to issues, run in dev mode
    echo "Running applications in development mode..."

    echo -e "${GREEN}🔄 Step 5: Restarting services${NC}"
    remote_exec "pm2 stop all || true"
    remote_exec "cd $PROJECT_PATH && pm2 start ecosystem.config.js || true"
    
    # If ecosystem.config.js doesn't exist, start manually
    remote_exec "cd $PROJECT_PATH && pm2 start npm --name 'trippat-backend' -- start || true"
    remote_exec "cd $PROJECT_PATH/trippat-customer && pm2 start npm --name 'trippat-customer' -- run dev || true"
    remote_exec "cd $PROJECT_PATH/trippat-admin && pm2 start npm --name 'trippat-admin' -- run dev || true"
    
    remote_exec "pm2 save"

    echo -e "${GREEN}✅ Step 6: Verifying deployment${NC}"
    sleep 10  # Wait for services to start
    
    BACKEND_STATUS=$(check_service "Backend API" "5001")
    CUSTOMER_STATUS=$(check_service "Customer App" "3000")
    ADMIN_STATUS=$(check_service "Admin App" "3001")

    echo -e "\n${GREEN}📊 Deployment Status:${NC}"
    echo "Backend API (5001): ${BACKEND_STATUS}"
    echo "Customer App (3000): ${CUSTOMER_STATUS}"
    echo "Admin App (3001): ${ADMIN_STATUS}"

    if [ "$BACKEND_STATUS" == "200" ] && [ "$CUSTOMER_STATUS" == "200" ] || [ "$CUSTOMER_STATUS" == "307" ] && [ "$ADMIN_STATUS" == "200" ] || [ "$ADMIN_STATUS" == "307" ]; then
        echo -e "\n${GREEN}✅ Deployment successful!${NC}"
        echo -e "🌐 Access your apps at:"
        echo -e "   Customer: http://$EC2_HOST:3000"
        echo -e "   Admin: http://$EC2_HOST:3001"
        echo -e "   API: http://$EC2_HOST:5001"
    else
        echo -e "\n${RED}❌ Some services failed to start. Check logs:${NC}"
        echo -e "   ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 logs'"
    fi
}

# Quick deployment (no dependency install)
quick_deploy() {
    echo -e "${GREEN}⚡ Quick deployment (code only)${NC}"
    
    git add -A
    git commit -m "Quick update $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes"
    git push origin main
    
    remote_exec "cd $PROJECT_PATH && git pull origin main"
    remote_exec "pm2 restart all"
    
    echo -e "${GREEN}✅ Quick deployment complete!${NC}"
}

# View logs
view_logs() {
    echo -e "${GREEN}📋 Viewing PM2 logs${NC}"
    remote_exec "pm2 logs --lines 50"
}

# Check status
check_status() {
    echo -e "${GREEN}📊 Checking service status${NC}"
    remote_exec "pm2 list"
    echo -e "\n${GREEN}🔍 Checking ports${NC}"
    remote_exec "sudo netstat -tlnp | grep -E ':(3000|3001|5001)'"
}

# Main menu
case "${1:-deploy}" in
    "deploy")
        check_ssh_key
        deploy
        ;;
    "quick")
        check_ssh_key
        quick_deploy
        ;;
    "logs")
        check_ssh_key
        view_logs
        ;;
    "status")
        check_ssh_key
        check_status
        ;;
    "ssh")
        check_ssh_key
        ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST"
        ;;
    *)
        echo "Usage: ./deploy-aws.sh [deploy|quick|logs|status|ssh]"
        echo "  deploy - Full deployment with dependency install"
        echo "  quick  - Quick deployment (code only)"
        echo "  logs   - View PM2 logs"
        echo "  status - Check service status"
        echo "  ssh    - SSH into server"
        ;;
esac