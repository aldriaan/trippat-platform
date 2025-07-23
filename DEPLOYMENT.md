# Trippat Deployment Guide

This guide walks you through deploying the Trippat travel booking platform to AWS and setting up payment gateway integration.

## 🚀 Quick Start

### 1. Create GitHub Repository

1. **Create a new repository on GitHub:**
   ```bash
   # Go to GitHub.com and create a new repository named 'trippat-backend'
   # Make it private if needed
   ```

2. **Initialize and push your code:**
   ```bash
   cd /Users/aldriaan/Documents/trippat-backend
   git init
   git add .
   git commit -m "Initial commit: Trippat travel booking platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/trippat-backend.git
   git push -u origin main
   ```

### 2. AWS Setup

#### 2.1 Create EC2 Instance

1. **Launch EC2 Instance:**
   - Instance Type: `t3.medium` or higher
   - OS: Ubuntu 20.04 LTS
   - Storage: 20GB+ SSD
   - Security Groups: Allow ports 22, 80, 443, 3000, 3001, 5000

2. **Configure Security Group:**
   ```
   SSH (22) - Your IP
   HTTP (80) - Anywhere
   HTTPS (443) - Anywhere
   Custom TCP (3000) - Anywhere (Customer App)
   Custom TCP (3001) - Anywhere (Admin Dashboard)
   Custom TCP (5000) - Anywhere (API)
   ```

#### 2.2 Setup EC2 Instance

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### 2.3 Clone and Setup Project

```bash
# Clone your repository
cd /var/www
sudo mkdir trippat
sudo chown ubuntu:ubuntu trippat
git clone https://github.com/YOUR_USERNAME/trippat-backend.git trippat
cd trippat

# Install dependencies
npm install
cd trippat-admin && npm install && npm run build
cd ../trippat-customer && npm install && npm run build
cd ..

# Create environment file
cp .env.production.example .env.production
# Edit .env.production with your actual values
nano .env.production

# Create uploads directory
mkdir -p uploads
sudo chown -R ubuntu:ubuntu uploads

# Start services with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Domain and SSL Setup

#### 3.1 Configure Domain

1. **Update DNS Records:**
   - Point your domain to your EC2 instance IP
   - Add A record: `your-domain.com` → `EC2_IP`
   - Add CNAME record: `www.your-domain.com` → `your-domain.com`

#### 3.2 Setup Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/trippat
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Dashboard
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Customer App (default)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/trippat/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/trippat /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### 3.3 Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 4. Payment Gateway Setup

#### 4.1 Stripe Integration

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create account and verify identity
   - Get API keys from Dashboard → Developers → API keys

2. **Configure Environment Variables:**
   ```bash
   # Add to .env.production
   STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

3. **Setup Webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/stripe-webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

#### 4.2 Test Payment Integration

1. **Use Stripe Test Mode:**
   ```bash
   # Use test keys for initial testing
   STRIPE_SECRET_KEY=sk_test_your-test-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key
   ```

2. **Test Cards:**
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

### 5. Database Setup

#### 5.1 MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Get connection string

2. **Configure Connection:**
   ```bash
   # Update .env.production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trippat_production
   ```

#### 5.2 Local MongoDB (Alternative)

```bash
# Create database user
mongo
use trippat_production
db.createUser({
  user: "trippat_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "trippat_production" }]
})
```

### 6. Environment Configuration

#### 6.1 Production Environment Variables

Edit `/var/www/trippat/.env.production`:

```bash
# Database
MONGODB_URI=your-mongodb-connection-string

# Authentication
JWT_SECRET=your-super-secure-jwt-secret

# Server
PORT=5000
NODE_ENV=production

# URLs
FRONTEND_URL=https://your-domain.com
ADMIN_URL=https://your-domain.com/admin

# Email (Gmail example)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@your-domain.com

# Payment
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-key
```

### 7. GitHub Actions Setup

#### 7.1 Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
EC2_INSTANCE_ID=i-1234567890abcdef0
DEPLOYMENT_BUCKET=your-s3-bucket
```

#### 7.2 Automated Deployment

The GitHub Actions workflow will automatically:
- Run tests on every push
- Deploy to production on main branch
- Run security scans
- Perform performance tests

### 8. Monitoring and Maintenance

#### 8.1 Setup Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop

# PM2 monitoring
pm2 install pm2-logrotate
pm2 monit

# Check logs
pm2 logs
```

#### 8.2 Backup Strategy

```bash
# Create backup script
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
# Backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/trippat"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --db trippat_production --out $BACKUP_DIR/db_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/trippat/uploads

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR s3://your-backup-bucket/ --recursive

# Clean old backups (keep 7 days)
find $BACKUP_DIR -mtime +7 -delete
```

```bash
# Make executable and add to crontab
chmod +x /home/ubuntu/backup.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh
```

### 9. Performance Optimization

#### 9.1 Enable GZIP Compression

```bash
# Edit Nginx config
sudo nano /etc/nginx/nginx.conf
```

```nginx
# Add to http block
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

#### 9.2 Setup Redis Cache (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 10. Security Best Practices

#### 10.1 Firewall Configuration

```bash
# Setup UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 10.2 Security Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 11. Testing Checklist

After deployment, test these features:

- [ ] **Frontend Access:**
  - [ ] Customer app loads at `https://your-domain.com`
  - [ ] Admin dashboard loads at `https://your-domain.com/admin`
  - [ ] API responds at `https://your-domain.com/api/health`

- [ ] **Authentication:**
  - [ ] User registration works
  - [ ] User login works
  - [ ] Admin login works

- [ ] **Core Features:**
  - [ ] Browse packages
  - [ ] Browse activities
  - [ ] Create bookings
  - [ ] Admin CRUD operations

- [ ] **Payment Testing:**
  - [ ] Payment form loads
  - [ ] Test card payments work
  - [ ] Webhooks receive events
  - [ ] Payment confirmation works

- [ ] **Performance:**
  - [ ] Page load times < 3 seconds
  - [ ] API response times < 500ms
  - [ ] Images load properly

### 12. Troubleshooting

#### Common Issues:

1. **Services not starting:**
   ```bash
   pm2 restart all
   pm2 logs
   ```

2. **Database connection issues:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string in .env.production
   ```

3. **SSL certificate issues:**
   ```bash
   sudo certbot renew
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Payment webhook issues:**
   ```bash
   # Check webhook URL in Stripe dashboard
   # Verify STRIPE_WEBHOOK_SECRET in environment
   # Check API logs for webhook errors
   ```

### 13. Support and Maintenance

- Monitor PM2 processes: `pm2 monit`
- Check application logs: `pm2 logs`
- Monitor system resources: `htop`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Database logs: `sudo tail -f /var/log/mongodb/mongod.log`

---

## 🎉 Congratulations!

Your Trippat platform is now live and ready for production use. Don't forget to:

1. Test all payment flows thoroughly
2. Set up monitoring and alerting
3. Create regular backups
4. Monitor performance metrics
5. Keep dependencies updated

For support, check the logs and refer to this guide or create an issue in the GitHub repository.