# AWS Deployment Guide for Trippat Backend

## Quick Deployment Steps

### 1. SSH to AWS Server
```bash
ssh ec2-user@3.72.21.168
# or use your SSH key
ssh -i path/to/your-key.pem ec2-user@3.72.21.168
```

### 2. Navigate to Project Directory
```bash
cd /home/ec2-user/trippat-backend
# or wherever your project is located
```

### 3. Pull Latest Changes from GitHub
```bash
git pull origin main
```

### 4. Install Dependencies (if package.json changed)
```bash
npm install
```

### 5. Restart the Application
```bash
# Using PM2
pm2 restart all

# Or restart specific app
pm2 restart trippat-backend

# Or if using systemd
sudo systemctl restart trippat-backend
```

### 6. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs trippat-backend --lines 50

# Test the new endpoint
curl http://localhost:5001/api/hotels/json
```

## New Endpoint Added

**Hotel Creation (JSON):** `POST /api/hotels/json`
- Accepts JSON payload
- Automatically downloads images from URLs
- Designed for n8n automation

## Environment Variables

Make sure these are set:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=production
```

## Troubleshooting

If the server doesn't start:
1. Check logs: `pm2 logs`
2. Check port availability: `sudo lsof -i :5001`
3. Check MongoDB connection
4. Verify all environment variables are set

## Testing the New Endpoint

```bash
# Get auth token first
curl -X POST http://3.72.21.168:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trippat.com","password":"your_password"}'

# Test hotel creation
curl -X POST http://3.72.21.168:5001/api/hotels/json \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel","description":"Test","location":{"address":"Test Address","city":"Dubai"},"starRating":4,"basePrice":100,"totalRooms":50}'
```