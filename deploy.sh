#!/bin/bash

# Trippat Deployment Script
# This script automates the deployment process for AWS EC2

set -e

echo "🚀 Starting Trippat Deployment..."

# Configuration
PROJECT_NAME="trippat"
DOMAIN_NAME="your-domain.com"  # Replace with your domain
SSH_KEY_PATH="~/.ssh/your-key.pem"  # Replace with your SSH key path
EC2_HOST="ubuntu@your-ec2-ip"  # Replace with your EC2 instance

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        print_error "SSH is not installed"
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        print_error "SCP is not installed"
        exit 1
    fi
    
    print_status "All requirements satisfied ✓"
}

# Build frontend applications
build_frontends() {
    print_status "Building frontend applications..."
    
    # Build Admin Dashboard
    print_status "Building Admin Dashboard..."
    cd trippat-admin
    npm install
    npm run build
    cd ..
    
    # Build Customer App
    print_status "Building Customer App..."
    cd trippat-customer
    npm install
    npm run build
    cd ..
    
    print_status "Frontend builds completed ✓"
}

# Deploy to EC2
deploy_to_ec2() {
    print_status "Deploying to EC2 instance..."
    
    # Create deployment directory on server
    ssh -i $SSH_KEY_PATH $EC2_HOST "mkdir -p /var/www/$PROJECT_NAME"
    
    # Copy files to server
    print_status "Copying files to server..."
    scp -i $SSH_KEY_PATH -r . $EC2_HOST:/var/www/$PROJECT_NAME/
    
    # Install dependencies and start services on server
    ssh -i $SSH_KEY_PATH $EC2_HOST << 'ENDSSH'
        cd /var/www/trippat
        
        # Install backend dependencies
        npm install --only=production
        
        # Install PM2 globally if not installed
        if ! command -v pm2 &> /dev/null; then
            sudo npm install -g pm2
        fi
        
        # Stop existing processes
        pm2 stop ecosystem.config.js || true
        pm2 delete ecosystem.config.js || true
        
        # Start new processes
        pm2 start ecosystem.config.js
        pm2 save
        
        # Setup PM2 startup
        sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
ENDSSH
    
    print_status "Deployment completed ✓"
}

# Setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create Nginx configuration
    cat > nginx-site.conf << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # SSL Configuration (you'll need to obtain SSL certificates)
    # ssl_certificate /etc/nginx/ssl/cert.pem;
    # ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Admin Dashboard
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Customer App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files (uploads)
    location /uploads {
        alias /var/www/$PROJECT_NAME/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }
}
EOF
    
    # Copy Nginx config to server
    scp -i $SSH_KEY_PATH nginx-site.conf $EC2_HOST:/tmp/
    
    # Install and configure Nginx on server
    ssh -i $SSH_KEY_PATH $EC2_HOST << 'ENDSSH'
        # Install Nginx if not installed
        if ! command -v nginx &> /dev/null; then
            sudo apt update
            sudo apt install -y nginx
        fi
        
        # Copy site configuration
        sudo cp /tmp/nginx-site.conf /etc/nginx/sites-available/trippat
        sudo ln -sf /etc/nginx/sites-available/trippat /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test and reload Nginx
        sudo nginx -t && sudo systemctl reload nginx
        sudo systemctl enable nginx
ENDSSH
    
    # Clean up local temp file
    rm nginx-site.conf
    
    print_status "Nginx configuration completed ✓"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    ssh -i $SSH_KEY_PATH $EC2_HOST << ENDSSH
        # Install Certbot
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
        
        # Obtain SSL certificate
        sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
        
        # Setup auto-renewal
        sudo systemctl enable certbot.timer
ENDSSH
    
    print_status "SSL certificates configured ✓"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    ssh -i $SSH_KEY_PATH $EC2_HOST << 'ENDSSH'
        # Install monitoring tools
        sudo apt install -y htop iotop
        
        # Setup PM2 monitoring
        pm2 install pm2-logrotate
        pm2 set pm2-logrotate:max_size 10M
        pm2 set pm2-logrotate:retain 7
        
        # Setup basic health check script
        cat > /home/ubuntu/health-check.sh << 'EOF'
#!/bin/bash
# Basic health check for Trippat services

# Check if services are running
if ! pm2 list | grep -q "online"; then
    echo "Services are down, attempting restart..."
    pm2 restart all
    
    # Send notification (configure with your notification service)
    # curl -X POST "your-notification-webhook" -d "Trippat services restarted"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "Disk usage is at ${DISK_USAGE}%"
    # Send notification
fi
EOF
        
        chmod +x /home/ubuntu/health-check.sh
        
        # Add to crontab (runs every 5 minutes)
        (crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/health-check.sh") | crontab -
ENDSSH
    
    print_status "Monitoring setup completed ✓"
}

# Main deployment flow
main() {
    print_status "Starting deployment process..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "trippat-admin" ] || [ ! -d "trippat-customer" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    check_requirements
    
    # Ask for confirmation
    echo
    print_warning "This will deploy Trippat to EC2 instance: $EC2_HOST"
    print_warning "Domain: $DOMAIN_NAME"
    echo
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    build_frontends
    deploy_to_ec2
    setup_nginx
    
    # Ask about SSL setup
    echo
    read -p "Setup SSL certificates? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    setup_monitoring
    
    echo
    print_status "🎉 Deployment completed successfully!"
    print_status "Your application should be available at:"
    print_status "  Customer App: https://$DOMAIN_NAME"
    print_status "  Admin Dashboard: https://$DOMAIN_NAME/admin"
    print_status "  API: https://$DOMAIN_NAME/api"
    echo
    print_warning "Don't forget to:"
    print_warning "  1. Update DNS records to point to your EC2 instance"
    print_warning "  2. Configure environment variables on the server"
    print_warning "  3. Setup your payment gateway credentials"
    print_warning "  4. Test all functionality"
}

# Run main function
main "$@"