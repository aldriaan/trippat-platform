# AWS Deployment Guide for Trippat Platform

This guide provides a simplified process for deploying the Trippat platform to AWS EC2.

## Prerequisites

1. AWS Account with EC2 access
2. GitHub repository with your code
3. Basic knowledge of terminal/SSH

## Initial Setup (One-time)

### 1. Create EC2 Instance

1. Log into AWS Console
2. Launch EC2 instance:
   - **AMI**: Ubuntu Server 20.04 LTS or newer
   - **Instance Type**: t3.medium (minimum)
   - **Storage**: 20GB minimum
   - **Security Group**: Open ports 22, 80, 443, 3000, 3001, 5001

### 2. Connect to Your Instance

```bash
# Download your key pair (e.g., trippat-key.pem)
chmod 400 ~/Downloads/trippat-key.pem
mv ~/Downloads/trippat-key.pem ~/.ssh/

# Connect via SSH
ssh -i ~/.ssh/trippat-key.pem ubuntu@YOUR_EC2_IP
```

### 3. Run Setup Script

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup-aws.sh
chmod +x setup-aws.sh
./setup-aws.sh
```

The setup script will:
- Install Node.js, MongoDB, PM2
- Clone your repository
- Install dependencies
- Configure environment variables
- Start all services
- Create an admin user

## Daily Deployment Process

### Quick Deploy (Code changes only)

```bash
# From your local machine
./deploy-aws.sh quick
```

### Full Deploy (With dependency updates)

```bash
# From your local machine
./deploy-aws.sh deploy
```

### Check Status

```bash
./deploy-aws.sh status
```

### View Logs

```bash
./deploy-aws.sh logs
```

### SSH to Server

```bash
./deploy-aws.sh ssh
```

## Environment Configuration

### Update API URLs

Edit `deploy-aws.sh` and update:
```bash
EC2_HOST="YOUR_EC2_IP"
SSH_KEY="~/.ssh/your-key.pem"
```

### Backend Environment (.env.production)

**Note**: A sample `.env.production.local` file is included that contains the exact configuration used on AWS. Copy this to `.env.production` on your server.

```env
MONGODB_URI=mongodb://localhost:27017/trippat_production
JWT_SECRET=your-super-secure-jwt-secret
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_IP:3000
ADMIN_URL=http://YOUR_EC2_IP:3001
```

### Frontend Environment

The deployment script automatically creates:
- `trippat-admin/.env.local`
- `trippat-customer/.env.local`

With correct API URLs pointing to your EC2 instance.

## Troubleshooting

### Services Not Starting

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart all services
pm2 restart all
```

### Port Already in Use

```bash
# Kill all PM2 processes
pm2 kill

# Start fresh
pm2 start ecosystem.config.js
```

### MongoDB Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Build Errors

Currently running in development mode to avoid build issues. To enable production builds:

1. Fix all TypeScript/ESLint errors
2. Update ecosystem.config.js to use `npm start` instead of `npm run dev`
3. Build applications before starting

## Security Best Practices

1. **Use Environment Variables**: Never commit sensitive data
2. **Update Security Groups**: Only open necessary ports
3. **Enable Firewall**: 
   ```bash
   sudo ufw allow 22,80,443,3000,3001,5001/tcp
   sudo ufw enable
   ```
4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```

## Cost Optimization

1. **Use t3.small** for testing (cheaper)
2. **Stop instance** when not in use
3. **Use AWS Lightsail** for predictable pricing
4. **Enable CloudWatch** monitoring

## Next Steps

1. **Domain Setup**: Point your domain to EC2 IP
2. **SSL Certificate**: Use Let's Encrypt with Nginx
3. **Backup Strategy**: Regular MongoDB backups
4. **Monitoring**: Set up PM2 monitoring

## Common Commands

```bash
# View running processes
pm2 list

# Monitor in real-time
pm2 monit

# Restart specific service
pm2 restart trippat-backend
pm2 restart trippat-customer
pm2 restart trippat-admin

# Save PM2 configuration
pm2 save

# Database backup
mongodump --db trippat_production --out backup/

# Check disk space
df -h

# Check memory usage
free -m
```

## Support

If you encounter issues:
1. Check logs: `pm2 logs`
2. Verify environment variables are set
3. Ensure all ports are open in Security Group
4. Check MongoDB is running

Remember: The deployment script handles most of these steps automatically!